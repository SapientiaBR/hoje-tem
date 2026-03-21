import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, MapPin, Phone, Globe, Instagram, CheckCircle, Building2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import logoHojeTem from '@/assets/logo-hoje-tem.png';

interface LocalData {
  id: string;
  nome: string;
  descricao: string | null;
  endereco: string | null;
  cidade: string;
  estado: string;
  telefone: string | null;
  instagram: string | null;
  website: string | null;
  imagem: string | null;
  categorias: string[] | null;
  verified: boolean;
  claimed_by: string | null;
}

interface EventoLocal {
  id: string;
  nome: string;
  data: string;
  categoria: string;
  imagem: string | null;
}

export default function LocalDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [local, setLocal] = useState<LocalData | null>(null);
  const [eventos, setEventos] = useState<EventoLocal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchLocal();
  }, [id]);

  const fetchLocal = async () => {
    setLoading(true);

    const { data: localData, error: localError } = await supabase
      .from('locais')
      .select('*')
      .eq('id', id)
      .single();

    if (localError) {
      console.error('Error fetching local:', localError);
    } else {
      setLocal(localData);

      // Fetch eventos deste local
      const { data: eventosData } = await supabase
        .from('eventos')
        .select('id, nome, data, categoria, imagem')
        .eq('local_id', id)
        .gte('data', new Date().toISOString())
        .order('data', { ascending: true })
        .limit(10);

      setEventos(eventosData || []);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!local) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 glass border-b border-border px-4 py-4">
          <div className="flex items-center justify-center">
            <img src={logoHojeTem} alt="HOJE TEM" className="h-10 object-contain filter drop-shadow-[0_0_8px_rgba(157,78,221,0.5)]" />
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Local não encontrado</p>
          <Link to="/locais">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ver todos os locais
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  const canClaim = user && !local.claimed_by && !local.verified;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border px-4 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link to="/locais" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Voltar</span>
          </Link>
          <img src={logoHojeTem} alt="HOJE TEM" className="h-10 object-contain filter drop-shadow-[0_0_8px_rgba(157,78,221,0.5)]" />
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden aspect-video bg-muted">
          {local.imagem ? (
            <img src={local.imagem} alt={local.nome} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="w-16 h-16 text-muted-foreground/30" />
            </div>
          )}
          {local.verified && (
            <Badge className="absolute top-4 right-4 gap-1">
              <CheckCircle className="w-3 h-3" />
              Verificado
            </Badge>
          )}
        </div>

        {/* Info */}
        <Card className="glass border-border/50 backdrop-blur-xl bg-background/40 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <CardHeader>
            <CardTitle className="text-2xl">{local.nome}</CardTitle>
            {local.endereco && (
              <CardDescription className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {local.endereco}, {local.cidade} - {local.estado}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {local.descricao && (
              <p className="text-foreground">{local.descricao}</p>
            )}

            {local.categorias && local.categorias.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {local.categorias.map(cat => (
                  <Badge key={cat} variant="secondary">{cat}</Badge>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {local.telefone && (
                <a href={`tel:${local.telefone}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                  <Phone className="w-4 h-4" />
                  {local.telefone}
                </a>
              )}
              {local.instagram && (
                <a href={`https://instagram.com/${local.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                  <Instagram className="w-4 h-4" />
                  {local.instagram}
                </a>
              )}
              {local.website && (
                <a href={local.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                  <Globe className="w-4 h-4" />
                  Site
                </a>
              )}
            </div>

            {canClaim && (
              <Link to={`/local/${local.id}/claim`}>
                <Button variant="outline" className="w-full bg-black/40 border-white/10 hover:bg-white/10 hover:text-primary transition-colors">
                  <Building2 className="w-4 h-4 mr-2" />
                  Este é meu estabelecimento
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Próximos eventos */}
        {eventos.length > 0 && (
          <Card className="glass border-border/50 backdrop-blur-xl bg-background/40 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Próximos eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eventos.map(evento => (
                  <Link to={`/evento/${evento.id}`} key={evento.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
                    <div className="w-16 h-16 rounded-xl bg-black/40 overflow-hidden flex-shrink-0">
                      {evento.imagem ? (
                        <img src={evento.imagem} alt={evento.nome} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{evento.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(evento.data), "d 'de' MMM", { locale: ptBR })}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">{evento.categoria}</Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
