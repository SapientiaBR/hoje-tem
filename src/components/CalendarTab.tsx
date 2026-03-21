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
    <div className="flex flex-col gap-6 pb-6">
      <div className="flex justify-center">
        <div className="glass rounded-2xl p-2 inline-block shadow-lg border border-border">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={ptBR}
            className="rounded-xl w-full"
            classNames={{
              day_today: "bg-accent/50 text-accent-foreground font-bold",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-bold shadow-[0_0_12px_hsl(267_90%_65%/0.5)]",
            }}
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">
          {date ? `Eventos em ${date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}` : 'Selecione uma data'}
        </h2>
        
        {eventosDoDia.length === 0 ? (
          <div className="text-center py-8 glass rounded-2xl border border-border/50">
            <p className="text-muted-foreground">Nenhum evento programado para este dia.</p>
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
