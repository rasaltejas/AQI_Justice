'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
);

interface MapViewProps {
  location: { lat: number; lon: number };
  aqi: number;
}

export default function MapView({ location, aqi }: MapViewProps) {
  const [isClient, setIsClient] = useState(false);
  const [pollutionSources, setPollutionSources] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState<number | null>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Generate realistic pollution sources
    const sources = [];
    const sourceTypes = [
      { type: 'Industrial Area', icon: '🏭', color: 'red', impact: 'High' },
      { type: 'Major Traffic Junction', icon: '🚗', color: 'orange', impact: 'High' },
      { type: 'Construction Site', icon: '🏗️', color: 'yellow', impact: 'Medium' },
      { type: 'Waste Burning', icon: '🔥', color: 'purple', impact: 'High' },
      { type: 'Power Plant', icon: '⚡', color: 'red', impact: 'Very High' },
      { type: 'Diesel Generator', icon: '🔋', color: 'orange', impact: 'Medium' },
      { type: 'Crematorium', icon: '🕯️', color: 'gray', impact: 'Medium' },
      { type: 'Market Area', icon: '🛍️', color: 'yellow', impact: 'Low' },
    ];
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * 2 * Math.PI;
      const distance = 0.01 + Math.random() * 0.02;
      const latOffset = Math.cos(angle) * distance;
      const lonOffset = Math.sin(angle) * distance;
      
      const sourceType = sourceTypes[i % sourceTypes.length];
      const intensity = Math.floor(Math.random() * 100) + 50;
      
      sources.push({
        id: i,
        lat: location.lat + latOffset,
        lon: location.lon + lonOffset,
        type: sourceType.type,
        icon: sourceType.icon,
        color: sourceType.color,
        impact: sourceType.impact,
        intensity: intensity,
        contribution: Math.round((intensity / 800) * aqi),
        details: `Estimated PM2.5: ${intensity} µg/m³`
      });
    }
    
    setPollutionSources(sources);
  }, [location, aqi]);

  const getAQIColor = (aqiVal: number) => {
    if (aqiVal <= 50) return '#10B981';
    if (aqiVal <= 100) return '#FBBF24';
    if (aqiVal <= 150) return '#F97316';
    if (aqiVal <= 200) return '#EF4444';
    if (aqiVal <= 300) return '#8B5CF6';
    return '#7C2D12';
  };

  if (!isClient) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 h-96 animate-pulse">
        <div className="h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
      </div>
    );
  }

  const L = require('leaflet');
  
  // Create custom icons
  const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [30, 46],
    iconAnchor: [15, 46],
    popupAnchor: [1, -34],
    shadowSize: [46, 46]
  });

  const pollutionIcons = {
    'red': new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    }),
    'orange': new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    }),
    'yellow': new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    }),
    'purple': new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    }),
    'gray': new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })
  };

  const totalContribution = pollutionSources.reduce((sum, source) => sum + source.contribution, 0);

  return (
    <div className="h-[500px] rounded-2xl overflow-hidden border-2 border-gray-200 relative">
      <MapContainer
        center={[location.lat, location.lon]}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        className="rounded-xl"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Pollution effect circle around user */}
        <Circle
          center={[location.lat, location.lon]}
          radius={500}
          pathOptions={{
            fillColor: getAQIColor(aqi),
            fillOpacity: 0.1,
            color: getAQIColor(aqi),
            opacity: 0.3,
            weight: 2
          }}
        />
        
        {/* User Location */}
        <Marker position={[location.lat, location.lon]} icon={userIcon}>
          <Popup>
            <div className="p-3 min-w-[200px]">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-blue-600">📍</span>
                </div>
                <div>
                  <h4 className="font-bold text-blue-700">Your Location</h4>
                  <div className="text-sm text-gray-600">AQI: {aqi}</div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium text-center ${
                aqi > 200 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {aqi > 200 ? '🚨 Legal Violation' : '✅ Within Limits'}
              </div>
            </div>
          </Popup>
        </Marker>
        
        {/* Pollution Sources */}
        {pollutionSources.map((source) => (
          <Marker 
            key={source.id}
            position={[source.lat, source.lon]} 
            icon={pollutionIcons[source.color as keyof typeof pollutionIcons]}
            eventHandlers={{
              click: () => setSelectedSource(source.id),
            }}
          >
            <Popup>
              <div className="p-3 min-w-[220px]">
                <div className="flex items-center mb-3">
                  <div className="text-2xl mr-3">{source.icon}</div>
                  <div>
                    <h4 className="font-bold text-gray-900">{source.type}</h4>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      source.impact === 'Very High' ? 'bg-red-100 text-red-800' :
                      source.impact === 'High' ? 'bg-orange-100 text-orange-800' :
                      source.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {source.impact} Impact
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Intensity:</span>
                    <span className="font-semibold">{source.intensity} µg/m³</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">AQI Contribution:</span>
                    <span className="font-semibold text-red-600">{source.contribution} points</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Distance:</span>
                    <span className="font-semibold">
                      {Math.round(distance(location.lat, location.lon, source.lat, source.lon) * 1000)}m
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t">
                  <button 
                    className="w-full px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                    onClick={() => alert(`Complaint template for ${source.type} copied to clipboard`)}
                  >
                    Report This Source
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl z-[1000] max-w-xs">
        <div className="font-bold text-gray-800 mb-3">Pollution Source Map</div>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-blue-600">📍</span>
            </div>
            <div>
              <div className="font-medium">Your Location</div>
              <div className="text-sm text-gray-600">AQI: {aqi}</div>
            </div>
          </div>
          
          <div className="border-t pt-3">
            <div className="text-sm font-medium text-gray-700 mb-2">Pollution Sources:</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-xs">High Impact</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                <span className="text-xs">Medium-High</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-xs">Medium</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-xs">Other Sources</span>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-3">
            <div className="text-sm font-medium text-gray-700 mb-2">Pollution Analysis:</div>
            <div className="text-sm text-gray-600">
              <div className="flex justify-between mb-1">
                <span>Total Sources:</span>
                <span className="font-semibold">{pollutionSources.length}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Estimated Contribution:</span>
                <span className="font-semibold text-red-600">{totalContribution} AQI points</span>
              </div>
              <div className="flex justify-between">
                <span>Your AQI:</span>
                <span className="font-bold" style={{ color: getAQIColor(aqi) }}>{aqi}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Selected Source Info */}
      {selectedSource !== null && (
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl z-[1000] max-w-xs border-2 border-blue-200">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-gray-800">Source Details</h4>
            <button 
              onClick={() => setSelectedSource(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          {(() => {
            const source = pollutionSources.find(s => s.id === selectedSource);
            if (!source) return null;
            
            return (
              <div>
                <div className="flex items-center mb-3">
                  <div className="text-2xl mr-3">{source.icon}</div>
                  <div>
                    <div className="font-bold">{source.type}</div>
                    <div className="text-sm text-gray-600">{source.impact} Impact Level</div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Contributes:</span>
                    <span className="font-semibold">{source.contribution} AQI points</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distance:</span>
                    <span className="font-semibold">
                      {Math.round(distance(location.lat, location.lon, source.lat, source.lon) * 1000)} meters
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pollution Level:</span>
                    <span className="font-semibold">{source.intensity} µg/m³</span>
                  </div>
                </div>
                
                <button 
                  className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg transition"
                  onClick={() => {
                    alert(`Complaint prepared for ${source.type}. Would you like to include this in your legal filing?`);
                    setSelectedSource(null);
                  }}
                >
                  Include in Complaint
                </button>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// Helper function to calculate distance between coordinates
function distance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}