'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface AQIMeterProps {
  aqi: number;
  location: { lat: number; lon: number };
}

export default function AQIMeter({ aqi, location }: AQIMeterProps) {
  // Generate realistic hourly data
  const generateHourlyData = () => {
    const data = [];
    const now = new Date();
    const currentHour = now.getHours();
    
    for (let i = 0; i < 24; i++) {
      const hour = (currentHour - 23 + i + 24) % 24;
      let hourAQI = 150;
      
      // Daily pattern
      if (hour >= 8 && hour <= 10) hourAQI = 280; // Morning peak
      else if (hour >= 18 && hour <= 20) hourAQI = 260; // Evening peak
      else if (hour >= 12 && hour <= 16) hourAQI = 220; // Afternoon
      else if (hour >= 0 && hour <= 6) hourAQI = 180; // Night
      else hourAQI = 200; // Other hours
      
      // Add randomness
      hourAQI += Math.random() * 40 - 20;
      hourAQI = Math.max(100, Math.min(350, hourAQI));
      
      data.push({
        time: `${hour}:00`,
        aqi: Math.round(hourAQI),
        current: hour === currentHour
      });
    }
    
    return data;
  };

  const hourlyData = generateHourlyData();
  const currentIndex = hourlyData.findIndex(d => d.current);
  const trend = currentIndex > 0 ? hourlyData[currentIndex].aqi - hourlyData[currentIndex - 1].aqi : 0;

  const getAQIColor = (aqiValue: number) => {
    if (aqiValue <= 50) return '#10B981';
    if (aqiValue <= 100) return '#FBBF24';
    if (aqiValue <= 150) return '#F97316';
    if (aqiValue <= 200) return '#EF4444';
    if (aqiValue <= 300) return '#8B5CF6';
    return '#7C2D12';
  };

  const aqiColor = getAQIColor(aqi);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-200">
          <p className="font-bold text-gray-900">{label}</p>
          <p className="text-lg font-bold" style={{ color: getAQIColor(payload[0].value) }}>
            AQI: {payload[0].value}
          </p>
          <p className="text-sm text-gray-600">
            {payload[0].value <= 50 ? "Good" : 
             payload[0].value <= 100 ? "Moderate" : 
             payload[0].value <= 150 ? "Unhealthy for Sensitive" : 
             payload[0].value <= 200 ? "Unhealthy" : 
             payload[0].value <= 300 ? "Very Unhealthy" : "Hazardous"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">24-Hour AQI Trend</h3>
          <p className="text-gray-600">Real-time monitoring with predictions</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="text-right">
            <div className="text-4xl font-bold" style={{ color: aqiColor }}>{aqi}</div>
            <div className="flex items-center text-sm">
              {trend > 0 ? (
                <>
                  <FiTrendingUp className="text-red-500 mr-1" />
                  <span className="text-red-600">+{trend} from last hour</span>
                </>
              ) : (
                <>
                  <FiTrendingDown className="text-green-500 mr-1" />
                  <span className="text-green-600">{trend} from last hour</span>
                </>
              )}
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full font-bold text-white`} style={{ backgroundColor: aqiColor }}>
            {aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : aqi <= 150 ? 'Unhealthy for Sensitive' : aqi <= 200 ? 'Unhealthy' : aqi <= 300 ? 'Very Unhealthy' : 'Hazardous'}
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={hourlyData}>
            <defs>
              <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={aqiColor} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={aqiColor} stopOpacity={0}/>
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
              stroke="#6B7280"
              tick={{ fontSize: 12 }}
              domain={[100, 350]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="aqi" 
              stroke={aqiColor}
              strokeWidth={3}
              fill="url(#colorAqi)"
              dot={{ r: 4, fill: aqiColor, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 8, fill: aqiColor, strokeWidth: 2, stroke: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* AQI Legend */}
      <div className="mt-8 grid grid-cols-5 gap-2">
        {[
          { range: '0-50', label: 'Good', color: 'bg-green-500' },
          { range: '51-100', label: 'Moderate', color: 'bg-yellow-500' },
          { range: '101-150', label: 'Unhealthy', color: 'bg-orange-500' },
          { range: '151-200', label: 'Very Unhealthy', color: 'bg-red-500' },
          { range: '201+', label: 'Hazardous', color: 'bg-purple-500' }
        ].map((item, index) => (
          <div key={index} className="text-center">
            <div className={`h-2 ${item.color} rounded-full mb-2`}></div>
            <div className="text-xs font-medium text-gray-700">{item.range}</div>
            <div className="text-xs text-gray-500">{item.label}</div>
          </div>
        ))}
      </div>
      
      {/* Peak Hours Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <span className="text-blue-600">⏰</span>
          </div>
          <div>
            <h4 className="font-bold text-blue-800">Peak Pollution Hours</h4>
            <p className="text-sm text-blue-700">
              Highest AQI typically occurs 8-10 AM and 6-8 PM due to traffic. Plan outdoor activities accordingly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}