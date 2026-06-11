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

-- Constraint de deduplicação em eventos
-- Usa bloco condicional: só adiciona se a tabela existir e a constraint ainda não existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'eventos'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'eventos_link_origem_unique'
  ) THEN
    ALTER TABLE public.eventos ADD CONSTRAINT eventos_link_origem_unique UNIQUE (link_origem);
  END IF;
END $$;

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
