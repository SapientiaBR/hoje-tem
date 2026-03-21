import { useState, useEffect } from 'react';
import { Link, useParams, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Building2, Upload, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import logoHojeTem from '@/assets/logo-hoje-tem.png';

export default function ClaimLocal() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [local, setLocal] = useState<{ nome: string; claimed_by: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [mensagem, setMensagem] = useState('');
  const [documento, setDocumento] = useState('');

  useEffect(() => {
    if (id) fetchLocal();
  }, [id]);

  const fetchLocal = async () => {
    const { data, error } = await supabase
      .from('locais')
      .select('nome, claimed_by')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching local:', error);
    } else {
      setLocal(data);
    }
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!local) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Local não encontrado</p>
          <Link to="/locais">
            <Button variant="outline" className="mt-4">Voltar</Button>
          </Link>
        </main>
      </div>
    );
  }

  if (local.claimed_by) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Este local já foi reivindicado</p>
          <Link to={`/local/${id}`}>
            <Button variant="outline" className="mt-4">Voltar</Button>
          </Link>
        </main>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from('local_claims').insert({
      local_id: id,
      user_id: user.id,
      mensagem: mensagem || null,
      documento_comprovante: documento || null,
      status: 'pendente',
    });

    if (error) {
      console.error('Error submitting claim:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a solicitação',
        variant: 'destructive',
      });
    } else {
      setSubmitted(true);
      toast({
        title: 'Solicitação enviada!',
        description: 'Vamos analisar e entrar em contato em breve.',
      });
    }

    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 glass border-b border-border px-4 py-4">
          <div className="flex items-center justify-center">
            <img src={logoHojeTem} alt="HOJE TEM" className="h-10 object-contain filter drop-shadow-[0_0_8px_rgba(157,78,221,0.5)]" />
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Solicitação Enviada!</h1>
          <p className="text-muted-foreground mb-6">
            Vamos analisar sua solicitação e entrar em contato por e-mail.
          </p>
          <Link to={`/local/${id}`}>
            <Button>Voltar para o local</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border px-4 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Link to={`/local/${id}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Voltar</span>
          </Link>
          <img src={logoHojeTem} alt="HOJE TEM" className="h-10 object-contain filter drop-shadow-[0_0_8px_rgba(157,78,221,0.5)]" />
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <Building2 className="w-12 h-12 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Reivindicar Local</h1>
          <p className="text-muted-foreground">
            Solicite a gestão de <strong>{local.nome}</strong>
          </p>
        </div>

        <Card className="glass border-border/50 backdrop-blur-xl bg-background/40 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <CardHeader>
            <CardTitle className="text-lg">Informações para verificação</CardTitle>
            <CardDescription>
              Nos envie dados que comprovem que você é o responsável pelo local
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="mensagem">Mensagem</Label>
                <Textarea
                  id="mensagem"
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Conte-nos sobre sua relação com o estabelecimento..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="documento">Link para documento comprobatório (opcional)</Label>
                <Input
                  id="documento"
                  type="url"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  placeholder="https://drive.google.com/..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  CNPJ, contrato social, ou outro documento que comprove a propriedade
                </p>
              </div>

              <Button type="submit" className="w-full gradient-primary text-white border-0 shadow-[0_0_15px_rgba(157,78,221,0.3)] hover:opacity-90 rounded-xl" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Enviar Solicitação
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
