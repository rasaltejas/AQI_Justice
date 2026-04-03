'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { FiSearch } from 'react-icons/fi';

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

import { fetchAQIData } from '../../utils/api';

interface MapViewProps {
  location: { lat: number; lon: number };
  aqi: number;
}

interface CityAQI {
  city: string;
  lat: number;
  lon: number;
  aqi: number;
}

// Global cities with known AQI data for demo purposes
const DEMO_CITIES: CityAQI[] = [
  { city: 'Delhi', lat: 28.6139, lon: 77.209, aqi: 287 },
  { city: 'Mumbai', lat: 19.0760, lon: 72.8777, aqi: 156 },
  { city: 'Bangalore', lat: 12.9716, lon: 77.5946, aqi: 98 },
  { city: 'Kolkata', lat: 22.5726, lon: 88.3639, aqi: 234 },
  { city: 'Chennai', lat: 13.0827, lon: 80.2707, aqi: 145 },
  { city: 'Hyderabad', lat: 17.3850, lon: 78.4867, aqi: 176 },
  { city: 'Beijing', lat: 39.9042, lon: 116.4074, aqi: 198 },
  { city: 'Shanghai', lat: 31.2304, lon: 121.4737, aqi: 124 },
  { city: 'Tokyo', lat: 35.6762, lon: 139.6503, aqi: 67 },
  { city: 'London', lat: 51.5074, lon: -0.1278, aqi: 45 },
  { city: 'New York', lat: 40.7128, lon: -74.0060, aqi: 89 },
  { city: 'Los Angeles', lat: 34.0522, lon: -118.2437, aqi: 134 },
  { city: 'Dubai', lat: 25.2048, lon: 55.2708, aqi: 167 },
  { city: 'Singapore', lat: 1.3521, lon: 103.8198, aqi: 78 },
  { city: 'Bangkok', lat: 13.7563, lon: 100.5018, aqi: 203 },
];

