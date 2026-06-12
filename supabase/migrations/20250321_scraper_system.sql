-- Tabela de fontes de scraping
CREATE TABLE public.fontes_scraper (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  url_base text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('site', 'api', 'social')),
  ativo boolean DEFAULT true,
  ultima_coleta timestamptz,
  intervalo_minutos integer DEFAULT 60,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.fontes_scraper ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can view fontes_scraper"
ON public.fontes_scraper
FOR SELECT
USING (true);

CREATE POLICY "Admin can manage fontes_scraper"
ON public.fontes_scraper
FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Tabela de jobs de scraping
CREATE TABLE public.scraper_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fonte_id uuid REFERENCES public.fontes_scraper(id),
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'processando', 'concluido', 'erro')),
  urls jsonb DEFAULT '[]',
  eventos_encontrados integer DEFAULT 0,
  eventos_inseridos integer DEFAULT 0,
  erros jsonb DEFAULT '[]',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.scraper_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view scraper_jobs"
ON public.scraper_jobs
FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "System can insert scraper_jobs"
ON public.scraper_jobs
FOR INSERT
WITH CHECK (true);

-- Adicionar campos de deduplicação na tabela eventos
ALTER TABLE public.eventos 
ADD COLUMN IF NOT EXISTS evento_hash text,
ADD COLUMN IF NOT EXISTS fonte_origem text,
ADD COLUMN IF NOT EXISTS scraped_at timestamptz;

-- Criar índice para deduplicação
CREATE INDEX IF NOT EXISTS idx_eventos_hash ON public.eventos(evento_hash) WHERE evento_hash IS NOT NULL;

-- Criar função para gerar hash do evento
CREATE OR REPLACE FUNCTION public.gerar_evento_hash(evento_nome text, evento_data timestamptz, evento_local text)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT md5(lower(trim(coalesce(evento_nome, ''))) || '-' || 
    COALESCE(to_char(evento_data, 'YYYYMMDD'), '') || '-' || 
    lower(trim(coalesce(evento_local, ''))));
$$;

-- Trigger para auto-gerar hash
CREATE OR REPLACE FUNCTION public.set_evento_hash()
RETURNS trigger
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  NEW.evento_hash := public.gerar_evento_hash(NEW.nome, NEW.data, NEW.local);
  NEW.scraped_at := NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_evento_hash_trigger
BEFORE INSERT OR UPDATE OF nome, data, local ON public.eventos
FOR EACH ROW
EXECUTE FUNCTION public.set_evento_hash();

-- Inserir fontes iniciais
INSERT INTO public.fontes_scraper (nome, url_base, tipo, intervalo_minutos, config) VALUES
  ('Guia da Semana', 'https://www.guiadasemana.com.br/', 'site', 60, '{"selector": ".evento-card", "pagina_inicial": "/eventos"}'),
  ('Folha Guia', 'https://guia.folha.uol.com.br/', 'site', 60, '{"selector": ".agenda-item"}'),
  ('G1 São Paulo', 'https://g1.globo.com/guia/guia-sp/', 'site', 60, '{"selector": ".feed-post-link"}'),
  ('Agenda Viva SP', 'https://agendavivasp.com.br/', 'site', 60, '{"selector": ".evento-item"}'),
  ('Guias SP 24h', 'https://www.guiasp24h.com.br/', 'site', 60, '{"selector": ".evento"}'),
  ('Catraca Livre', 'https://catracalivre.com.br/gira/', 'site', 60, '{"selector": ".card-evento"}'),
  ('Sympla', 'https://www.sympla.com.br/', 'api', 30, '{"api": true}'),
  ('Eventbrite', 'https://www.eventbrite.com/d/brazil--sao-paulo/events/', 'site', 30, '{"selector": ".event-card"}'),
  ('Ingresso Rápido', 'https://www.ingressorapido.com.br/', 'api', 30, '{"api": true}'),
  ('Fever', 'https://www.fever.com.br/', 'site', 30, '{"selector": ".event-item"}');