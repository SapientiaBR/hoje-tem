import { useState } from 'react';
import logoHojeTem from '@/assets/logo-hoje-tem.png';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEventos, useCategorias, Filtros, Evento } from '@/hooks/useEventos';
import { useFavoritos } from '@/hooks/useFavoritos';
import { useTheme } from '@/hooks/useTheme';
import { BottomNav } from '@/components/BottomNav';
import { CitySelector } from '@/components/CitySelector';
import { SearchBar } from '@/components/SearchBar';
import { CategoryPills } from '@/components/CategoryPills';
import { EventCard } from '@/components/EventCard';
import { EventDetail } from '@/components/EventDetail';
import { FilterSheet } from '@/components/FilterSheet';
import { Loader2, Heart, MapPin, CalendarDays, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Index() {
  const { user, loading: authLoading, signOut } = useAuth();
  useTheme();

  const [activeTab, setActiveTab] = useState('explorar');
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filtros, setFiltros] = useState<Filtros>({
    busca: '',
    categoria: 'Todos',
    dataInicio: null,
    dataFim: null,
    precoMin: 0,
    precoMax: 500,
    cidade: 'São Paulo',
  });

  const categorias = useCategorias();
  const { eventos, loading: eventosLoading } = useEventos(filtros);
  const { isFavorito, toggleFavorito } = useFavoritos();

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

  if (selectedEvento) {
    return (
      <EventDetail
        evento={selectedEvento}
        isFavorito={isFavorito(selectedEvento.id)}
        onToggleFavorito={() => toggleFavorito(selectedEvento.id)}
        onBack={() => setSelectedEvento(null)}
      />
    );
  }

  const eventosFavoritos = eventos.filter(e => isFavorito(e.id));
  const eventosDestaque = eventos.filter(e => e.destaque);

  const renderExplorar = () => (
    <div className="space-y-5">
      {/* Destaques - Carrossel horizontal */}
      {eventosDestaque.length > 0 && filtros.categoria === 'Todos' && !filtros.busca && (
        <section className="-mx-4">
          <h2 className="text-lg font-bold text-foreground mb-3 px-4 flex items-center gap-2">
            <span className="text-xl">🔥</span> DESTAQUES
          </h2>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {eventosDestaque.map(evento => (
              <EventCard
                key={evento.id}
                evento={evento}
                isFavorito={isFavorito(evento.id)}
                onToggleFavorito={() => toggleFavorito(evento.id)}
                onClick={() => setSelectedEvento(evento)}
                variant="featured"
              />
            ))}
          </div>
        </section>
      )}

      <SearchBar
        value={filtros.busca}
        onChange={(busca) => setFiltros({ ...filtros, busca })}
        onFilterClick={() => setFilterOpen(true)}
      />
      
      <CategoryPills
        categorias={categorias}
        selected={filtros.categoria}
        onSelect={(categoria) => setFiltros({ ...filtros, categoria })}
      />

      <section>
        <h2 className="text-base font-bold text-foreground mb-3">
          {filtros.busca || filtros.categoria !== 'Todos' ? 'Resultados' : 'Todos os eventos'}
        </h2>
        {eventosLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : eventos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum evento encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {eventos.map(evento => (
              <EventCard
                key={evento.id}
                evento={evento}
                isFavorito={isFavorito(evento.id)}
                onToggleFavorito={() => toggleFavorito(evento.id)}
                onClick={() => setSelectedEvento(evento)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );

  const renderFavoritos = () => (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Heart className="w-5 h-5 text-destructive" />
        Meus favoritos
      </h2>
      {eventosFavoritos.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Você ainda não salvou nenhum evento</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {eventosFavoritos.map(evento => (
            <EventCard
              key={evento.id}
              evento={evento}
              isFavorito={true}
              onToggleFavorito={() => toggleFavorito(evento.id)}
              onClick={() => setSelectedEvento(evento)}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderMapa = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <MapPin className="w-12 h-12 text-muted-foreground/30 mb-4" />
      <p className="text-muted-foreground">Mapa em breve!</p>
    </div>
  );

  const renderCalendario = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <CalendarDays className="w-12 h-12 text-muted-foreground/30 mb-4" />
      <p className="text-muted-foreground">Calendário em breve!</p>
    </div>
  );

  const renderPerfil = () => (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 text-center">
        <div className="w-20 h-20 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl font-bold text-primary-foreground">
            {user.email?.charAt(0).toUpperCase()}
          </span>
        </div>
        <p className="font-semibold text-foreground">{user.email}</p>
        <p className="text-sm text-muted-foreground">Membro desde {format(new Date(user.created_at), "MMMM 'de' yyyy", { locale: ptBR })}</p>
      </div>
      <Button variant="outline" onClick={signOut} className="w-full h-12">
        <LogOut className="w-4 h-4 mr-2" />
        Sair da conta
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 glass border-b border-border px-4 py-2">
        <div className="flex items-center justify-between">
          <img src={logoHojeTem} alt="HOJE TEM" className="h-12" />
          <CitySelector
            cidade={filtros.cidade}
            onCidadeChange={(cidade) => setFiltros({ ...filtros, cidade })}
          />
        </div>
      </header>

      <main className="px-4 py-4">
        {activeTab === 'explorar' && renderExplorar()}
        {activeTab === 'mapa' && renderMapa()}
        {activeTab === 'favoritos' && renderFavoritos()}
        {activeTab === 'calendario' && renderCalendario()}
        {activeTab === 'perfil' && renderPerfil()}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filtros={filtros}
        onFiltrosChange={setFiltros}
        categorias={categorias}
      />
    </div>
  );
}