export default function MapView({ location, aqi }: MapViewProps) {
  const [isClient, setIsClient] = useState(false);
  const [searchCity, setSearchCity] = useState('');
  const [citiesAQI, setCitiesAQI] = useState<CityAQI[]>(DEMO_CITIES);
  const [selectedCity, setSelectedCity] = useState<CityAQI | null>(null);
  const [filteredCities, setFilteredCities] = useState<CityAQI[]>(DEMO_CITIES);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
  const [userLocation, setUserLocation] = useState<CityAQI | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [userIcon, setUserIcon] = useState<any>(null);
  const [cityIcon, setCityIcon] = useState<any>(null);

  // Function to find nearest city from GPS coordinates
  const findNearestCity = (lat: number, lon: number): CityAQI | null => {
    let nearest: CityAQI | null = null;
    let minDistance = Infinity;

    DEMO_CITIES.forEach((city) => {
      const latDiff = Math.abs(city.lat - lat);
      const lonDiff = Math.abs(city.lon - lon);
      const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);

      if (distance < minDistance) {
        minDistance = distance;
        nearest = city;
      }
    });

    return nearest;
  };

  useEffect(() => {
    setIsClient(true);
    setCitiesAQI(DEMO_CITIES);
    setFilteredCities(DEMO_CITIES);
    
    // Create leaflet icons
    const L = require('leaflet');
    const newUserIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [30, 46],
      iconAnchor: [15, 46],
      popupAnchor: [1, -34],
      shadowSize: [46, 46]
    });
    
    const newCityIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    
    setUserIcon(newUserIcon);
    setCityIcon(newCityIcon);
    
    // Get user's GPS location and fetch real AQI data
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Fetch REAL AQI data from WAQI API using coordinates
            const response = await fetch(
              `https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=e47ccb9f3bd66f152ea701ad4063d07748d60120`
            );
            const data = await response.json();
            
            if (data.status === 'ok' && data.data) {
              // Use actual AQI from API
              const userCity: CityAQI = {
                city: data.data.city?.name || 'Your Location',
                lat: latitude,
                lon: longitude,
                aqi: Math.round(data.data.aqi) || 100
              };
              
              setUserLocation(userCity);
              setSelectedCity(userCity);
              setMapCenter([latitude, longitude]);
            } else {
              // Fallback to nearest city if API fails
              const nearestCity = findNearestCity(latitude, longitude);
              
              const fallbackCity: CityAQI = nearestCity
                ? {
                    city: nearestCity.city + ' (Nearest)',
                    lat: latitude,
                    lon: longitude,
                    aqi: nearestCity.aqi
                  }
                : {
                    city: 'Your Location',
                    lat: latitude,
                    lon: longitude,
                    aqi: 100
                  };
              
              setUserLocation(fallbackCity);
              setSelectedCity(fallbackCity);
              setMapCenter([latitude, longitude]);
            }
            
            setLocationLoading(false);
          } catch (error) {
            console.error('Error fetching AQI:', error);
            
            // Fallback to nearest demo city
            const nearestCity = findNearestCity(latitude, longitude);
            
            const fallbackCity: CityAQI = nearestCity
              ? {
                  city: nearestCity.city + ' (Nearest)',
                  lat: latitude,
                  lon: longitude,
                  aqi: nearestCity.aqi
                }
              : {
                  city: 'Your Location',
                  lat: latitude,
                  lon: longitude,
                  aqi: 100
                };
            
            setUserLocation(fallbackCity);
            setSelectedCity(fallbackCity);
            setMapCenter([latitude, longitude]);
            setLocationLoading(false);
          }
        },
        (error) => {
          console.log('Location access denied or unavailable');
          // Show Delhi as default if location not available
          setUserLocation(DEMO_CITIES[0]);
          setSelectedCity(DEMO_CITIES[0]);
          setMapCenter([DEMO_CITIES[0].lat, DEMO_CITIES[0].lon]);
          setLocationLoading(false);
        }
      );
    } else {
      setLocationLoading(false);
    }
  }, []);

  const handleSearch = (city: string) => {
    setSearchCity(city);
    
    if (city.trim() === '') {
      // Reset to user's location if available
      if (userLocation) {
        setSelectedCity(userLocation);
        setMapCenter([userLocation.lat, userLocation.lon]);
        setFilteredCities(DEMO_CITIES);
      } else {
        setFilteredCities(DEMO_CITIES);
        setMapCenter([20, 0]);
        setSelectedCity(null);
      }
      return;
    }

    const found = DEMO_CITIES.find(c => 
      c.city.toLowerCase().includes(city.toLowerCase())
    );

    if (found) {
      setSelectedCity(found);
      setFilteredCities([found]);
      setMapCenter([found.lat, found.lon]);
    } else {
      setFilteredCities(
        DEMO_CITIES.filter(c =>
          c.city.toLowerCase().includes(city.toLowerCase())
        )
      );
    }
  };

  const getAQIColor = (aqiValue: number) => {
    if (aqiValue <= 50) return '#10B981';
    if (aqiValue <= 100) return '#FBBF24';
    if (aqiValue <= 150) return '#F97316';
    if (aqiValue <= 200) return '#EF4444';
    if (aqiValue <= 300) return '#8B5CF6';
    return '#7C2D12';
  };

  const getAQILabel = (aqiValue: number) => {
    if (aqiValue <= 50) return 'Good';
    if (aqiValue <= 100) return 'Moderate';
    if (aqiValue <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqiValue <= 200) return 'Unhealthy';
    if (aqiValue <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  if (!isClient) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 h-[600px] animate-pulse">
        <div className="h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Search Bar */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for a city..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
              handleSearch(searchCity);
  }
}}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white placeholder-gray-400"
            />
          </div>
          <button
            onClick={() => {
              if (userLocation) {
                handleSearch('');
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
            title="Go to your location"
          >
            📍 My Location
          </button>
          <button
            onClick={() => handleSearch('')}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          >
            Reset
          </button>
        </div>

        {/* User Location Status */}
        {locationLoading && (
          <p className="text-sm text-blue-600 font-semibold">🔄 Requesting your location...</p>
        )}
        {userLocation && !searchCity && (
          <p className="text-sm text-green-600 font-semibold">📍 Showing your location: {userLocation.city}</p>
        )}

        {filteredCities.length > 1 && (
          <div className="mt-3 max-h-48 overflow-y-auto">
            <p className="text-sm text-gray-600 mb-2">Found {filteredCities.length} cities:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {filteredCities.map((city) => (
                <button
                  key={city.city}
                  onClick={() => handleSearch(city.city)}
                  className="p-2 bg-white border rounded-lg hover:bg-blue-50 transition text-sm"
                  style={{ borderColor: getAQIColor(city.aqi) }}
                >
                  <div className="font-semibold" style={{ color: getAQIColor(city.aqi) }}>{city.city}</div>
                  <div className="text-xs text-gray-600">AQI: {city.aqi}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Map and Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        {/* Map */}
        <div className="md:col-span-2 h-[500px] rounded-xl overflow-hidden border-2 border-gray-200">
          <MapContainer
            center={mapCenter}
            zoom={selectedCity ? 13 : 3}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* User Location Marker */}
            {userLocation && (
              <Marker
                key="user-location"
                position={[userLocation.lat, userLocation.lon]}
                icon={userIcon}
              >
                <Popup>
                  <div className="p-3">
                    <h3 className="font-bold text-lg">📍 {userLocation.city}</h3>
                    <p className="text-sm my-2">
                      AQI: <span style={{ color: getAQIColor(userLocation.aqi), fontWeight: 'bold' }}>{userLocation.aqi}</span>
                    </p>
                    <p className="text-xs text-gray-600">{getAQILabel(userLocation.aqi)}</p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Other Cities Markers */}
            {filteredCities.map((city) => (
              <Marker
                key={city.city}
                position={[city.lat, city.lon]}
                icon={cityIcon}
              >
                <Popup>
                  <div className="p-3">
                    <h3 className="font-bold text-lg">{city.city}</h3>
                    <p className="text-sm my-2">
                      AQI: <span style={{ color: getAQIColor(city.aqi), fontWeight: 'bold' }}>{city.aqi}</span>
                    </p>
                    <p className="text-xs text-gray-600">{getAQILabel(city.aqi)}</p>
                    <button
                      onClick={() => window.location.href = `/complaintPage?city=${city.city}&aqi=${city.aqi}&lat=${city.lat}&lon=${city.lon}`}
                      className="mt-2 w-full bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
                    >
                      File Complaint
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* City Details */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 h-[500px] overflow-y-auto">
          <h3 className="text-lg font-bold mb-4 text-gray-800">
            {selectedCity?.city === 'Your Location' ? '📍 Your Location' : '🏙️ City Details'}
          </h3>
          {selectedCity ? (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border-l-4" style={{ borderColor: getAQIColor(selectedCity.aqi) }}>
                <h4 className="text-xl font-bold" style={{ color: getAQIColor(selectedCity.aqi) }}>
                  {selectedCity.city === 'Your Location' ? '📍 Your Current Location' : selectedCity.city}
                </h4>
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">AQI Level:</span>
                    <span 
                      className="ml-2 font-bold text-lg" 
                      style={{ color: getAQIColor(selectedCity.aqi) }}
                    >
                      {selectedCity.aqi}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Status:</span>
                    <span className="ml-2 font-semibold" style={{ color: getAQIColor(selectedCity.aqi) }}>
                      {getAQILabel(selectedCity.aqi)}
                    </span>
                  </p>
                </div>
              </div>

              {/* AQI Explanation */}
              <div className="bg-white rounded-lg p-3 border-l-4" style={{ borderColor: getAQIColor(selectedCity.aqi) }}>
                <h5 className="font-semibold text-gray-800 mb-2">Why this AQI?</h5>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {selectedCity.aqi <= 50
                    ? '✅ Low traffic, good vegetation coverage, strong wind patterns dispersing pollutants.'
                    : selectedCity.aqi <= 100
                    ? '⚠️ Moderate industrial activity, some traffic congestion, seasonal weather patterns.'
                    : selectedCity.aqi <= 150
                    ? '⚠️ Growing traffic congestion, industrial zones nearby, limited vegetation.'
                    : selectedCity.aqi <= 200
                    ? '🔴 Heavy traffic, multiple industrial areas, coal-based power generation, stubble burning season.'
                    : selectedCity.aqi <= 300
                    ? '🔴 Major industrial centers, dense traffic, geographical valleys trapping pollutants, construction activities.'
                    : '⛔ Extreme pollution from multiple sources: heavy traffic, unregulated industries, coal plants, crop burning, weather inversion.'}
                </p>
              </div>

              {/* Main Pollution Sources */}
              <div className="bg-white rounded-lg p-3 border-l-4" style={{ borderColor: getAQIColor(selectedCity.aqi) }}>
                <h5 className="font-semibold text-gray-800 mb-2">Pollution Sources:</h5>
                <ul className="text-xs text-gray-700 space-y-1">
                  {selectedCity.aqi > 150 && (
                    <>
                      <li>🚗 Vehicle emissions & traffic</li>
                      <li>🏭 Industrial facilities</li>
                      <li>🔥 Biomass burning</li>
                    </>
                  )}
                  {selectedCity.aqi > 100 && selectedCity.aqi <= 150 && (
                    <>
                      <li>🚗 Moderate traffic congestion</li>
                      <li>🏗️ Construction activities</li>
                    </>
                  )}
                  {selectedCity.aqi <= 100 && (
                    <li>✅ Clean air from wind & vegetation</li>
                  )}
                </ul>
              </div>

              {/* Action Button */}
              <button
                onClick={() => window.location.href = `/complaintPage?city=${selectedCity.city}&aqi=${selectedCity.aqi}&lat=${selectedCity.lat}&lon=${selectedCity.lon}`}
                className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-semibold"
              >
                📋 File Complaint
              </button>
            </div>
          ) : locationLoading ? (
            <div className="text-center text-blue-500 mt-10">
              <p className="mb-4">⏳ Getting your location...</p>
              <p className="text-sm">Please allow location access for best experience.</p>
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-10">
              <p className="mb-4">👆 Search or click a city on the map</p>
              <p className="text-sm">Search for a specific city to see details and file complaints.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
