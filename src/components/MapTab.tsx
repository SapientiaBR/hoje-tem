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

// Pin neon para eventos em destaque
const neonIcon = L.divIcon({
  className: '',
  html: `<div style="width:18px;height:18px;border-radius:9999px;background:#D7FF00;border:2px solid #050505;box-shadow:0 0 12px #D7FF00;"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const defaultIcon = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;border-radius:9999px;background:#fff;border:2px solid #050505;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
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
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="headline text-foreground text-3xl flex items-center gap-2">
            RADAR <span className="neon-dot" />
          </h1>
          <p className="label-mono text-[10px] text-muted-foreground mt-1">
            o que tá vibrando perto de você
          </p>
        </div>
        <span className="label-mono text-[10px] text-neon">{eventos.length} SINAIS</span>
      </div>

      <div className="w-full h-[calc(100vh-16rem)] overflow-hidden border border-border">
        <MapContainer
          center={defaultCenter}
          zoom={12}
          style={{ height: '100%', width: '100%', background: '#050505' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {eventosComCoords.map((evento) => (
            <Marker
              key={evento.id}
              position={[evento.lat, evento.lng]}
              icon={evento.destaque ? neonIcon : defaultIcon}
            >
              <Popup>
                <div className="cursor-pointer" onClick={() => onEventClick(evento)}>
                  <p className="font-bold text-sm uppercase">{evento.nome}</p>
                  <p className="text-xs">{evento.local}</p>
                  <p className="text-xs mt-1" style={{ color: '#D7FF00' }}>VER →</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
