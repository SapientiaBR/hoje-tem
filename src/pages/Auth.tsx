import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import logoHojeTem from '@/assets/logo-hoje-tem.png';

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
        title: 'Bora!',
        description: 'Seu HOJE TEM tá pronto.',
      });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0118] relative overflow-hidden flex flex-col justify-center px-6 py-12">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="mx-auto w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <img src={logoHojeTem} alt="HOJE TEM" className="h-28 mx-auto mb-6 object-contain filter drop-shadow-[0_0_15px_rgba(157,78,221,0.5)]" />
          <p className="text-muted-foreground mt-2 font-medium tracking-wide">
            Seu rolê começa aqui.
          </p>
        </div>

        <div className="glass border border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1">
                <Label htmlFor="nome" className="text-white/80 pl-1">Nome</Label>
                <Input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                  className="h-12 bg-black/40 border-white/10 focus:border-primary/50 focus:ring-primary/50 text-white rounded-xl placeholder:text-white/30"
                  required={!isLogin}
                />
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-white/80 pl-1">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="h-12 bg-black/40 border-white/10 focus:border-primary/50 focus:ring-primary/50 text-white rounded-xl placeholder:text-white/30"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-white/80 pl-1">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 bg-black/40 border-white/10 focus:border-primary/50 focus:ring-primary/50 text-white rounded-xl placeholder:text-white/30"
                minLength={6}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 mt-4 gradient-primary text-white font-bold rounded-xl text-md hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(157,78,221,0.4)] border-0"
            >
              {submitting && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
              {isLogin ? 'Entrar' : 'Criar conta'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-white/50">
              {isLogin ? 'Não tem conta?' : 'Já tem conta?'}{' '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-bold hover:underline transition-all hover:text-primary-foreground focus:outline-none ml-1"
              >
                {isLogin ? 'Criar agora' : 'Faça login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}