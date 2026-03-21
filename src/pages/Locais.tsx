import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Search, MapPin, CheckCircle, Building2 } from 'lucide-react';
import logoHojeTem from '@/assets/logo-hoje-tem.png';

interface Local {
  id: string;
  nome: string;
  endereco: string | null;
  cidade: string;
  categorias: string[] | null;
  imagem: string | null;
  verified: boolean;
}

export default function Locais() {
  const [locais, setLocais] = useState<Local[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    fetchLocais();
  }, []);

  const fetchLocais = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('locais')
      .select('id, nome, endereco, cidade, categorias, imagem, verified')
      .order('nome');

    if (error) {
      console.error('Error fetching locais:', error);
    } else {
      setLocais(data || []);
    }
    setLoading(false);
  };

  const filteredLocais = locais.filter(local =>
    local.nome.toLowerCase().includes(busca.toLowerCase()) ||
    local.endereco?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border px-4 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Voltar</span>
          </Link>
          <img src={logoHojeTem} alt="HOJE TEM" className="h-12" />
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <Building2 className="w-12 h-12 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Locais & Estabelecimentos</h1>
          <p className="text-muted-foreground">
            Encontre bares, casas de show, teatros e mais
          </p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar local..."
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredLocais.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                {busca ? 'Nenhum local encontrado' : 'Nenhum local cadastrado ainda'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredLocais.map(local => (
              <Link to={`/local/${local.id}`} key={local.id}>
                <Card className="overflow-hidden hover:border-primary/50 transition-colors">
                  <div className="aspect-video bg-muted relative">
                    {local.imagem ? (
                      <img src={local.imagem} alt={local.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    {local.verified && (
                      <Badge className="absolute top-2 right-2 gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verificado
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground">{local.nome}</h3>
                    {local.endereco && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {local.endereco}
                      </p>
                    )}
                    {local.categorias && local.categorias.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {local.categorias.slice(0, 3).map(cat => (
                          <Badge key={cat} variant="secondary" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
