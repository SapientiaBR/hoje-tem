# Hoje Tem: Scraper de Eventos SP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pipeline automático no n8n que descobre e extrai eventos de 6 sites brasileiros para a tabela `eventos` do Supabase, rodando a cada hora.

**Architecture:** 100% n8n (Approach B). n8n busca fontes ativas no Supabase via REST, usa Firecrawl para descobrir e scrapear URLs de eventos, Claude Haiku para extrair dados estruturados, e insere na tabela `eventos` com deduplicação por `link_origem`. Uma migration Supabase cria as tabelas de suporte `fontes_scraper` e `scraper_jobs`.

**Tech Stack:** n8n MCP (`n8n-mcp-tools-expert`), Firecrawl API, Claude Haiku (`claude-haiku-4-5-20251001`), Supabase REST API, PostgreSQL

---

## Credenciais necessárias antes de começar

Você precisará de 3 chaves de API para configurar o workflow:

| Chave | Onde obter |
|-------|-----------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role |
| `FIRECRAWL_API_KEY` | firecrawl.dev/app/api-keys |
| `ANTHROPIC_API_KEY` | console.anthropic.com/settings/keys |

A anon key do Supabase já está no `.env`:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkeWd5ZGd2eGxuZHJvaW1yamx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NTA1ODQsImV4cCI6MjA4MDUyNjU4NH0.at6BNi1sSlYMpHWsUpkErel6QAGwAeK9qNuBhjoWceQ
```

---

## Task 1: Migration Supabase

**Files:**
- Criar: `hoje-tem/supabase/migrations/20260413000000_scraper_tables.sql`

- [ ] **Step 1.1: Criar o arquivo de migration**

Crie o arquivo `hoje-tem/supabase/migrations/20260413000000_scraper_tables.sql` com o conteúdo:

```sql
-- ==============================================
-- Migration: scraper_tables
-- Tabelas de suporte ao pipeline de scraping
-- ==============================================

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

CREATE POLICY "Service role full access fontes_scraper"
ON public.fontes_scraper FOR ALL USING (true) WITH CHECK (true);

-- Log de execuções do scraper
CREATE TABLE public.scraper_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fonte_id UUID REFERENCES public.fontes_scraper(id) ON DELETE SET NULL,
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

CREATE POLICY "Service role full access scraper_jobs"
ON public.scraper_jobs FOR ALL USING (true) WITH CHECK (true);

-- Constraint de deduplicação em eventos (link_origem já existe como coluna)
ALTER TABLE public.eventos
  ADD CONSTRAINT eventos_link_origem_unique UNIQUE (link_origem);

-- Seed: 6 fontes
INSERT INTO public.fontes_scraper (nome, url_base, url_listagem, config) VALUES
(
  'Sympla SP',
  'https://www.sympla.com.br',
  'https://www.sympla.com.br/eventos/sao-paulo--sp',
  '{"url_pattern": "/evento/", "max_urls": 20}'
),
(
  'Eventbrite SP',
  'https://www.eventbrite.com.br',
  'https://www.eventbrite.com.br/d/brazil--s%C3%A3o-paulo/events/',
  '{"url_pattern": "eventbrite.com.br/e/", "max_urls": 20}'
),
(
  'Ticketmaster BR',
  'https://www.ticketmaster.com.br',
  'https://www.ticketmaster.com.br/br/pesquisa?q=sao+paulo',
  '{"url_pattern": "/br/ingressos/", "max_urls": 20}'
),
(
  'Ticket360 SP',
  'https://www.ticket360.com.br',
  'https://www.ticket360.com.br/cidade/sao-paulo',
  '{"url_pattern": "/evento/", "max_urls": 20}'
),
(
  'Guia da Semana SP',
  'https://www.guiadasemana.com.br',
  'https://www.guiadasemana.com.br/sao-paulo/eventos',
  '{"url_pattern": "guiadasemana.com.br/", "max_urls": 20}'
),
(
  'Catracalivre Gira',
  'https://catracalivre.com.br',
  'https://catracalivre.com.br/gira/',
  '{"url_pattern": "catracalivre.com.br/", "max_urls": 20}'
);
```

- [ ] **Step 1.2: Executar a migration no Supabase**

Abrir Supabase Dashboard → SQL Editor → New query → colar o conteúdo acima → Run.

- [ ] **Step 1.3: Verificar a migration**

Executar no SQL Editor e confirmar resultados esperados:

```sql
-- Deve retornar 6 linhas
SELECT nome, url_listagem FROM fontes_scraper ORDER BY nome;

