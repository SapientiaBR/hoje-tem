import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Evento } from '@/hooks/useEventos';
import { EventCard } from './EventCard';
import { isSameDay } from 'date-fns';
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
    <div className="space-y-4">
      <div className="bg-card rounded-2xl p-4 flex justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          locale={ptBR}
          className="pointer-events-auto"
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-bold text-foreground">
          {date
            ? `Eventos em ${date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}`
            : 'Selecione uma data'}
        </h3>

        {eventosDoDia.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum evento programado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
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
