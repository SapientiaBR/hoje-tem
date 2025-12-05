import { Heart, MapPin, Calendar, Clock } from 'lucide-react';
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
}

export function EventCard({ evento, isFavorito, onToggleFavorito, onClick }: EventCardProps) {
  const dataEvento = new Date(evento.data);
  
  const formatPreco = () => {
    if (evento.preco === 0) return 'Gratuito';
    if (evento.preco_max) {
      return `R$ ${evento.preco.toFixed(0)} - R$ ${evento.preco_max.toFixed(0)}`;
    }
    return `R$ ${evento.preco.toFixed(0)}`;
  };

  const getCategoriaColor = (categoria: string) => {
    const colors: Record<string, string> = {
      'Shows': 'bg-primary/20 text-primary',
      'Teatro': 'bg-accent/20 text-accent',
      'Stand-up': 'bg-highlight/20 text-highlight',
      'Gastronomia': 'bg-success/20 text-success',
      'Feiras': 'bg-muted-foreground/20 text-muted-foreground',
      'Eventos de Rua': 'bg-primary/20 text-primary',
      'Exposições': 'bg-accent/20 text-accent',
      'Esportes': 'bg-highlight/20 text-highlight',
      'Infantil': 'bg-success/20 text-success',
    };
    return colors[categoria] || 'bg-muted text-muted-foreground';
  };

  return (
    <article 
      className="group relative bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer animate-fade-in"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={evento.imagem || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'}
          alt={evento.nome}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        
        {/* Category badge */}
        <span className={cn(
          "absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold",
          getCategoriaColor(evento.categoria)
        )}>
          {evento.categoria}
        </span>

        {/* Featured badge */}
        {evento.destaque && (
          <span className="absolute top-3 right-12 gradient-accent px-3 py-1 rounded-full text-xs font-semibold text-accent-foreground">
            Destaque
          </span>
        )}

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorito();
          }}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full transition-all duration-200",
            isFavorito 
              ? "bg-destructive text-destructive-foreground" 
              : "bg-background/80 text-foreground hover:bg-background"
          )}
          aria-label={isFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart 
            className={cn(
              "w-5 h-5 transition-transform",
              isFavorito && "fill-current animate-heart-beat"
            )} 
          />
        </button>

        {/* Price tag */}
        <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-lg">
          <span className={cn(
            "font-bold text-sm",
            evento.preco === 0 ? "text-success" : "text-foreground"
          )}>
            {formatPreco()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {evento.nome}
        </h3>
        
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="text-sm">
              {format(dataEvento, "d 'de' MMMM", { locale: ptBR })}
            </span>
            <Clock className="w-4 h-4 shrink-0 ml-2" />
            <span className="text-sm">
              {format(dataEvento, 'HH:mm', { locale: ptBR })}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="text-sm truncate">{evento.local}</span>
          </div>
        </div>
      </div>
    </article>
  );
}