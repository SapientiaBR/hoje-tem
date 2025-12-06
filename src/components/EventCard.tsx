import { Heart, MapPin, Calendar } from 'lucide-react';
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

export function EventCard({ evento, isFavorito, onToggleFavorito, onClick, variant = 'default' }: EventCardProps) {
  const dataEvento = new Date(evento.data);
  
  const formatPreco = () => {
    if (evento.preco === 0) return 'Grátis';
    if (evento.preco_max) {
      return `R$${evento.preco.toFixed(0)}+`;
    }
    return `R$${evento.preco.toFixed(0)}`;
  };

  if (variant === 'featured') {
    return (
      <article 
        className="group relative flex-shrink-0 w-64 bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
        onClick={onClick}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={evento.imagem || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'}
            alt={evento.nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorito();
            }}
            className={cn(
              "absolute top-2 right-2 p-1.5 rounded-full transition-all duration-200",
              isFavorito 
                ? "bg-destructive text-destructive-foreground" 
                : "bg-background/80 text-foreground hover:bg-background"
            )}
            aria-label={isFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart className={cn("w-4 h-4", isFavorito && "fill-current")} />
          </button>

          <div className="absolute bottom-2 left-2 right-2">
            <h3 className="font-bold text-sm text-foreground line-clamp-2 drop-shadow-lg">
              {evento.nome}
            </h3>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                {format(dataEvento, "d MMM", { locale: ptBR })}
              </span>
              <span className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full",
                evento.preco === 0 ? "bg-success/20 text-success" : "bg-background/80 text-foreground"
              )}>
                {formatPreco()}
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article 
      className="group relative bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer animate-fade-in"
      onClick={onClick}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={evento.imagem || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'}
          alt={evento.nome}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
        
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/90 text-primary-foreground">
          {evento.categoria}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorito();
          }}
          className={cn(
            "absolute top-2 right-2 p-1.5 rounded-full transition-all duration-200",
            isFavorito 
              ? "bg-destructive text-destructive-foreground" 
              : "bg-background/70 text-foreground hover:bg-background"
          )}
          aria-label={isFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart className={cn("w-4 h-4", isFavorito && "fill-current")} />
        </button>

        <div className="absolute bottom-2 right-2">
          <span className={cn(
            "text-xs font-bold px-2 py-1 rounded-md",
            evento.preco === 0 ? "bg-success text-success-foreground" : "bg-background/90 text-foreground"
          )}>
            {formatPreco()}
          </span>
        </div>
      </div>

      <div className="p-2.5">
        <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {evento.nome}
        </h3>
        
        <div className="mt-1.5 flex items-center gap-1 text-muted-foreground">
          <Calendar className="w-3 h-3 shrink-0" />
          <span className="text-xs">
            {format(dataEvento, "d MMM, HH:mm", { locale: ptBR })}
          </span>
        </div>
        
        <div className="mt-1 flex items-center gap-1 text-muted-foreground">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="text-xs truncate">{evento.local}</span>
        </div>
      </div>
    </article>
  );
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