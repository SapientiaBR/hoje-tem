import { Heart, MapPin, Calendar, Star } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface EventCardProps {
  evento: {
    id: string;
    nome: string;
    categoria: string;
    local: string;
    data: string;
    imagem: string | null;
    preco: number;
    preco_max: number | null;
    destaque: boolean;
  };
  isFavorito: boolean;
  onToggleFavorito: () => void;
  onClick: () => void;
  variant?: 'default' | 'featured';
}

// Mapa de cores por categoria para badges vibrantes
const categoryColors: Record<string, string> = {
  'Shows':          'badge-neon-purple',
  'Teatro':         'badge-neon-blue',
  'Stand-up':       'badge-neon-orange',
  'Gastronomia':    'badge-neon-orange',
  'Feiras':         'badge-neon-green',
  'Eventos de Rua': 'badge-neon-blue',
  'Exposições':     'badge-neon-purple',
  'Esportes':       'badge-neon-blue',
  'Infantil':       'badge-neon-orange',
};

function getCategoryBadge(categoria: string) {
  return categoryColors[categoria] || 'badge-neon-purple';
}

export function EventCard({ evento, isFavorito, onToggleFavorito, onClick, variant = 'default' }: EventCardProps) {
  const dataEvento = new Date(evento.data);

  const formatPreco = () => {
    if (evento.preco === 0) return 'Grátis';
    if (evento.preco_max) return `R$${evento.preco.toFixed(0)}+`;
    return `R$${evento.preco.toFixed(0)}`;
  };

  const precoGratuito = evento.preco === 0;

  /* ────────────────────────────────────────────────────────────
     FEATURED (carrossel horizontal)
  ──────────────────────────────────────────────────────────── */
  if (variant === 'featured') {
    return (
      <article
        className="group relative flex-shrink-0 w-64 rounded-2xl overflow-hidden cursor-pointer hover-lift"
        onClick={onClick}
        style={{ aspectRatio: '4/5' }}
      >
        {/* Image */}
        <img
          src={evento.imagem || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'}
          alt={evento.nome}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-purple-900/20" />

        {/* Destaque star */}
        {evento.destaque && (
          <div className="absolute top-3 left-3">
            <span className="flex items-center gap-1 badge-neon-orange px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">
              <Star className="w-2.5 h-2.5 fill-current" />
              Destaque
            </span>
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorito(); }}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full transition-all duration-200 hover:scale-110",
            isFavorito
              ? "bg-red-500/90 text-white shadow-[0_0_16px_hsl(0_80%_60%/0.5)]"
              : "glass-light text-white/70 hover:text-white"
          )}
          aria-label={isFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart className={cn("w-3.5 h-3.5", isFavorito && "fill-current")} />
        </button>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <span className={cn("inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide mb-1.5", getCategoryBadge(evento.categoria))}>
            {evento.categoria}
          </span>
          <h3 className="font-bold text-sm text-white line-clamp-2 leading-tight mb-2">
            {evento.nome}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-white/60 flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" />
              {format(dataEvento, "d MMM", { locale: ptBR })}
            </span>
            <span className={cn(
              "text-[11px] font-bold px-2 py-0.5 rounded-full",
              precoGratuito ? "badge-neon-green" : "glass-light text-white"
            )}>
              {formatPreco()}
            </span>
          </div>
        </div>
      </article>
    );
  }

  /* ────────────────────────────────────────────────────────────
     DEFAULT (grid 2 colunas)
  ──────────────────────────────────────────────────────────── */
  return (
    <article
      className={cn(
        "group relative rounded-2xl overflow-hidden cursor-pointer animate-fade-scale",
        "bg-card border border-border/50",
        "transition-all duration-300 hover:border-primary/30",
        "hover:shadow-[0_8px_32px_hsl(0_0%_0%/0.5),_0_0_16px_hsl(267_90%_65%/0.15)]",
        "hover:-translate-y-1"
      )}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={evento.imagem || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80'}
          alt={evento.nome}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Category badge */}
        <span className={cn(
          "absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide",
          getCategoryBadge(evento.categoria)
        )}>
          {evento.categoria}
        </span>

        {/* Favorite button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorito(); }}
          className={cn(
            "absolute top-2 right-2 p-1.5 rounded-full transition-all duration-200 hover:scale-110",
            isFavorito
              ? "bg-red-500/90 text-white shadow-[0_0_12px_hsl(0_80%_60%/0.5)]"
              : "glass-light text-white/70 hover:text-white"
          )}
          aria-label={isFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart className={cn("w-3 h-3", isFavorito && "fill-current")} />
        </button>

        {/* Price badge bottom-right */}
        <div className="absolute bottom-2 right-2">
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full",
            precoGratuito ? "badge-neon-green" : "glass-light text-white"
          )}>
            {formatPreco()}
          </span>
        </div>
      </div>

      {/* Text area */}
      <div className="p-2.5 space-y-1">
        <h3 className="font-semibold text-[13px] text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-200">
          {evento.nome}
        </h3>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="w-3 h-3 shrink-0 text-primary/60" />
          <span className="text-[11px]">
            {format(dataEvento, "d MMM, HH:mm", { locale: ptBR })}
          </span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="w-3 h-3 shrink-0 text-accent/60" />
          <span className="text-[11px] truncate">{evento.local}</span>
        </div>
      </div>
    </article>
  );
}
