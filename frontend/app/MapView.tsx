import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import "leaflet/dist/leaflet.css";
import { fetchAQIData } from '../utils/api'; // Utility function to fetch AQI data

const Map = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

const MapView = () => {
  const [aqiData, setAqiData] = useState([]);
  const [searchCity, setSearchCity] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    // Fetch AQI data for all locations
    const fetchData = async () => {
      const data = await fetchAQIData();
      setAqiData(data);
    };
    fetchData();
  }, []);

  const handleSearch = async () => {
    if (searchCity) {
      const cityData = await fetchAQIData(searchCity);
      setSelectedCity(cityData);
    }
  };

  return (
    <div className="map-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for a city"
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">Search</button>
      </div>
      <Map center={[20, 0]} zoom={2} style={{ height: '80vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />
        {aqiData.map((location, index) => (
          <Marker key={index} position={[location.lat, location.lon]}>
            <Popup>
              <div>
                <h3>{location.city}</h3>
                <p>AQI: {location.aqi}</p>
                <button onClick={() => window.location.href=`/complaintPage?city=${location.city}&aqi=${location.aqi}`}>
                  File Complaint
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
        {selectedCity && (
          <Marker position={[selectedCity.lat, selectedCity.lon]}>
            <Popup>
              <div>
                <h3>{selectedCity.city}</h3>
                <p>AQI: {selectedCity.aqi}</p>
                <button onClick={() => window.location.href=`/complaintPage?city=${selectedCity.city}&aqi=${selectedCity.aqi}`}>
                  File Complaint
                </button>
              </div>
            </Popup>
          </Marker>
        )}
      </Map>
    </div>
  );
};

export default MapView;