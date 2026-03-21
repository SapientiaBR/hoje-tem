import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Evento } from '@/hooks/useEventos';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapTabProps {
  eventos: Evento[];
  onEventClick: (evento: Evento) => void;
}

export function MapTab({ eventos, onEventClick }: MapTabProps) {
  // Center of São Paulo
  const defaultCenter: [number, number] = [-23.5505, -46.6333];

  // Randomize some coordinates around SP for testing if events lack them
  const eventosComCoords = useMemo(() => {
    return eventos.map((ev, index) => {
      // Offset by index to spread them out a bit
      const latOffset = (index % 5) * 0.01 - 0.02;
      const lngOffset = (index % 7) * 0.01 - 0.03;
      
      const lat = ev.coordenadas_lat || (defaultCenter[0] + latOffset);
      const lng = ev.coordenadas_lng || (defaultCenter[1] + lngOffset);
      
      return { ...ev, lat, lng };
    });
  }, [eventos]);

  return (
    <div className="relative w-full h-[calc(100vh-16rem)] rounded-2xl overflow-hidden glass border border-border shadow-lg z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {eventosComCoords.map((evento) => (
          <Marker 
            key={evento.id} 
            position={[evento.lat, evento.lng]}
            eventHandlers={{
              click: () => onEventClick(evento),
            }}
          >
            <Popup>
              <div className="text-center cursor-pointer" onClick={() => onEventClick(evento)}>
                <h3 className="font-bold text-sm mb-1">{evento.nome}</h3>
                <p className="text-xs text-muted-foreground mb-2">{evento.local}</p>
                <div className="text-primary text-xs font-semibold">Ver detalhes</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
