# Design: Pipeline de Scraping de Eventos para São Paulo

**Data:** 2026-04-13  
**Status:** Aprovado  
**Projeto:** hoje-tem

---

## Contexto

O projeto hoje-tem é uma plataforma de descoberta de eventos em São Paulo. Atualmente a base de dados de eventos é populada manualmente. O objetivo deste trabalho é criar um pipeline automatizado que scrapeie 6 sites de eventos periodicamente, extraia dados estruturados com IA e os insira na tabela `eventos` do Supabase — sem intervenção humana.

O projeto já possui:
- Tabela `eventos` com schema completo (nome, data, local, preço, categoria, etc.)
- Edge Function `extrair-evento` com código Firecrawl + Gemini (não deployada — não será usada neste pipeline)
- Arquivo workflow `N8N_MCP/workflows/scraper-eventos.json` (template, nunca importado)
- Instância n8n em `https://n8n.sapientiabr.cloud` com acesso via MCP

**Decisão de arquitetura:** toda a lógica fica no n8n (Abordagem B). Sem edge functions no pipeline de scraping. O n8n chama Firecrawl, Claude API e Supabase REST diretamente.

---

## Componentes

### 1. Migration Supabase — Novas Tabelas

**Arquivo:** `hoje-tem/supabase/migrations/<timestamp>_scraper_tables.sql`

```sql
-- Catálogo de fontes de scraping
CREATE TABLE public.fontes_scraper (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  url_base TEXT NOT NULL,
  url_listagem TEXT NOT NULL,
  tipo TEXT DEFAULT 'firecrawl',
  ativo BOOLEAN DEFAULT true,
  intervalo_minutos INTEGER DEFAULT 60,
  config JSONB DEFAULT '{}',
  ultima_execucao TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.fontes_scraper ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON public.fontes_scraper
  USING (true) WITH CHECK (true);

-- Log de execuções do scraper
CREATE TABLE public.scraper_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fonte_id UUID REFERENCES public.fontes_scraper(id),
  fonte_nome TEXT,
  status TEXT DEFAULT 'iniciado',
  urls_encontradas INTEGER DEFAULT 0,
  eventos_inseridos INTEGER DEFAULT 0,
  eventos_duplicados INTEGER DEFAULT 0,
  erros JSONB DEFAULT '[]',
  iniciado_at TIMESTAMPTZ DEFAULT now(),
  concluido_at TIMESTAMPTZ,
  metadados JSONB DEFAULT '{}'
);

ALTER TABLE public.scraper_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON public.scraper_jobs
  USING (true) WITH CHECK (true);
```

**Constraint de dedup em `eventos`:**
```sql
ALTER TABLE public.eventos
  ADD CONSTRAINT eventos_link_origem_unique UNIQUE (link_origem);
```

**Seed das 6 fontes:**

| nome | url_listagem | config.url_pattern |
|------|--------------|--------------------|
| Sympla SP | `https://www.sympla.com.br/eventos/sao-paulo--sp` | `/evento/` |
| Eventbrite SP | `https://www.eventbrite.com.br/d/brazil--s%C3%A3o-paulo/events/` | `/e/` |
| Ticketmaster BR | `https://www.ticketmaster.com.br/br/pesquisa?q=sao+paulo` | `/br/ingressos/` |
| Ticket360 SP | `https://www.ticket360.com.br/cidade/sao-paulo` | `/evento/` |
| Guia da Semana SP | `https://www.guiadasemana.com.br/sao-paulo/eventos` | `/sao-paulo/` |
| Catracalivre Gira | `https://catracalivre.com.br/gira/` | `/gira/` |

---

### 2. Workflow n8n — "Hoje Tem: Scraper de Eventos"

Criado via MCP tools. Arquitetura linear com loop por fonte e sub-loop por URL.

#### Fluxo principal

