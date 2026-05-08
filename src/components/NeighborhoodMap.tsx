import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Maximize2, Minimize2, Map as MapIcon, X } from 'lucide-react';

// Custom SVG Icon for Cells
const CellIcon = L.divIcon({
    html: `
        <div style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" fill="#5270ac" stroke="white" stroke-width="1.5"/>
                <circle cx="12" cy="10" r="3" fill="white"/>
            </svg>
        </div>
    `,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36]
});

interface CellPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  leaderName?: string;
}

interface MemberCluster {
  neighborhood: string;
  count: number;
  latitude: number;
  longitude: number;
}

interface Props {
  cells: CellPoint[];
  members: MemberCluster[];
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom]);
  return null;
}

const NeighborhoodMap: React.FC<Props> = ({ cells, members }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Rio de Janeiro center as default
  const defaultCenter: [number, number] = [-22.9068, -43.1729];
  const [center, setCenter] = useState<[number, number]>(defaultCenter);
  const [zoom, setZoom] = useState(12);

  // Update center based on data if available
  useEffect(() => {
    if (cells.length > 0) {
      setCenter([cells[0].latitude, cells[0].longitude]);
    } else if (members.length > 0) {
      setCenter([members[0].latitude, members[0].longitude]);
    }
  }, [cells, members]);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const MapContent = () => (
    <div className="relative h-full w-full">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', borderRadius: isExpanded ? '0' : '1.5rem' }}
        scrollWheelZoom={true}
      >
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Marcadores de Células */}
        {cells.map(cell => (
          <Marker key={cell.id} position={[cell.latitude, cell.longitude]} icon={CellIcon}>
            <Popup>
              <div className="p-1">
                <h4 className="font-bold text-brand-dark m-0">{cell.name}</h4>
                {cell.leaderName && <p className="text-xs text-gray-500 mt-1 mb-0">Líder: {cell.leaderName}</p>}
                <a href={`/celulas/${cell.id}`} className="text-[10px] text-brand-primary font-bold uppercase mt-2 block">Ver Detalhes</a>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Manchas de Calor / Círculos de Membros */}
        {members.map((m, i) => (
          <CircleMarker 
            key={`member-${i}`}
            center={[m.latitude, m.longitude]}
            pathOptions={{ 
              fillColor: '#f59e0b', 
              color: '#d97706', 
              weight: 1, 
              fillOpacity: 0.3 + (Math.min(m.count, 10) * 0.05) 
            }}
            radius={15 + (Math.min(m.count, 20) * 2)}
          >
            <Popup>
              <div className="text-center">
                <h4 className="font-bold text-brand-dark m-0">{m.neighborhood}</h4>
                <p className="text-xs text-gray-500 m-0">{m.count} membros</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Botão Expandir/Recolher */}
      <button 
        onClick={(e) => { e.stopPropagation(); toggleExpand(); }}
        className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-xl shadow-lg border border-gray-100 text-gray-600 hover:text-brand-primary transition-all"
        title={isExpanded ? "Recolher" : "Expandir"}
      >
        {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </button>

      {!isExpanded && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur px-3 py-2 rounded-xl border border-white/20 shadow-sm pointer-events-none">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-600">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-primary border border-white"></div>
              <span>PINS: UNIDADES (CÉLULAS)</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-600">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white"></div>
              <span>CÍRCULOS: DENSIDADE DE MEMBROS</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
        <header className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center">
              <MapIcon size={20} />
            </div>
            <div>
              <h2 className="font-bold text-brand-dark">Mapa Estratégico</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Células e Membros</p>
            </div>
          </div>
          <button onClick={toggleExpand} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all">
            <X size={24} />
          </button>
        </header>
        <div className="flex-1">
          <MapContent />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full rounded-3xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer" onClick={toggleExpand}>
      <MapContent />
    </div>
  );
};

export default NeighborhoodMap;
