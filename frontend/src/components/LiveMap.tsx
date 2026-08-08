import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCrowdColor } from '../lib/utils';

interface VehicleLocation {
  latitude: number;
  longitude: number;
}

interface Vehicle {
  id: string;
  vehicleNumber: string;
  locations?: VehicleLocation[];
  occupancyPredictions?: Array<{ occupancyPercentage: number; crowdLevel: string }>;
  route?: { name: string; color?: string; stops?: Array<{ name: string; latitude: number; longitude: number; sequence: number }> };
}

interface LiveMapProps {
  vehicles: Vehicle[];
  height?: string;
  selectedVehicleId?: string;
  onSelectVehicle?: (id: string) => void;
}

export default function LiveMap({ vehicles, height = '400px', selectedVehicleId, onSelectVehicle }: LiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const polylineRef = useRef<L.Polyline | null>(null);

  // Initialize map centered at Chennai coordinates (~13.00, 80.20)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [13.0067, 80.2207],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors | CrowdSense AI',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update vehicle markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers that no longer exist
    const currentIds = new Set(vehicles.map(v => v.id));
    Object.keys(markersRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    vehicles.forEach(vehicle => {
      const loc = vehicle.locations?.[0];
      if (!loc) return;

      const occ = vehicle.occupancyPredictions?.[0];
      const pct = occ?.occupancyPercentage || 50;
      const color = getCrowdColor(occ?.crowdLevel || (pct < 50 ? 'LOW' : pct < 70 ? 'MODERATE' : pct < 90 ? 'CROWDED' : 'OVERLOADED'));

      const isSelected = selectedVehicleId === vehicle.id;

      // Create custom SVG marker icon
      const iconHtml = `
        <div style="
          background-color: ${color};
          width: ${isSelected ? '36px' : '30px'};
          height: ${isSelected ? '36px' : '30px'};
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 ${isSelected ? '16px' : '8px'} ${color};
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: ${isSelected ? '11px' : '10px'};
          cursor: pointer;
          transition: all 0.3s ease;
        ">
          ${vehicle.route?.name || 'BUS'}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-bus-marker',
        iconSize: [isSelected ? 36 : 30, isSelected ? 36 : 30],
        iconAnchor: [isSelected ? 18 : 15, isSelected ? 18 : 15],
      });

      if (markersRef.current[vehicle.id]) {
        // Smoothly move existing marker
        markersRef.current[vehicle.id].setLatLng([loc.latitude, loc.longitude]);
        markersRef.current[vehicle.id].setIcon(customIcon);
      } else {
        // Create new marker
        const marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <div style="color: #0f172a; padding: 4px;">
            <strong style="font-size: 14px;">${vehicle.vehicleNumber}</strong><br/>
            <span style="color: #475569;">Route: ${vehicle.route?.name || 'N/A'}</span><br/>
            <span style="color: ${color}; font-weight: bold;">Occupancy: ${Math.round(pct)}%</span>
          </div>
        `);

        if (onSelectVehicle) {
          marker.on('click', () => onSelectVehicle(vehicle.id));
        }

        markersRef.current[vehicle.id] = marker;
      }
    });

    // Draw polylines if selected vehicle has stops
    if (selectedVehicleId) {
      const selected = vehicles.find(v => v.id === selectedVehicleId);
      if (selected?.route?.stops && selected.route.stops.length > 1) {
        if (polylineRef.current) polylineRef.current.remove();
        const latLngs: L.LatLngTuple[] = selected.route.stops.map(s => [s.latitude, s.longitude]);
        polylineRef.current = L.polyline(latLngs, {
          color: selected.route.color || '#3B82F6',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 8',
        }).addTo(map);
      }
    }
  }, [vehicles, selectedVehicleId, onSelectVehicle]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: '100%' }}
      className="rounded-xl overflow-hidden shadow-inner z-0"
    />
  );
}
