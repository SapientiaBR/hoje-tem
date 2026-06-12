import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useCategorias } from '@/hooks/useEventos';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import logoHojeTem from '@/assets/logo-hoje-tem.png';

export default function NovoEvento() {
  const { user, loading: authLoading } = useAuth();
  const { isOrganizador, loading: roleLoading } = useUserRole();
  const categorias = useCategorias();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    data: '',
    hora: '',
    dataFim: '',
    horaFim: '',
    local: '',
    endereco: '',
    cidade: 'São Paulo',
    estado: 'SP',
    categoria: '',
    preco: '0',
    precoMax: '',
    imagem: '',
  });

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isOrganizador) {
    return <Navigate to="/auth/organizador" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const dataHora = `${form.data}T${form.hora || '00:00'}:00`;
    const dataFimHora = form.dataFim ? `${form.dataFim}T${form.horaFim || '23:59'}:00` : null;

    const { error } = await supabase.from('eventos').insert({
      nome: form.nome,
      descricao: form.descricao || null,
      data: dataHora,
      data_fim: dataFimHora,
      local: form.local,
      endereco: form.endereco || null,
      cidade: form.cidade,
      estado: form.estado,
      categoria: form.categoria,
      preco: parseFloat(form.preco) || 0,
      preco_max: form.precoMax ? parseFloat(form.precoMax) : null,
      imagem: form.imagem || null,
      organizador_id: user.id,
      status: 'publicado',
    });

    if (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o evento. Verifique os dados.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Sucesso!',
        description: 'Evento criado com sucesso',
      });
      navigate('/organizador');
    }
    setSubmitting(false);
  };

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border px-4 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Link to="/organizador" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Voltar</span>
          </Link>
          <img src={logoHojeTem} alt="HOJE TEM" className="h-12" />
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Evento</CardTitle>
            <CardDescription>Preencha as informações do seu evento</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do evento *</Label>
                <Input
                  id="nome"
                  value={form.nome}
                  onChange={(e) => updateForm('nome', e.target.value)}
                  placeholder="Ex: Festival de Música"
                  required
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={form.descricao}
                  onChange={(e) => updateForm('descricao', e.target.value)}
                  placeholder="Descreva seu evento..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data">Data de início *</Label>
                  <Input
                    id="data"
                    type="date"
                    value={form.data}
                    onChange={(e) => updateForm('data', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hora">Horário</Label>
                  <Input
                    id="hora"
                    type="time"
                    value={form.hora}
                    onChange={(e) => updateForm('hora', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataFim">Data de término</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={form.dataFim}
                    onChange={(e) => updateForm('dataFim', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="horaFim">Horário término</Label>
                  <Input
                    id="horaFim"
                    type="time"
                    value={form.horaFim}
                    onChange={(e) => updateForm('horaFim', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="local">Local/Estabelecimento *</Label>
                <Input
                  id="local"
                  value={form.local}
                  onChange={(e) => updateForm('local', e.target.value)}
                  placeholder="Ex: Teatro Municipal"
                  required
                />
              </div>

              <div>
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={form.endereco}
                  onChange={(e) => updateForm('endereco', e.target.value)}
                  placeholder="Rua, número, bairro"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={form.cidade}
                    onChange={(e) => updateForm('cidade', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={form.estado}
                    onChange={(e) => updateForm('estado', e.target.value)}
                    maxLength={2}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="categoria">Categoria *</Label>
                <Select value={form.categoria} onValueChange={(v) => updateForm('categoria', v)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.filter(c => c !== 'Todos').map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preco">Preço (R$)</Label>
                  <Input
                    id="preco"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.preco}
                    onChange={(e) => updateForm('preco', e.target.value)}
                    placeholder="0 = Grátis"
                  />
                </div>
                <div>
                  <Label htmlFor="precoMax">Preço máximo (R$)</Label>
                  <Input
                    id="precoMax"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.precoMax}
                    onChange={(e) => updateForm('precoMax', e.target.value)}
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="imagem">URL da imagem</Label>
                <Input
                  id="imagem"
                  type="url"
                  value={form.imagem}
                  onChange={(e) => updateForm('imagem', e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <Button type="submit" className="w-full h-12" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Publicar Evento
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
