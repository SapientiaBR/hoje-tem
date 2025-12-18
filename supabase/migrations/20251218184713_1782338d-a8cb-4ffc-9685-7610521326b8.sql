-- Enum para tipos de role
CREATE TYPE public.app_role AS ENUM ('user', 'organizador', 'local', 'admin');

-- Tabela de roles (separada do profiles por segurança)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função security definer para checar role (evita recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: usuários podem ver suas próprias roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Tabela de locais/estabelecimentos
CREATE TABLE public.locais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  endereco text,
  cidade text DEFAULT 'São Paulo',
  estado text DEFAULT 'SP',
  coordenadas_lat numeric,
  coordenadas_lng numeric,
  telefone text,
  instagram text,
  website text,
  imagem text,
  descricao text,
  categorias text[],
  claimed_by uuid REFERENCES auth.users(id),
  claimed_at timestamptz,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.locais ENABLE ROW LEVEL SECURITY;

-- Todos podem ver locais
CREATE POLICY "Anyone can view locais"
ON public.locais
FOR SELECT
USING (true);

-- Quem fez claim pode editar
CREATE POLICY "Claimed users can update their local"
ON public.locais
FOR UPDATE
USING (auth.uid() = claimed_by);

-- Tabela de solicitações de claim
CREATE TABLE public.local_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id uuid REFERENCES public.locais(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  documento_comprovante text,
  status text DEFAULT 'pendente',
  mensagem text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.local_claims ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver suas próprias solicitações
CREATE POLICY "Users can view own claims"
ON public.local_claims
FOR SELECT
USING (auth.uid() = user_id);

-- Usuários podem criar solicitações
CREATE POLICY "Users can create claims"
ON public.local_claims
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Tabela de sugestões de eventos
CREATE TABLE public.sugestoes_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  link_origem text NOT NULL,
  nome text,
  descricao text,
  data timestamptz,
  local text,
  imagem text,
  dados_raw jsonb,
  status text DEFAULT 'pendente',
  evento_id uuid REFERENCES public.eventos(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.sugestoes_eventos ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver suas próprias sugestões
CREATE POLICY "Users can view own suggestions"
ON public.sugestoes_eventos
FOR SELECT
USING (auth.uid() = user_id);

-- Usuários podem criar sugestões
CREATE POLICY "Users can create suggestions"
ON public.sugestoes_eventos
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Atualizar tabela eventos com novos campos
ALTER TABLE public.eventos 
ADD COLUMN organizador_id uuid REFERENCES auth.users(id),
ADD COLUMN local_id uuid REFERENCES public.locais(id),
ADD COLUMN status text DEFAULT 'publicado',
ADD COLUMN link_origem text;

-- Políticas para organizadores criarem/editarem eventos
CREATE POLICY "Organizadores podem criar eventos"
ON public.eventos
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'organizador') OR 
  public.has_role(auth.uid(), 'local') OR
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Organizadores podem editar próprios eventos"
ON public.eventos
FOR UPDATE
USING (
  organizador_id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Organizadores podem deletar próprios eventos"
ON public.eventos
FOR DELETE
USING (
  organizador_id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin')
);

-- Trigger para updated_at em locais
CREATE TRIGGER update_locais_updated_at
BEFORE UPDATE ON public.locais
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para criar role 'user' automaticamente para novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created_add_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();