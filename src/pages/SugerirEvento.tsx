import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Link as LinkIcon, Sparkles, Check, Calendar, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import logoHojeTem from '@/assets/logo-hoje-tem.png';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ExtractedEvent {
  nome: string;
  descricao: string | null;
  data: string | null;
  local: string | null;
  endereco: string | null;
  cidade: string | null;
  categoria: string | null;
  preco: number | null;
  imagem: string | null;
  link_origem: string;
}

export default function SugerirEvento() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [url, setUrl] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedEvent | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setExtracting(true);
    setExtracted(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extrair-evento`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: url.trim() }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        toast({
          title: 'Erro ao extrair',
          description: data.error || 'Não foi possível acessar a página',
          variant: 'destructive',
        });
      } else {
        setExtracted(data.data);
        toast({
          title: 'Dados extraídos!',
          description: 'Revise as informações e confirme a sugestão',
        });
      }
    } catch (error) {
      console.error('Error extracting:', error);
      toast({
        title: 'Erro',
        description: 'Falha na comunicação com o servidor',
        variant: 'destructive',
      });
    }

    setExtracting(false);
  };

  const handleSubmit = async () => {
    if (!extracted) return;

    setSubmitting(true);

    const { error } = await supabase.from('sugestoes_eventos').insert({
      user_id: user.id,
      link_origem: extracted.link_origem,
      nome: extracted.nome,
      descricao: extracted.descricao,
      data: extracted.data,
      local: extracted.local,
      dados_raw: extracted as any,
      status: 'pendente',
    });

    if (error) {
      console.error('Error submitting suggestion:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a sugestão',
        variant: 'destructive',
      });
    } else {
      setSubmitted(true);
      toast({
        title: 'Sugestão enviada!',
        description: 'Obrigado por contribuir. Vamos revisar o evento.',
      });
    }

    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 glass border-b border-border px-4 py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Voltar</span>
            </Link>
            <img src={logoHojeTem} alt="HOJE TEM" className="h-10 object-contain filter drop-shadow-[0_0_8px_rgba(157,78,221,0.5)]" />
            <div className="w-16" />
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Sugestão Enviada!</h1>
          <p className="text-muted-foreground mb-6">
            Obrigado por contribuir! Nossa equipe vai revisar o evento e publicá-lo em breve.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setSubmitted(false); setExtracted(null); setUrl(''); }}>
              Sugerir outro
            </Button>
            <Link to="/">
              <Button>Voltar para eventos</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border px-4 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Voltar</span>
          </Link>
          <img src={logoHojeTem} alt="HOJE TEM" className="h-10 object-contain filter drop-shadow-[0_0_8px_rgba(157,78,221,0.5)]" />
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center mb-8">
          <Sparkles className="w-12 h-12 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Sugerir Evento</h1>
          <p className="text-muted-foreground">
            Encontrou um evento legal? Cole o link e a gente extrai as informações automaticamente!
          </p>
        </div>

        <Card className="glass border-border/50 backdrop-blur-xl bg-background/40 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Cole o link do evento
            </CardTitle>
            <CardDescription>
              Pode ser do Instagram, Facebook, Sympla, Eventbrite, site oficial...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleExtract} className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                type="url"
                required
                className="flex-1"
              />
              <Button type="submit" disabled={extracting || !url.trim()}>
                {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Extrair'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {extracting && (
          <Card className="glass border-border/50 backdrop-blur-xl bg-background/40 shadow-[0_8px_32px_rgba(0,0,0,0.3)] mt-6">
            <CardContent className="py-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Analisando a página...</p>
              <p className="text-sm text-muted-foreground/70">Isso pode levar alguns segundos</p>
            </CardContent>
          </Card>
        )}

        {extracted && (
          <Card className="glass border-border/50 backdrop-blur-xl bg-background/40 shadow-[0_8px_32px_rgba(0,0,0,0.3)] mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Informações extraídas</CardTitle>
              <CardDescription>Revise os dados antes de enviar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {extracted.imagem && (
                <img 
                  src={extracted.imagem} 
                  alt={extracted.nome}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              <div>
                <Label className="text-muted-foreground text-xs">Nome do evento</Label>
                <p className="font-semibold text-foreground">{extracted.nome}</p>
              </div>

              {extracted.descricao && (
                <div>
                  <Label className="text-muted-foreground text-xs">Descrição</Label>
                  <p className="text-sm text-foreground">{extracted.descricao}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {extracted.data && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(extracted.data), "d 'de' MMMM", { locale: ptBR })}
                    </span>
                  </div>
                )}
                {extracted.local && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{extracted.local}</span>
                  </div>
                )}
              </div>

              {extracted.categoria && (
                <div>
                  <Label className="text-muted-foreground text-xs">Categoria</Label>
                  <p className="text-sm">{extracted.categoria}</p>
                </div>
              )}

              {extracted.preco !== null && (
                <div>
                  <Label className="text-muted-foreground text-xs">Preço</Label>
                  <p className="text-sm">
                    {extracted.preco === 0 ? 'Gratuito' : `R$ ${extracted.preco}`}
                  </p>
                </div>
              )}

              <Button onClick={handleSubmit} className="w-full gradient-primary text-white border-0 shadow-[0_0_15px_rgba(157,78,221,0.3)] hover:opacity-90 rounded-xl font-medium" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                Enviar Sugestão
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
