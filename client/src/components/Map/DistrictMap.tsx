import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';

// Fix for default marker icon in Leaflet + React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

import { useApp } from '../../context/AppContext';
import type { MapTheme } from '../../types';

// ============================================================
// Types
// ============================================================

interface DistrictMapProps {
  center: [number, number];
  zoom?: number;
  onLocationSelect: (lat: number, lon: number) => void;
  selectedLocation: [number, number] | null;
  className?: string;
}

// ============================================================
// Helper Components
// ============================================================

// Component to handle programmatic pan/zoom
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

// Component to handle map clicks
function MapClickHandler({ onSelect }: { onSelect: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ============================================================
// Main Map Component
// ============================================================

export default function DistrictMap({ 
  center, 
  zoom = 6, 
  onLocationSelect, 
  selectedLocation,
  className 
}: DistrictMapProps) {
  const { state, setMapTheme } = useApp();
  const theme = state.mapTheme;

  // Tile layer configs
  const tileLayers = {
    default: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    },
    vegetation: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    },
    weather: {
      url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">HOT</a>'
    },
    heat: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }
  };

  const themes: { id: MapTheme; label: string; icon: string }[] = [
    { id: 'default', label: 'Default', icon: '🗺️' },
    { id: 'vegetation', label: 'NDVI', icon: '🌱' },
    { id: 'weather', label: 'Rain', icon: '🌧️' },
    { id: 'heat', label: 'Heat', icon: '🔥' },
  ];

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 ${className}`} style={{ height: '400px' }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
        id="report-map-container"
      >
        <AnimatePresence mode="wait">
          <TileLayer
            key={theme}
            url={tileLayers[theme].url}
            attribution={tileLayers[theme].attribution}
          />
        </AnimatePresence>

        <ChangeView center={center} zoom={selectedLocation ? 10 : zoom} />
        <MapClickHandler onSelect={onLocationSelect} />

        {selectedLocation && (
          <Marker position={selectedLocation} />
        )}
      </MapContainer>

      {/* Theme Switcher UI */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] flex gap-2 p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/20 shadow-xl">
        {themes.map((t) => (
          <motion.button
            key={t.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMapTheme(t.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-xs font-medium ${
              theme === t.id 
                ? 'bg-green-500 text-white shadow-lg' 
                : 'text-white/70 hover:bg-white/10'
            }`}
          >
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Overlay info */}
      <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
        <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 text-[10px] text-white/60 uppercase tracking-widest font-bold">
          {theme} Layer Active
        </div>
      </div>
    </div>
  );
}