```
[1] Schedule Trigger — a cada 1 hora
         ↓
[2] HTTP Request — GET Supabase REST
    /fontes_scraper?ativo=eq.true&select=*
    Headers: apikey, Authorization (service role)
         ↓
[3] Split In Batches — 1 fonte por vez
         ↓
[4] HTTP Request — POST Supabase REST
    INSERT scraper_jobs {fonte_id, fonte_nome, status: 'iniciado'}
    Retorna o job_id para uso posterior
         ↓
[5] HTTP Request — POST Firecrawl /v1/map
    url: {{ $json.url_listagem }}
    Retorna lista de todas as URLs descobertas no site
         ↓
[6] Code Node — Filtrar URLs
    - Filtra por config.url_pattern
    - Remove duplicatas
    - Limita a 20 URLs por fonte
    - Retorna array com { url, fonte_nome, job_id }
         ↓
[7] Split In Batches — 5 URLs por vez
         ↓
[8] HTTP Request — POST Firecrawl /v1/scrape
    url: {{ $json.url }}
    formats: ['markdown']
    onlyMainContent: true
         ↓
[9] HTTP Request — POST Claude API
    model: claude-haiku-4-5-20251001
    Prompt de extração estruturada (ver abaixo)
         ↓
[10] Code Node — Validar e Normalizar
    - Verifica nome obrigatório
    - Normaliza data para ISO8601
    - Garante cidade='São Paulo', estado='SP' se vazio
    - origem = nome da fonte
         ↓
[11] HTTP Request — POST Supabase REST
    INSERT em eventos com header Prefer: resolution=ignore-duplicates
    onConflict: link_origem → ignora, não sobrescreve dados existentes
         ↓
[12] Aggregate — Junta resultados de todas as URLs
    Soma eventos_inseridos, coleta erros
         ↓
[13] HTTP Request — PATCH Supabase REST
    UPDATE scraper_jobs SET status='concluido',
    eventos_inseridos=N, concluido_at=now()
```

#### Prompt Claude (Nó 9)

```
Você extrai dados de eventos de conteúdo markdown de páginas web.

Extraia APENAS do conteúdo fornecido:
- nome: nome do evento (obrigatório)
- data: data/hora início em ISO8601 (YYYY-MM-DDTHH:mm:ss)
- data_fim: data/hora fim em ISO8601 (null se não encontrado)
- local: nome do local/venue
- endereco: endereço completo
- cidade: cidade (padrão: São Paulo)
- estado: sigla UF (padrão: SP)
- preco: menor preço em reais como número (0 se gratuito, null se não encontrado)
- preco_max: maior preço se faixa de preço (null se único preço)
- categoria: UMA de: Música, Festa, Cultura, Teatro, Gastronomia, Esporte, Infantil, Business, Outro
- imagem: URL absoluta da imagem principal do evento (null se não encontrada)

Responda APENAS com JSON válido. Sem texto adicional.
```

#### Tratamento de Erros

- Nós 8, 9, 11 têm `Continue On Fail: true` — URLs individuais não param o fluxo
- Code node 10 descarta items sem `nome`
- Nó final (13) atualiza job com `status='erro'` se `eventos_inseridos=0` e `erros.length>0`
- Error Workflow separado captura falhas catastróficas e atualiza o job

---

### 3. Credenciais necessárias no n8n

| Credencial n8n | Tipo | Valor |
|----------------|------|-------|
| `supabase-hoje-tem` | Header Auth | `apikey: <service_role_key>` |
| `firecrawl-api` | Header Auth | `Authorization: Bearer <fc-key>` |
| `claude-api` | Header Auth | `x-api-key: <anthropic-key>` |

---

## Verificação

1. **Rodar migration** no Supabase Dashboard (SQL Editor) e confirmar tabelas criadas
2. **Verificar seed** — `SELECT * FROM fontes_scraper` deve retornar 6 linhas
3. **Testar manualmente** no n8n: executar workflow com 1 fonte (Sympla), verificar:
   - Job criado em `scraper_jobs` com status `iniciado`
   - URLs retornadas pelo Firecrawl Map
   - Pelo menos 1 evento inserido em `eventos`
   - Job atualizado para `concluido` com contagem correta
4. **Verificar dedup** — rodar segunda vez, checar que `eventos_duplicados` aumenta, não `eventos_inseridos`
5. **Verificar schedule** — aguardar próxima execução automática (1h) e confirmar logs

---

## Arquivos a criar/modificar

| Arquivo | Ação |
|---------|------|
| `hoje-tem/supabase/migrations/YYYYMMDDHHMMSS_scraper_tables.sql` | Criar |
| n8n workflow "Hoje Tem: Scraper de Eventos" | Criar via MCP |
