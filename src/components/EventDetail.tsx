import { ArrowLeft, Heart, MapPin, Calendar, Clock, Share2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Evento } from '@/hooks/useEventos';

interface EventDetailProps {
  evento: Evento;
  isFavorito: boolean;
  onToggleFavorito: () => void;
  onBack: () => void;
}

export function EventDetail({ evento, isFavorito, onToggleFavorito, onBack }: EventDetailProps) {
  const dataEvento = new Date(evento.data);
  
  const formatPreco = () => {
    if (evento.preco === 0) return 'Gratuito';
    if (evento.preco_max) {
      return `R$ ${evento.preco.toFixed(0)} - R$ ${evento.preco_max.toFixed(0)}`;
    }
    return `R$ ${evento.preco.toFixed(0)}`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: evento.nome,
        text: `Confira: ${evento.nome} em ${evento.local}`,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Image */}
      <div className="relative aspect-[16/12] md:aspect-[21/9]">
        <img
          src={evento.imagem || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'}
          alt={evento.nome}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        {/* Header buttons */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="bg-background/80 backdrop-blur-sm rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="bg-background/80 backdrop-blur-sm rounded-full"
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFavorito}
              className={cn(
                "rounded-full",
                isFavorito 
                  ? "bg-destructive text-destructive-foreground" 
                  : "bg-background/80 backdrop-blur-sm"
              )}
            >
              <Heart className={cn("w-5 h-5", isFavorito && "fill-current")} />
            </Button>
          </div>
        </div>

        {/* Category badge */}
        <span className="absolute bottom-4 left-4 px-4 py-1.5 rounded-full text-sm font-semibold gradient-primary text-primary-foreground">
          {evento.categoria}
        </span>
      </div>

      {/* Content */}
      <div className="px-4 -mt-4 relative z-10">
        <div className="bg-card rounded-t-3xl p-6 shadow-lg">
          {/* Title and Price */}
          <div className="flex justify-between items-start gap-4 mb-6">
            <h1 className="text-2xl font-bold text-foreground flex-1">
              {evento.nome}
            </h1>
            <div className={cn(
              "px-4 py-2 rounded-xl font-bold text-lg shrink-0",
              evento.preco === 0 
                ? "bg-success/10 text-success" 
                : "bg-primary/10 text-primary"
            )}>
              {formatPreco()}
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-secondary rounded-xl p-4">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Data</span>
              </div>
              <p className="font-semibold text-foreground">
                {format(dataEvento, "d 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
            <div className="bg-secondary rounded-xl p-4">
              <div className="flex items-center gap-2 text-accent mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Horário</span>
              </div>
              <p className="font-semibold text-foreground">
                {format(dataEvento, 'HH:mm', { locale: ptBR })}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="bg-secondary rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-highlight mb-2">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-medium uppercase">Local</span>
            </div>
            <p className="font-semibold text-foreground mb-1">{evento.local}</p>
            {evento.endereco && (
              <p className="text-sm text-muted-foreground">{evento.endereco}</p>
            )}
          </div>

          {/* Description */}
          {evento.descricao && (
            <div className="mb-8">
              <h2 className="font-semibold text-foreground mb-3">Sobre o evento</h2>
              <p className="text-muted-foreground leading-relaxed">
                {evento.descricao}
              </p>
            </div>
          )}

          {/* CTA Button */}
          <Button className="w-full h-14 gradient-primary text-primary-foreground font-bold text-lg rounded-xl shadow-glow">
            <ExternalLink className="w-5 h-5 mr-2" />
            Ver ingressos
          </Button>
        </div>
      </div>
    </div>
  );
}