'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { FiTrendingUp, FiTrendingDown, FiRefreshCw, FiSun, FiCloud, FiCloudRain, FiWind, FiThermometer, FiDroplet } from 'react-icons/fi';
import axios from 'axios';

interface AQIMeterProps {
  latitude?: number;
  longitude?: number;
  city?: string;
}

interface AQIData {
  aqi: number;
  components: {
    co?: number;
    no2?: number;
    o3?: number;
    so2?: number;
    pm2_5: number;
    pm10: number;
    [key: string]: number | undefined;
  };
  timestamp: string;
  dominentpol?: string;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherDescription: string;
  weatherIcon: string;
  pressure?: number;
  visibility?: number;
}

interface HourlyDataPoint {
  time: string;
  aqi: number;
  temperature: number;
  current: boolean;
}

export default function AQIMeter({ 
  latitude = 28.6139, 
  longitude = 77.2090,
  city = "Your Location"
 }: AQIMeterProps) {
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trend, setTrend] = useState(0);

  // 🔑 INSERT YOUR API TOKENS HERE
  const AQI_API_TOKEN = 'e47ccb9f3bd66f152ea701ad4063d07748d60120';
  const WEATHER_API_TOKEN = '9d5cf00132mshfb203d0d02226afp12341djsnabe411eb8378';
  
  // 🔗 INSERT YOUR API ENDPOINTS HERE
  const AQI_API_URL = `https://api.waqi.info/feed/here/?token=e47ccb9f3bd66f152ea701ad4063d07748d60120`; 
  // Example: `https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=${AQI_API_TOKEN}`
  // Example: `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${AQI_API_TOKEN}`
  
  const WEATHER_API_URL = `https://open-weather13.p.rapidapi.com/fivedaysforcast?latitude=40.730610&longitude=-73.935242&lang=EN`;
  // Example: `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_TOKEN}&units=metric`
  // Example: `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_TOKEN}&q=${latitude},${longitude}`

  // Function to parse AQI API response based on provider
  const parseAQIData = (data: any): AQIData => {
    // Check for WAQI API response format
    if (data.data && data.data.aqi) {
      return {
        aqi: data.data.aqi,
        components: data.data.iaqi || {
          pm2_5: data.data.iaqi?.pm25?.v || 0,
          pm10: data.data.iaqi?.pm10?.v || 0,
        },
        timestamp: data.data.time?.s || new Date().toISOString(),
        dominentpol: data.data.dominentpol
      };
    }
    
    // Check for OpenWeather Air Pollution API format
    if (data.list && data.list[0]) {
      return {
        aqi: data.list[0].main.aqi,
        components: data.list[0].components,
        timestamp: new Date(data.list[0].dt * 1000).toISOString()
      };
    }
    
    // Check for AirVisual API format
    if (data.data && data.data.current && data.data.current.pollution) {
      return {
        aqi: data.data.current.pollution.aqius,
        components: {
          pm2_5: data.data.current.pollution.aqius,
          pm10: data.data.current.weather?.hu || 0
        },
        timestamp: data.data.current.pollution.ts
      };
    }
    
    // Default fallback
    return {
      aqi: 50,
      components: { pm2_5: 10, pm10: 20 },
      timestamp: new Date().toISOString()
    };
  };

  // Function to parse Weather API response
  const parseWeatherData = (data: any): WeatherData => {
    // OpenWeather format
    if (data.main && data.weather) {
      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        windSpeed: data.wind?.speed || 0,
        weatherDescription: data.weather[0]?.description || '',
        weatherIcon: data.weather[0]?.icon || '',
        pressure: data.main.pressure,
        visibility: data.visibility
      };
    }
    
    // WeatherAPI format
    if (data.current) {
      return {
        temperature: data.current.temp_c,
        humidity: data.current.humidity,
        windSpeed: data.current.wind_kph / 3.6, // Convert to m/s
        weatherDescription: data.current.condition?.text || '',
        weatherIcon: data.current.condition?.icon || '',
        pressure: data.current.pressure_mb,
        visibility: data.current.vis_km * 1000 // Convert to meters
      };
    }
    
    // Default fallback
    return {
      temperature: 25,
      humidity: 60,
      windSpeed: 2.5,
      weatherDescription: 'Clear sky',
      weatherIcon: '01d'
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch AQI data
      const aqiResponse = await axios.get(AQI_API_URL);
      const parsedAQIData = parseAQIData(aqiResponse.data);
      setAqiData(parsedAQIData);

      // Fetch Weather data
      const weatherResponse = await axios.get(WEATHER_API_URL);
      const parsedWeatherData = parseWeatherData(weatherResponse.data);
      setWeatherData(parsedWeatherData);

      // Generate hourly forecast based on current data
      generateHourlyForecast(parsedAQIData.aqi, parsedWeatherData);

    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to fetch data. Using sample data.');
      
      // Fallback to sample data
      const sampleAQI = Math.floor(Math.random() * 200) + 30;
      setAqiData({
        aqi: sampleAQI,
        components: {
          pm2_5: sampleAQI * 0.4,
          pm10: sampleAQI * 0.6,
          no2: sampleAQI * 0.1,
          o3: sampleAQI * 0.08
        },
        timestamp: new Date().toISOString()
      });
      
      setWeatherData({
        temperature: 25 + Math.random() * 10,
        humidity: 40 + Math.random() * 40,
        windSpeed: 1 + Math.random() * 5,
        weatherDescription: ['Clear', 'Partly Cloudy', 'Cloudy'][Math.floor(Math.random() * 3)],
        weatherIcon: '01d'
      });
      
      generateHourlyForecast(sampleAQI, {
        temperature: 25,
        humidity: 60,
        windSpeed: 2.5,
        weatherDescription: 'Clear'
      });
      
    } finally {
      setLoading(false);
    }
  };

  const generateHourlyForecast = (currentAQI: number, currentWeather: any) => {
    const data: HourlyDataPoint[] = [];
    const now = new Date();
    const currentHour = now.getHours();
    
    for (let i = 0; i < 24; i++) {
      const hour = (currentHour + i) % 24;
      const hourOffset = i;
      
      // Calculate AQI trend throughout the day
      let hourAQI = currentAQI;
      
      // Morning traffic peak (8-10 AM)
      if (hour >= 8 && hour <= 10) {
        hourAQI *= 1.3;
      }
      // Evening peak (6-9 PM)
      else if (hour >= 18 && hour <= 21) {
        hourAQI *= 1.25;
      }
      // Afternoon improvement
      else if (hour >= 12 && hour <= 16) {
        hourAQI *= 0.9;
      }
      // Night improvement
      else if (hour >= 22 || hour <= 5) {
        hourAQI *= 0.8;
      }
      
      // Add weather influence
      if (currentWeather.weatherDescription?.toLowerCase().includes('rain')) {
        hourAQI *= 0.7; // Rain cleans the air
      } else if (currentWeather.weatherDescription?.toLowerCase().includes('wind')) {
        hourAQI *= 0.85; // Wind disperses pollution
      } else if (currentWeather.weatherDescription?.toLowerCase().includes('fog') || 
                 currentWeather.weatherDescription?.toLowerCase().includes('haze')) {
        hourAQI *= 1.3; // Fog traps pollution
      }
      
      // Add some randomness
      hourAQI += (Math.random() * 15 - 7.5);
      hourAQI = Math.max(0, Math.min(500, Math.round(hourAQI)));
      
      // Temperature variation
      const baseTemp = currentWeather.temperature || 25;
      let hourTemp = baseTemp;
      
      if (hour >= 0 && hour <= 6) hourTemp -= 5; // Early morning cool
      if (hour >= 13 && hour <= 15) hourTemp += 3; // Afternoon warm
      
      data.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        aqi: Math.round(hourAQI),
        temperature: Math.round(hourTemp),
        current: i === 0
      });
    }
    
    setHourlyData(data);
    
    // Calculate trend (current vs next hour)
    if (data.length >= 2) {
      setTrend(data[1].aqi - data[0].aqi);
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

  const getAQIDescription = (aqiValue: number) => {
    if (aqiValue <= 50) return 'Good';
    if (aqiValue <= 100) return 'Moderate';
    if (aqiValue <= 150) return 'Unhealthy for Sensitive';
    if (aqiValue <= 200) return 'Unhealthy';
    if (aqiValue <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const getWeatherIcon = (iconCode: string) => {
    // Map OpenWeather icon codes to emojis or components
    if (iconCode.includes('01')) return '☀️'; // Clear sky
    if (iconCode.includes('02')) return '⛅'; // Few clouds
    if (iconCode.includes('03') || iconCode.includes('04')) return '☁️'; // Clouds
    if (iconCode.includes('09') || iconCode.includes('10')) return '🌧️'; // Rain
    if (iconCode.includes('11')) return '⛈️'; // Thunderstorm
    if (iconCode.includes('13')) return '❄️'; // Snow
    if (iconCode.includes('50')) return '🌫️'; // Mist
    
    return '🌈';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-200 min-w-[180px]">
          <p className="font-bold text-gray-900 mb-1">{label}</p>
          {payload.map((pld: any, index: number) => (
            <div key={index} className="flex justify-between items-center mb-1">
              <span className="text-gray-600 mr-4">
                {pld.dataKey === 'aqi' ? 'AQI' : 'Temp'}
              </span>
              <span 
                className="font-bold" 
                style={{ color: pld.dataKey === 'aqi' ? getAQIColor(pld.value) : '#374151' }}
              >
                {pld.value} {pld.dataKey === 'aqi' ? '' : '°C'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchData, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [latitude, longitude]);

  const aqiColor = getAQIColor(aqiData?.aqi || 0);
  const aqiDescription = getAQIDescription(aqiData?.aqi || 0);
  const weatherIcon = getWeatherIcon(weatherData?.weatherIcon || '');

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-6 border border-gray-100">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Air Quality & Weather</h3>
              <p className="text-gray-600">{city}</p>
              <p className="text-sm text-gray-500 mt-1">
                {aqiData && `Last update: ${formatTime(aqiData.timestamp)}`}
              </p>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <FiRefreshCw className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Current AQI Badge */}
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <div className="text-right">
            <div className="text-4xl font-bold" style={{ color: aqiColor }}>
              {aqiData?.aqi || '--'}
            </div>
            <div className="flex items-center text-sm">
              {trend > 0 ? (
                <>
                  <FiTrendingUp className="text-red-500 mr-1" />
                  <span className="text-red-600">+{trend} trend</span>
                </>
              ) : trend < 0 ? (
                <>
                  <FiTrendingDown className="text-green-500 mr-1" />
                  <span className="text-green-600">{trend} trend</span>
                </>
              ) : (
                <span className="text-gray-600">Stable</span>
              )}
            </div>
          </div>
          <div 
            className="px-4 py-2 rounded-full font-bold text-white min-w-[140px] text-center shadow-lg"
            style={{ backgroundColor: aqiColor }}
          >
            {aqiDescription}
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm">
          ⚠️ {error}
        </div>
      )}
      
      {/* Weather Info */}
      {weatherData && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="text-5xl mr-4">{weatherIcon}</div>
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {Math.round(weatherData.temperature)}°C
                </div>
                <div className="text-gray-700 capitalize">{weatherData.weatherDescription}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <FiDroplet className="text-blue-500 mr-2" />
                <div>
                  <div className="text-sm text-gray-600">Humidity</div>
                  <div className="font-bold text-gray-900">{weatherData.humidity}%</div>
                </div>
              </div>
              <div className="flex items-center">
                <FiWind className="text-gray-500 mr-2" />
                <div>
                  <div className="text-sm text-gray-600">Wind</div>
                  <div className="font-bold text-gray-900">{weatherData.windSpeed.toFixed(1)} m/s</div>
                </div>
              </div>
              {weatherData.pressure && (
                <div className="flex items-center">
                  <FiThermometer className="text-red-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-600">Pressure</div>
                    <div className="font-bold text-gray-900">{weatherData.pressure} hPa</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Chart */}
      <div className="h-72 mb-6">
        {hourlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyData}>
              <defs>
                <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={aqiColor} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={aqiColor} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#6B7280"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.split(':')[0]}
              />
              <YAxis 
                yAxisId="left"
                stroke={aqiColor}
                tick={{ fontSize: 12 }}
                domain={[0, 500]}
                label={{ value: 'AQI', angle: -90, position: 'insideLeft', offset: 10 }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#F59E0B"
                tick={{ fontSize: 12 }}
                domain={['dataMin - 5', 'dataMax + 5']}
                label={{ value: '°C', angle: 90, position: 'insideRight', offset: 10 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="aqi" 
                stroke={aqiColor}
                strokeWidth={3}
                fill="url(#colorAqi)"
                name="AQI"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="temperature" 
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: "#F59E0B" }}
                name="Temperature"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading chart data...
          </div>
        )}
      </div>
      
      {/* Pollutant Details & AQI Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pollutant Breakdown */}
        {aqiData?.components && (
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-3">Pollutant Levels</h4>
            <div className="space-y-3">
              {Object.entries(aqiData.components)
                .filter(([key]) => ['pm2_5', 'pm10', 'no2', 'o3', 'so2', 'co'].includes(key))
                .map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-sm font-medium text-gray-700">
                        {key.replace('_', '.')}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {value?.toFixed(2)} μg/m³
                    </div>
                  </div>
              ))}
            </div>
          </div>
        )}
        
        {/* AQI Legend */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-2xl border border-gray-200">
          <h4 className="font-bold text-gray-900 mb-3">AQI Scale</h4>
          <div className="space-y-2">
            {[
              { range: '0-50', label: 'Good', color: 'bg-green-500', desc: 'Air quality is satisfactory' },
              { range: '51-100', label: 'Moderate', color: 'bg-yellow-500', desc: 'Acceptable air quality' },
              { range: '101-150', label: 'Unhealthy for Sensitive', color: 'bg-orange-500', desc: 'Members of sensitive groups may experience health effects' },
              { range: '151-200', label: 'Unhealthy', color: 'bg-red-500', desc: 'Everyone may begin to experience health effects' },
              { range: '201-300', label: 'Very Unhealthy', color: 'bg-purple-500', desc: 'Health warnings of emergency conditions' },
              { range: '301+', label: 'Hazardous', color: 'bg-red-800', desc: 'Health alert: everyone may experience serious health effects' }
            ].map((item, index) => (
              <div key={index} className="flex items-start">
                <div className={`w-4 h-4 ${item.color} rounded-full mt-1 mr-3 flex-shrink-0`}></div>
                <div>
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-gray-800">{item.range}</span>
                    <span className="text-sm font-medium text-gray-700 ml-2">{item.label}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Recommendations */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
        <h4 className="font-bold text-green-800 mb-2">Health Recommendations</h4>
        <p className="text-sm text-green-700">
          {aqiData && aqiData.aqi <= 100 
            ? "✅ Great air quality! Perfect for outdoor activities." 
            : aqiData && aqiData.aqi <= 150 
            ? "⚠️ Moderate air quality. Sensitive individuals should reduce outdoor exertion."
            : aqiData && aqiData.aqi <= 200 
            ? "⚠️ Unhealthy air quality. Everyone should reduce prolonged outdoor exertion."
            : "🚨 Poor air quality. Avoid outdoor activities. Close windows and use air purifiers."
          }
        </p>
      </div>
    </div>
  );
}