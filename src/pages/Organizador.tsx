import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, ArrowLeft, Calendar, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import logoHojeTem from '@/assets/logo-hoje-tem.png';

interface MeuEvento {
  id: string;
  nome: string;
  data: string;
  local: string;
  categoria: string;
  status: string;
  imagem: string | null;
}

export default function Organizador() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isOrganizador, loading: roleLoading } = useUserRole();
  const { toast } = useToast();

  const [eventos, setEventos] = useState<MeuEvento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && isOrganizador) {
      fetchMeusEventos();
    }
  }, [user, isOrganizador]);

  const fetchMeusEventos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('eventos')
      .select('id, nome, data, local, categoria, status, imagem')
      .eq('organizador_id', user?.id)
      .order('data', { ascending: false });

    if (error) {
      console.error('Error fetching eventos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar seus eventos',
        variant: 'destructive',
      });
    } else {
      setEventos(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;

    const { error } = await supabase.from('eventos').delete().eq('id', id);
    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o evento',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Sucesso',
        description: 'Evento excluído',
      });
      setEventos(eventos.filter(e => e.id !== id));
    }
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/organizador" replace />;
  }

  if (!isOrganizador) {
    return <Navigate to="/auth/organizador" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border px-4 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Voltar</span>
          </Link>
          <img src={logoHojeTem} alt="HOJE TEM" className="h-10 object-contain filter drop-shadow-[0_0_8px_rgba(157,78,221,0.5)]" />
          <Button variant="ghost" size="sm" onClick={signOut}>
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meus Eventos</h1>
            <p className="text-muted-foreground text-sm">Gerencie seus eventos</p>
          </div>
          <Link to="/organizador/novo-evento">
            <Button className="gradient-primary text-white border-0 shadow-[0_0_15px_rgba(157,78,221,0.3)] hover:opacity-90 rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Criar Evento
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : eventos.length === 0 ? (
          <Card className="glass border-border/50 backdrop-blur-md bg-background/40 shadow-lg">
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground mb-4">Você ainda não criou nenhum evento</p>
              <Link to="/organizador/novo-evento">
                <Button className="gradient-primary text-white border-0 shadow-[0_0_15px_rgba(157,78,221,0.3)] hover:opacity-90 rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeiro evento
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {eventos.map(evento => (
              <Card key={evento.id} className="glass border-border/50 backdrop-blur-md bg-background/40 shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{evento.nome}</CardTitle>
                      <CardDescription>
                        {format(new Date(evento.data), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        {' • '}{evento.local}
                      </CardDescription>
                    </div>
                    <Badge variant={evento.status === 'publicado' ? 'default' : 'secondary'}>
                      {evento.status || 'publicado'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{evento.categoria}</Badge>
                    <div className="flex-1" />
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/evento/${evento.id}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/organizador/editar/${evento.id}`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(evento.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
