import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Evento } from '@/hooks/useEventos';
import L from 'leaflet';

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
  const defaultCenter: [number, number] = [-23.5505, -46.6333];

  const eventosComCoords = useMemo(() => {
    return eventos.map((ev, index) => {
      const latOffset = (index % 5) * 0.01 - 0.02;
      const lngOffset = (index % 7) * 0.01 - 0.03;
      return {
        ...ev,
        lat: ev.coordenadas_lat || (defaultCenter[0] + latOffset),
        lng: ev.coordenadas_lng || (defaultCenter[1] + lngOffset),
      };
    });
  }, [eventos]);

  return (
    <div className="w-full h-[calc(100vh-12rem)] rounded-2xl overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {eventosComCoords.map((evento) => (
          <Marker key={evento.id} position={[evento.lat, evento.lng]}>
            <Popup>
              <div
                className="cursor-pointer"
                onClick={() => onEventClick(evento)}
              >
                <p className="font-bold text-sm">{evento.nome}</p>
                <p className="text-xs text-muted-foreground">{evento.local}</p>
                <p className="text-xs text-primary mt-1">Ver detalhes</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
