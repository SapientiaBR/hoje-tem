import { useState } from 'react';
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
import { MapTab } from '@/components/MapTab';
import { CalendarTab } from '@/components/CalendarTab';
import { Loader2, ArrowRight, LogOut, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const HERO_FALLBACK = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80';

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
        <Loader2 className="w-8 h-8 animate-spin text-neon" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

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
  const heroEvento = eventosDestaque[0] || eventos[0];
  const trending = eventosDestaque.slice(0, 3);

  // hype counter "fake" determinístico (já que não temos métrica real)
  const hype = (id: string) => 80 + (id.charCodeAt(0) * 7) % 400;
  const startsIn = (data: string) => {
    const h = differenceInHours(new Date(data), new Date());
    if (h < 0) return 'AGORA';
    if (h < 1) return 'COMEÇA JÁ';
    if (h < 24) return `COMEÇA EM ${h}H`;
    return format(new Date(data), "d 'DE' MMM", { locale: ptBR }).toUpperCase();
  };

  /* ─────────── HOJE (explorar) ─────────── */
  const renderExplorar = () => (
    <div className="space-y-7">
      {/* HERO — Evento do dia */}
      {heroEvento && filtros.categoria === 'Todos' && !filtros.busca && (
        <section
          className="-mx-4 relative cursor-pointer group overflow-hidden"
          onClick={() => setSelectedEvento(heroEvento)}
        >
          <div className="relative aspect-[4/5] sm:aspect-[16/10]">
            <img
              src={heroEvento.imagem || HERO_FALLBACK}
              alt={heroEvento.nome}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />

            {/* Top label */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="neon-dot" />
              <span className="label-mono text-[10px] text-neon">HOJE EM ALTA</span>
            </div>

            {/* Bottom content */}
            <div className="absolute bottom-0 left-0 right-0 p-5 space-y-3">
              <h1 className="headline text-white text-5xl sm:text-6xl line-clamp-2">
                {heroEvento.nome}
              </h1>
              <div className="flex items-center gap-4 label-mono text-[11px] text-white/90">
                <span className="text-neon">▲ {hype(heroEvento.id)} QUEREM IR</span>
                <span>·</span>
                <span>{startsIn(heroEvento.data)}</span>
              </div>
              <button className="mt-2 inline-flex items-center gap-2 bg-neon text-black px-4 py-2.5 label-mono text-[11px] hover:opacity-90 transition">
                NÃO PERCA <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Search */}
      <SearchBar
        value={filtros.busca}
        onChange={(busca) => setFiltros({ ...filtros, busca })}
        onFilterClick={() => setFilterOpen(true)}
      />

      {/* Tags emocionais */}
      <CategoryPills
        categorias={categorias}
        selected={filtros.categoria}
        onSelect={(categoria) => setFiltros({ ...filtros, categoria })}
      />

      {/* TRENDING — Charts style */}
      {trending.length > 0 && filtros.categoria === 'Todos' && !filtros.busca && (
        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <h2 className="headline text-foreground text-2xl">TOP HOJE</h2>
            <span className="label-mono text-[10px] text-muted-foreground">CHARTS · SP</span>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {trending.map((ev, idx) => (
              <button
                key={ev.id}
                onClick={() => setSelectedEvento(ev)}
                className="w-full flex items-center gap-3 py-3 text-left hover:bg-card/50 transition-colors"
              >
                <span className={`font-display text-3xl w-10 text-center ${idx === 0 ? 'text-neon' : 'text-foreground/80'}`}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <img
                  src={ev.imagem || HERO_FALLBACK}
                  alt=""
                  className="w-12 h-12 object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="headline text-foreground text-sm line-clamp-1">{ev.nome}</p>
                  <p className="label-mono text-[10px] text-muted-foreground truncate">
                    {ev.categoria} · {ev.local.split(',').pop()?.trim()}
                  </p>
                </div>
                <span className="label-mono text-[10px] text-neon">▲</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* GRID */}
      <section className="space-y-3">
        <h2 className="headline text-foreground text-2xl">
          {filtros.busca || filtros.categoria !== 'Todos' ? 'DESCUBRA' : 'BOMBANDO AGORA'}
        </h2>
        {eventosLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-neon" />
          </div>
        ) : eventos.length === 0 ? (
          <div className="text-center py-12 border border-border">
            <p className="label-mono text-[11px] text-muted-foreground">NADA POR AQUI AINDA</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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

  /* ─────────── SALVOS ─────────── */
  const renderFavoritos = () => (
    <div className="space-y-5">
      <div>
        <h1 className="headline text-foreground text-3xl flex items-center gap-3">
          SALVOS
          <span className="label-mono text-[11px] text-neon">{eventosFavoritos.length}</span>
        </h1>
        <p className="label-mono text-[10px] text-muted-foreground mt-1">sua lista de não-perca</p>
      </div>

      {eventosFavoritos.length === 0 ? (
        <div className="text-center py-16 border border-border">
          <Bookmark className="w-10 h-10 mx-auto text-muted-foreground/40 mb-4" />
          <p className="label-mono text-[11px] text-muted-foreground">SUA LISTA ESTÁ VAZIA</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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

  const renderMapa = () => <MapTab eventos={eventos} onEventClick={setSelectedEvento} />;

  const renderCalendario = () => (
    <CalendarTab
      eventos={eventos}
      isFavorito={isFavorito}
      onToggleFavorito={toggleFavorito}
      onEventClick={setSelectedEvento}
    />
  );

  /* ─────────── EU (perfil) ─────────── */
  const renderPerfil = () => (
    <div className="space-y-6">
      <div>
        <h1 className="headline text-foreground text-3xl">EU</h1>
        <p className="label-mono text-[10px] text-muted-foreground mt-1">seu perfil cultural</p>
      </div>

      <div className="border border-border p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-neon flex items-center justify-center">
            <span className="font-display text-2xl text-black">
              {user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="headline text-foreground text-base truncate">{user.email?.split('@')[0]}</p>
            <p className="label-mono text-[10px] text-muted-foreground">
              MEMBRO DESDE {format(new Date(user.created_at), "MMM/yy", { locale: ptBR }).toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex gap-6 pt-4 border-t border-border">
          <div>
            <p className="font-display text-2xl text-neon">{eventosFavoritos.length}</p>
            <p className="label-mono text-[9px] text-muted-foreground">SALVOS</p>
          </div>
          <div>
            <p className="font-display text-2xl text-foreground">{eventos.length}</p>
            <p className="label-mono text-[9px] text-muted-foreground">NO RADAR</p>
          </div>
        </div>
      </div>

      <div className="border border-border divide-y divide-border">
        {[
          { href: '/sugerir-evento',     label: 'SUGERIR EVENTO',  emoji: '💡' },
          { href: '/auth/organizador',   label: 'SOU ORGANIZADOR', emoji: '🎤' },
          { href: '/locais',             label: 'LOCAIS',          emoji: '📍' },
        ].map(item => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center justify-between px-4 py-4 hover:bg-card transition-colors"
          >
            <span className="flex items-center gap-3">
              <span className="text-lg">{item.emoji}</span>
              <span className="label-mono text-[11px] text-foreground">{item.label}</span>
            </span>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </a>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={signOut}
        className="w-full h-12 label-mono text-[11px] border-border hover:border-destructive hover:text-destructive"
      >
        <LogOut className="w-4 h-4 mr-2" />
        SAIR
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="headline text-foreground text-xl">HOJE</span>
            <span className="headline text-neon text-xl">TEM</span>
          </div>
          <CitySelector
            cidade={filtros.cidade}
            onCidadeChange={(cidade) => setFiltros({ ...filtros, cidade })}
          />
        </div>
      </header>

      <main className="px-4 py-5">
        {activeTab === 'explorar'   && renderExplorar()}
        {activeTab === 'mapa'       && renderMapa()}
        {activeTab === 'favoritos'  && renderFavoritos()}
        {activeTab === 'calendario' && renderCalendario()}
        {activeTab === 'perfil'     && renderPerfil()}
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