-- Deve retornar as colunas da tabela
SELECT column_name FROM information_schema.columns
WHERE table_name = 'scraper_jobs' ORDER BY column_name;

-- Deve incluir eventos_link_origem_unique
SELECT constraint_name FROM information_schema.table_constraints
WHERE table_name = 'eventos' AND constraint_type = 'UNIQUE';
```

---

## Task 2: Criar Workflow n8n via MCP

**Fluxo completo do workflow:**
```
Schedule (1h) → GET Fontes → [Loop Fontes: 1 por vez]
  → POST Job → Firecrawl Map → Code: Filtrar URLs
  → [Loop URLs: 3 por vez]
    → Firecrawl Scrape → Code: Preparar Prompt
    → Claude API → Code: Normalizar → POST Supabase
  → [Inner loop back]
  → [Loop URLs done] → Code: Prep Job Update → PATCH Job
  → [Outer loop back]
```

- [ ] **Step 2.1: Criar o workflow base via MCP**

Chamar `n8n_create_workflow` com o seguinte JSON completo:

```json
{
  "name": "Hoje Tem: Scraper de Eventos SP",
  "nodes": [
    {
      "name": "A cada 1 hora",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [240, 300],
      "parameters": {
        "rule": {
          "interval": [{ "field": "hours", "hoursInterval": 1 }]
        }
      }
    },
    {
      "name": "Buscar Fontes Ativas",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [460, 300],
      "parameters": {
        "method": "GET",
        "url": "https://wdygydgvxlndroimrjlt.supabase.co/rest/v1/fontes_scraper",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            { "name": "ativo", "value": "eq.true" },
            { "name": "select", "value": "*" },
            { "name": "order", "value": "nome.asc" }
          ]
        },
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "apikey", "value": "SUPABASE_ANON_KEY" },
            { "name": "Authorization", "value": "Bearer SUPABASE_SERVICE_ROLE_KEY" }
          ]
        }
      }
    },
    {
      "name": "Loop Fontes",
      "type": "n8n-nodes-base.splitInBatches",
      "typeVersion": 3.0,
      "position": [680, 300],
      "parameters": {
        "batchSize": 1,
        "options": {}
      }
    },
    {
      "name": "Criar Job",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [900, 300],
      "parameters": {
        "method": "POST",
        "url": "https://wdygydgvxlndroimrjlt.supabase.co/rest/v1/scraper_jobs",
        "sendBody": true,
        "contentType": "json",
        "body": "={{ JSON.stringify({ fonte_id: $json.id, fonte_nome: $json.nome, status: 'iniciado' }) }}",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "apikey", "value": "SUPABASE_ANON_KEY" },
            { "name": "Authorization", "value": "Bearer SUPABASE_SERVICE_ROLE_KEY" },
            { "name": "Prefer", "value": "return=representation" },
            { "name": "Content-Type", "value": "application/json" }
          ]
        }
      }
    },
    {
      "name": "Firecrawl Map",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [1120, 300],
      "parameters": {
        "method": "POST",
        "url": "https://api.firecrawl.dev/v1/map",
        "sendBody": true,
        "contentType": "json",
        "body": "={{ JSON.stringify({ url: $('Loop Fontes').item.json.url_listagem, limit: 100 }) }}",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "Authorization", "value": "Bearer FIRECRAWL_API_KEY" },
            { "name": "Content-Type", "value": "application/json" }
          ]
        },
        "options": { "timeout": 30000 },
        "continueOnFail": true
      }
    },
    {
      "name": "Filtrar e Expandir URLs",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2.0,
      "position": [1340, 300],
      "parameters": {
        "jsCode": "const mapResult = $input.first().json;\nconst allUrls = mapResult.links || [];\n\nconst fonte = $('Loop Fontes').item.json;\nconst jobArr = $('Criar Job').item.json;\nconst job = Array.isArray(jobArr) ? jobArr[0] : jobArr;\n\nconst urlPattern = fonte.config?.url_pattern || '';\nconst maxUrls = fonte.config?.max_urls || 20;\n\nconst seen = new Set();\nconst filtered = allUrls\n  .filter(url => typeof url === 'string' && (!urlPattern || url.includes(urlPattern)))\n  .filter(url => {\n    if (seen.has(url)) return false;\n    seen.add(url);\n    return true;\n  })\n  .slice(0, maxUrls);\n\nif (filtered.length === 0) return [];\n\nreturn filtered.map(url => ({\n  json: {\n    url,\n    fonte_id: fonte.id,\n    fonte_nome: fonte.nome,\n    job_id: job?.id\n  }\n}));"
      }
    },
    {
      "name": "Loop URLs",
      "type": "n8n-nodes-base.splitInBatches",
      "typeVersion": 3.0,
      "position": [1560, 300],
      "parameters": {
        "batchSize": 3,
        "options": {}
      }
    },
    {
      "name": "Firecrawl Scrape",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [1780, 300],
      "parameters": {
        "method": "POST",
        "url": "https://api.firecrawl.dev/v1/scrape",
        "sendBody": true,
        "contentType": "json",
        "body": "={{ JSON.stringify({ url: $json.url, formats: ['markdown'], onlyMainContent: true }) }}",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "Authorization", "value": "Bearer FIRECRAWL_API_KEY" },
            { "name": "Content-Type", "value": "application/json" }
          ]
        },
        "options": { "timeout": 30000 },
        "continueOnFail": true
      }
    },
    {
      "name": "Preparar Prompt Claude",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2.0,
      "position": [2000, 300],
      "parameters": {
        "jsCode": "const scrapeResult = $input.first().json;\nconst markdown = scrapeResult.data?.markdown || '';\n\nif (!markdown || markdown.length < 100) return [];\n\nconst urlItem = $('Loop URLs').item.json;\n\nreturn [{\n  json: {\n    _url: urlItem.url,\n    _fonte_nome: urlItem.fonte_nome,\n    _job_id: urlItem.job_id,\n    model: 'claude-haiku-4-5-20251001',\n    max_tokens: 1024,\n    messages: [{\n      role: 'user',\n      content: `Extraia dados de evento desta página web.\\n\\nURL: ${urlItem.url}\\n\\nConteúdo:\\n${markdown.slice(0, 5000)}\\n\\nRetorne APENAS JSON válido:\\n{\\n  \"nome\": \"string obrigatório\",\\n  \"data\": \"ISO8601 ou null\",\\n  \"data_fim\": \"ISO8601 ou null\",\\n  \"local\": \"string ou null\",\\n  \"endereco\": \"string ou null\",\\n  \"cidade\": \"São Paulo\",\\n  \"estado\": \"SP\",\\n  \"preco\": \"número ou null\",\\n  \"preco_max\": \"número ou null\",\\n  \"categoria\": \"Música|Festa|Cultura|Teatro|Gastronomia|Esporte|Infantil|Business|Outro\",\\n  \"imagem\": \"URL absoluta ou null\"\\n}\\nSe não for uma página de evento específico, retorne: {\"nome\": null}`\n    }]\n  }\n}];"
      }
    },
    {
      "name": "Claude API",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [2220, 300],
      "parameters": {
        "method": "POST",
        "url": "https://api.anthropic.com/v1/messages",
        "sendBody": true,
        "contentType": "json",
        "body": "={{ JSON.stringify({ model: $json.model, max_tokens: $json.max_tokens, messages: $json.messages }) }}",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "x-api-key", "value": "ANTHROPIC_API_KEY" },
            { "name": "anthropic-version", "value": "2023-06-01" },
            { "name": "Content-Type", "value": "application/json" }
          ]
        },
        "options": { "timeout": 30000 },
        "continueOnFail": true
      }
    },
    {
      "name": "Normalizar Evento",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2.0,
      "position": [2440, 300],
      "parameters": {
        "jsCode": "const claudeResp = $input.first().json;\nconst prev = $('Preparar Prompt Claude').item.json;\n\nlet eventData = null;\ntry {\n  const text = claudeResp.content?.[0]?.text || '';\n  const match = text.match(/\\{[\\s\\S]*\\}/);\n  if (match) eventData = JSON.parse(match[0]);\n} catch (e) { return []; }\n\nif (!eventData?.nome || eventData.nome === null) return [];\n\nconst categorias = ['Música','Festa','Cultura','Teatro','Gastronomia','Esporte','Infantil','Business','Outro'];\n\nreturn [{\n  json: {\n    nome: String(eventData.nome).trim().slice(0, 500),\n    descricao: eventData.descricao ? String(eventData.descricao).slice(0, 1000) : null,\n    data: eventData.data || null,\n    data_fim: eventData.data_fim || null,\n    local: eventData.local ? String(eventData.local).slice(0, 255) : 'A confirmar',\n    endereco: eventData.endereco ? String(eventData.endereco).slice(0, 500) : null,\n    cidade: eventData.cidade || 'São Paulo',\n    estado: eventData.estado || 'SP',\n    preco: typeof eventData.preco === 'number' ? eventData.preco : 0,\n    preco_max: typeof eventData.preco_max === 'number' ? eventData.preco_max : null,\n    categoria: categorias.includes(eventData.categoria) ? eventData.categoria : 'Outro',\n    imagem: eventData.imagem || null,\n    link_origem: prev._url,\n    origem: prev._fonte_nome,\n    status: 'publicado'\n  }\n}];"
      }
    },
    {
      "name": "Inserir Evento",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [2660, 300],
      "parameters": {
        "method": "POST",
        "url": "https://wdygydgvxlndroimrjlt.supabase.co/rest/v1/eventos",
        "sendBody": true,
        "contentType": "json",
        "body": "={{ JSON.stringify($json) }}",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "apikey", "value": "SUPABASE_ANON_KEY" },
            { "name": "Authorization", "value": "Bearer SUPABASE_SERVICE_ROLE_KEY" },
            { "name": "Prefer", "value": "resolution=ignore-duplicates,return=minimal" },
            { "name": "Content-Type", "value": "application/json" }
          ]
        },
        "continueOnFail": true
      }
    },
    {
      "name": "Finalizar Job",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [1560, 500],
      "parameters": {
        "method": "PATCH",
        "url": "={{ 'https://wdygydgvxlndroimrjlt.supabase.co/rest/v1/scraper_jobs?id=eq.' + $('Criar Job').item.json[0].id }}",
        "sendBody": true,
        "contentType": "json",
        "body": "={{ JSON.stringify({ status: 'concluido', concluido_at: new Date().toISOString() }) }}",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "apikey", "value": "SUPABASE_ANON_KEY" },
            { "name": "Authorization", "value": "Bearer SUPABASE_SERVICE_ROLE_KEY" },
            { "name": "Content-Type", "value": "application/json" }
          ]
        },
        "continueOnFail": true
      }
    }
  ],
  "connections": {
    "A cada 1 hora": {
      "main": [[{ "node": "Buscar Fontes Ativas", "type": "main", "index": 0 }]]
    },
    "Buscar Fontes Ativas": {
      "main": [[{ "node": "Loop Fontes", "type": "main", "index": 0 }]]
    },
    "Loop Fontes": {
      "main": [
        [{ "node": "Criar Job", "type": "main", "index": 0 }],
        []
      ]
    },
    "Criar Job": {
      "main": [[{ "node": "Firecrawl Map", "type": "main", "index": 0 }]]
    },
    "Firecrawl Map": {
      "main": [[{ "node": "Filtrar e Expandir URLs", "type": "main", "index": 0 }]]
    },
    "Filtrar e Expandir URLs": {
      "main": [[{ "node": "Loop URLs", "type": "main", "index": 0 }]]
    },
    "Loop URLs": {
      "main": [
        [{ "node": "Firecrawl Scrape", "type": "main", "index": 0 }],
        [{ "node": "Finalizar Job", "type": "main", "index": 0 }]
      ]
    },
    "Firecrawl Scrape": {
      "main": [[{ "node": "Preparar Prompt Claude", "type": "main", "index": 0 }]]
    },
    "Preparar Prompt Claude": {
      "main": [[{ "node": "Claude API", "type": "main", "index": 0 }]]
    },
    "Claude API": {
      "main": [[{ "node": "Normalizar Evento", "type": "main", "index": 0 }]]
    },
    "Normalizar Evento": {
      "main": [[{ "node": "Inserir Evento", "type": "main", "index": 0 }]]
    },
    "Inserir Evento": {
      "main": [[{ "node": "Loop URLs", "type": "main", "index": 0 }]]
    },
    "Finalizar Job": {
      "main": [[{ "node": "Loop Fontes", "type": "main", "index": 0 }]]
    }
  },
  "settings": { "executionOrder": "v1" }
}
```

Guardar o `id` do workflow retornado — será necessário nos próximos steps.

**Nota sobre body nos nós HTTP:** Os nós que usam `"body": "={{ JSON.stringify(...) }}"` requerem que a propriedade `specifyBody` esteja como `"string"` no n8n. Caso `n8n_validate_workflow` aponte erros de body, usar `n8n_update_partial_workflow` para adicionar `"specifyBody": "string"` em cada nó HTTP que usa essa forma de body.

- [ ] **Step 2.2: Validar o workflow**

```javascript
n8n_validate_workflow({ id: "<workflow_id_retornado>" })
```

Se houver erros, usar `n8n_update_partial_workflow` para corrigir.

---

## Task 3: Substituir Placeholders de Credenciais

Os nós têm placeholders `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `FIRECRAWL_API_KEY`, `ANTHROPIC_API_KEY`. Substituir com os valores reais.

