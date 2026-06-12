import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import logoHojeTem from '@/assets/logo-hoje-tem.png';

export default function AuthOrganizador() {
  const { user, loading: authLoading, signUp, signIn } = useAuth();
  const { isOrganizador, loading: roleLoading, requestOrganizadorRole } = useUserRole();
  const { toast } = useToast();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // User already logged in and is organizador
  if (user && isOrganizador) {
    return <Navigate to="/organizador" replace />;
  }

  // User logged in but not organizador yet - show upgrade option
  if (user && !isOrganizador) {
    const handleBecomeOrganizador = async () => {
      setSubmitting(true);
      const { error } = await requestOrganizadorRole();
      if (error) {
        toast({
          title: 'Erro',
          description: error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sucesso!',
          description: 'Você agora é um organizador!',
        });
      }
      setSubmitting(false);
    };

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-6 py-12">
          <div className="mx-auto w-full max-w-sm text-center">
            <img src={logoHojeTem} alt="HOJE TEM" className="h-32 mx-auto mb-6" />
            <Building2 className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Seja um Organizador</h1>
            <p className="text-muted-foreground mb-6">
              Crie e gerencie seus próprios eventos na plataforma
            </p>
            <Button 
              onClick={handleBecomeOrganizador} 
              className="w-full h-12"
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Tornar-me Organizador
            </Button>
            <Link to="/" className="block mt-4 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Voltar para o app
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: 'Erro no login',
          description: error.message,
          variant: 'destructive',
        });
      }
    } else {
      const { error } = await signUp(email, password, nome);
      if (error) {
        toast({
          title: 'Erro no cadastro',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Conta criada!',
          description: 'Faça login para continuar',
        });
        setIsLogin(true);
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center mb-8">
            <img src={logoHojeTem} alt="HOJE TEM" className="h-32 mx-auto mb-4" />
            <Building2 className="w-12 h-12 mx-auto mb-2 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Área do Organizador</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Crie e gerencie seus eventos
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="nome">Seu nome</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="João Silva"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nomeEmpresa">Nome da empresa/produtora (opcional)</Label>
                  <Input
                    id="nomeEmpresa"
                    value={nomeEmpresa}
                    onChange={(e) => setNomeEmpresa(e.target.value)}
                    placeholder="Produtora XYZ"
                  />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full h-12" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isLogin ? 'Entrar' : 'Cadastrar'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? 'Não tem conta?' : 'Já tem conta?'}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? 'Cadastre-se' : 'Fazer login'}
            </button>
          </p>

          <Link to="/auth" className="block mt-4 text-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 inline mr-1" />
            Voltar para login de usuário
          </Link>
        </div>
      </div>
    </div>
  );
}
