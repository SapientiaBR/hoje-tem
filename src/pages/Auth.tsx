import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PartyPopper } from 'lucide-react';

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = isLogin 
      ? await signIn(email, password)
      : await signUp(email, password, nome);

    if (error) {
      toast({
        title: 'Erro',
        description: error.message === 'Invalid login credentials' 
          ? 'Email ou senha incorretos' 
          : error.message,
        variant: 'destructive',
      });
    } else if (!isLogin) {
      toast({
        title: 'Conta criada!',
        description: 'Bem-vindo ao Zé Rolê!',
      });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
              <PartyPopper className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-gradient">Zé Rolê</h1>
            <p className="text-muted-foreground mt-2">
              {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="h-12 mt-1"
                  required={!isLogin}
                />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="h-12 mt-1"
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
                className="h-12 mt-1"
                minLength={6}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 gradient-primary text-primary-foreground font-semibold"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLogin ? 'Entrar' : 'Criar conta'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? 'Não tem conta?' : 'Já tem conta?'}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? 'Criar conta' : 'Entrar'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}