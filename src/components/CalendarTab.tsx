import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Evento } from '@/hooks/useEventos';
import { EventCard } from './EventCard';
import { isSameDay, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarTabProps {
  eventos: Evento[];
  isFavorito: (id: string) => boolean;
  onToggleFavorito: (id: string) => void;
  onEventClick: (evento: Evento) => void;
}

export function CalendarTab({ eventos, isFavorito, onToggleFavorito, onEventClick }: CalendarTabProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const eventosDoDia = eventos.filter((evento) => {
    if (!date) return false;
    return isSameDay(new Date(evento.data), date);
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="headline text-foreground text-3xl mb-1">SUA AGENDA</h1>
        <p className="label-mono text-[10px] text-muted-foreground">o que você não pode perder</p>
      </div>

      <div className="bg-card p-3 flex justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          locale={ptBR}
          className="pointer-events-auto"
        />
      </div>

      <div className="space-y-3">
        <h2 className="headline text-foreground text-xl">
          {date ? format(date, "d 'DE' MMMM", { locale: ptBR }).toUpperCase() : 'ESCOLHA UM DIA'}
        </h2>

        {eventosDoDia.length === 0 ? (
          <div className="text-center py-12 border border-border">
            <p className="label-mono text-[11px] text-muted-foreground">NADA ROLANDO POR AQUI</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {eventosDoDia.map((evento) => (
              <EventCard
                key={evento.id}
                evento={evento}
                isFavorito={isFavorito(evento.id)}
                onToggleFavorito={() => onToggleFavorito(evento.id)}
                onClick={() => onEventClick(evento)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