- [ ] **Step 3.1: Atualizar credenciais em todos os nós Supabase**

Usar `n8n_update_partial_workflow` para substituir as credenciais nos nós:
`Buscar Fontes Ativas`, `Criar Job`, `Inserir Evento`, `Finalizar Job`.

Para cada nó, atualizar os parâmetros com os valores reais das chaves.

- [ ] **Step 3.2: Atualizar credencial Firecrawl**

Atualizar `Firecrawl Map` e `Firecrawl Scrape` com a chave real.

- [ ] **Step 3.3: Atualizar credencial Anthropic**

Atualizar `Claude API` com a chave real.

---

## Task 4: Testar e Ativar

- [ ] **Step 4.1: Executar teste manual com 1 fonte**

No n8n Dashboard, desativar temporariamente 5 fontes na tabela `fontes_scraper`:
```sql
UPDATE fontes_scraper SET ativo = false WHERE nome != 'Catracalivre Gira';
```

Clicar "Test workflow" no n8n → verificar:
- Nó "Buscar Fontes Ativas" retorna 1 item
- Nó "Firecrawl Map" retorna array com links
- Nó "Filtrar e Expandir URLs" retorna itens com `{url, fonte_nome, job_id}`
- Nó "Normalizar Evento" retorna pelo menos 1 evento válido
- Nó "Inserir Evento" retorna 201 ou 200
- Tabela `eventos` tem novas linhas com `origem = 'Catracalivre Gira'`
- Tabela `scraper_jobs` tem 1 linha com `status = 'concluido'`

