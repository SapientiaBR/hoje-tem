import { Heart } from 'lucide-react';
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

const FALLBACK = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80';

function formatPreco(preco: number, preco_max: number | null) {
  if (preco === 0) return 'GRÁTIS';
  if (preco_max) return `R$${preco.toFixed(0)}+`;
  return `R$${preco.toFixed(0)}`;
}

export function EventCard({ evento, isFavorito, onToggleFavorito, onClick, variant = 'default' }: EventCardProps) {
  const dataEvento = new Date(evento.data);
  const preco = formatPreco(evento.preco, evento.preco_max);

  // Extrai apenas o bairro (último fragmento após vírgula) ou local truncado
  const bairro = evento.local.split(',').pop()?.trim() || evento.local;

  /* ─── FEATURED (carrossel horizontal) ─── */
  if (variant === 'featured') {
    return (
      <article
        className="group relative flex-shrink-0 w-60 overflow-hidden cursor-pointer"
        onClick={onClick}
        style={{ aspectRatio: '3/4' }}
      >
        <img
          src={evento.imagem || FALLBACK}
          alt={evento.nome}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {evento.destaque && (
          <span className="absolute top-3 left-3 tag-neon px-2 py-1 text-[10px]">
            🔥 BOMBANDO
          </span>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorito(); }}
          className="absolute top-3 right-3 p-2 glass-light rounded-full hover:scale-110 transition"
          aria-label="Favoritar"
        >
          <Heart className={cn("w-3.5 h-3.5", isFavorito ? "fill-neon text-neon" : "text-white")} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="headline text-white text-xl line-clamp-2 mb-1.5">
            {evento.nome}
          </h3>
          <p className="label-mono text-[10px] text-white/70">
            {bairro} · {format(dataEvento, "HH'h'mm")} · {preco}
          </p>
        </div>
      </article>
    );
  }

  /* ─── DEFAULT (grid editorial) ─── */
  return (
    <article
      className="group cursor-pointer animate-fade-scale"
      onClick={onClick}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-card">
        <img
          src={evento.imagem || FALLBACK}
          alt={evento.nome}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {evento.destaque && (
          <span className="absolute top-2 left-2 tag-neon px-1.5 py-0.5 text-[9px]">
            🔥
          </span>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorito(); }}
          className="absolute top-2 right-2 p-1.5 glass-light rounded-full transition hover:scale-110"
          aria-label="Favoritar"
        >
          <Heart className={cn("w-3 h-3", isFavorito ? "fill-neon text-neon" : "text-white")} />
        </button>

        {evento.preco === 0 && (
          <span className="absolute bottom-2 left-2 tag-neon px-1.5 py-0.5 text-[9px]">
            GRÁTIS
          </span>
        )}
      </div>

      <div className="pt-2 space-y-0.5">
        <h3 className="headline text-foreground text-sm line-clamp-2 group-hover:text-neon transition-colors">
          {evento.nome}
        </h3>
        <p className="label-mono text-[10px] text-muted-foreground truncate">
          {bairro} · {format(dataEvento, "HH'h'mm")} · {preco}
        </p>
      </div>
    </article>
  );
}