- [ ] **Step 4.2: Reativar todas as fontes**

```sql
UPDATE fontes_scraper SET ativo = true;
```

- [ ] **Step 4.3: Testar deduplicação**

Executar o workflow manualmente uma segunda vez com a mesma fonte. Verificar que nenhum evento novo é inserido (a constraint `eventos_link_origem_unique` deve bloquear silenciosamente via `ignore-duplicates`).

- [ ] **Step 4.4: Ativar o workflow**

```javascript
n8n_update_partial_workflow({
  id: "<workflow_id>",
  intent: "Ativar workflow para execução automática a cada hora",
  operations: [{ type: "activateWorkflow" }]
})
```

Verificar no Dashboard do n8n que o workflow aparece como "Active".

---

## Verificação Final

Após 1 hora de execução automática, verificar:

```sql
-- Quantos eventos foram inseridos por fonte
SELECT origem, COUNT(*) as total, MAX(created_at) as ultima_insercao
FROM eventos
WHERE origem IN ('Sympla SP','Eventbrite SP','Ticketmaster BR','Ticket360 SP','Guia da Semana SP','Catracalivre Gira')
GROUP BY origem
ORDER BY total DESC;

-- Status dos últimos jobs
SELECT fonte_nome, status, iniciado_at, concluido_at
FROM scraper_jobs
ORDER BY iniciado_at DESC
LIMIT 12;
```
