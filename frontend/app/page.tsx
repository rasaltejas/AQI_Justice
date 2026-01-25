'use client';

import { useState, useEffect, useRef } from 'react';
import AQImeter from './components/AQImeter';
import LegalViolations from './components/LegalViolations';
import HealthImpact from './components/HealthImpact';
import ComplaintButton from './components/complaintButton';
import MapView from './components/MapView';
import { FiActivity, FiAlertCircle, FiMap, FiShield, FiUsers, FiTrendingUp, FiClock, FiNavigation } from 'react-icons/fi';

export default function Home() {
  const [location, setLocation] = useState({ lat: 28.6139, lon: 77.2090 });
  const [aqi, setAqi] = useState(287); // Default high AQI for demo
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("Delhi");
  const [time, setTime] = useState("");
  const [stats, setStats] = useState([
    { icon: <FiUsers />, label: "Users Protected", value: "1,247+", change: "+12%" },
    { icon: <FiAlertCircle />, label: "Complaints Filed", value: "428", change: "+23%" },
    { icon: <FiShield />, label: "Legal Wins", value: "₹2.1Cr", change: "+₹42L" },
    { icon: <FiTrendingUp />, label: "AQI Reduced", value: "18%", change: "-3%" },
  ]);

  const demoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);

    getLocation();
    return () => clearInterval(timer);
  }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });
          
          // Get city name
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const cityName = data.address.city || data.address.town || data.address.state || "Your Location";
            setCity(cityName);
          } catch {
            setCity("Your Location");
          }
          
          // For demo, we'll use mock AQI
          simulateAQIUpdate();
        },
        () => {
          // Default to Delhi for demo
          setCity("Delhi");
          simulateAQIUpdate();
        }
      );
    } else {
      setCity("Delhi");
      simulateAQIUpdate();
    }
  };

  const simulateAQIUpdate = () => {
    // Realistic AQI simulation based on time of day
    const hour = new Date().getHours();
    let baseAQI = 180;
    
    if ((hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 20)) {
      baseAQI = 287; // Peak traffic hours
    } else if (hour >= 12 && hour <= 16) {
      baseAQI = 220; // Afternoon
    } else {
      baseAQI = 180; // Night
    }
    
    // Add some random variation
    const variation = Math.floor(Math.random() * 30) - 15;
    const finalAQI = Math.max(100, Math.min(400, baseAQI + variation));
    
    setAqi(finalAQI);
    setLoading(false);
    
    // Update stats periodically
    setStats(prev => prev.map(stat => ({
      ...stat,
      value: stat.label === "Complaints Filed" 
        ? `${Math.min(999, parseInt(stat.value) + 1)}+`
        : stat.value
    })));
  };

  const scrollToDemo = () => {
    demoRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-3xl font-bold mt-8 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Air Justice
          </h2>
          <p className="text-gray-600 mt-4 animate-pulse">
            Initializing environmental protection system...
          </p>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 overflow-hidden">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
        
        <header className="relative z-10">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl text-white">🌬️</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Air Justice</h1>
                  <p className="text-gray-600">Empowering citizens against pollution</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="hidden md:block text-right">
                  <div className="flex items-center space-x-2">
                    <FiClock className="text-gray-500" />
                    <span className="text-gray-700 font-medium">{time}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <FiNavigation className="text-blue-500" />
                    <span className="text-blue-600 font-semibold">📍 {city}</span>
                  </div>
                </div>
                <button 
                  onClick={scrollToDemo}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  Try Live Demo
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium mb-6">
              <FiAlertCircle className="mr-2" />
              LIVE AQI: <span className="ml-2 font-bold text-red-600">{aqi} - {aqi > 200 ? "LEGAL VIOLATION" : "Moderate"}</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Fight Pollution With
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Legal Power
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              When air quality violates environmental laws, we give you 1-tap power to file official complaints. 
              No more helplessness—just clean air action.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                🚨 File Complaint Now
              </button>
              <button className="px-8 py-4 bg-white text-gray-800 border-2 border-gray-200 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all">
                📊 See How It Works
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-8 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div 
              key={idx}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600 mr-4">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                  <div className={`text-xs font-medium mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} this week
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Demo Section */}
      <div ref={demoRef} className="container mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Live Air Quality Dashboard</h2>
          <p className="text-gray-600 text-lg">Real-time monitoring with legal compliance checks</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Dashboard */}
          <div className="lg:col-span-2 space-y-8">
            {/* AQI Meter Card */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-3xl shadow-2xl p-8 text-white transform hover:scale-[1.01] transition-all duration-300">
              <div className="flex flex-col md:flex-row justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Current Air Quality</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    <span className="opacity-90">Live monitoring for {city}</span>
                  </div>
                </div>
                <div className="text-right mt-4 md:mt-0">
                  <div className="text-7xl font-bold mb-2">{aqi}</div>
                  <div className="text-2xl font-bold bg-white/20 px-4 py-2 rounded-full inline-block">
                    {aqi <= 50 ? "Good" : aqi <= 100 ? "Moderate" : aqi <= 150 ? "Unhealthy for Sensitive" : aqi <= 200 ? "Unhealthy" : aqi <= 300 ? "Very Unhealthy" : "Hazardous"}
                  </div>
                </div>
              </div>
              
              {/* AQI Scale */}
              <div className="mb-8">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-green-200">Good</span>
                  <span className="text-yellow-200">Moderate</span>
                  <span className="text-orange-200">Unhealthy</span>
                  <span className="text-red-200">Very Unhealthy</span>
                  <span className="text-purple-200">Hazardous</span>
                </div>
                <div className="h-4 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-600 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((aqi / 500) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-2 opacity-75">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                  <span>150</span>
                  <span>200</span>
                  <span>300+</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <FiActivity className="mr-2" />
                  <span>Last updated: Just now</span>
                </div>
                <button 
                  onClick={() => simulateAQIUpdate()}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                >
                  Refresh Data
                </button>
              </div>
            </div>

            {/* Map & Legal Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl shadow-2xl p-6 transform hover:scale-[1.01] transition-all">
                <div className="flex items-center mb-6">
                  <div className="p-3 rounded-xl bg-blue-100 text-blue-600 mr-3">
                    <FiMap className="text-xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Pollution Source Map</h3>
                </div>
                <MapView location={location} aqi={aqi} />
              </div>
              
              <div className="bg-white rounded-3xl shadow-2xl p-6 transform hover:scale-[1.01] transition-all">
                <LegalViolations aqi={aqi} location={location} />
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-8">
            <HealthImpact aqi={aqi} />
            <ComplaintButton aqi={aqi} location={location} />
            
            {/* Protection Tips */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl shadow-xl p-6 border border-green-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="p-2 rounded-lg bg-green-100 text-green-600 mr-3">
                  💡
                </div>
                Smart Protection Tips
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-white/60 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-red-600">🪟</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Window Management</h4>
                      <p className="text-sm text-gray-600">Close windows during peak hours (10AM-6PM)</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white/60 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600">😷</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Mask Recommendation</h4>
                      <p className="text-sm text-gray-600">Use N95 mask if AQI {'>'} 150</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white/60 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-purple-600">🏃</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Exercise Timing</h4>
                      <p className="text-sm text-gray-600">Best time for outdoor: 7-8 AM</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white/60 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-yellow-600">🌿</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Air Purifying Plants</h4>
                      <p className="text-sm text-gray-600">Snake Plant, Areca Palm, Peace Lily</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-xl">🌬️</span>
                </div>
                <h2 className="text-2xl font-bold">Air Justice</h2>
              </div>
              <p className="text-gray-400">
                Empowering citizens to fight air pollution through legal action. 
                Together, we can breathe cleaner air.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">How It Works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Legal Framework</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Success Stories</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Research & Data</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Contact Authorities</h3>
              <ul className="space-y-2 text-gray-400">
                <li>📧 NGT: ngt@nic.in</li>
                <li>📞 CPCB: 1800-180-1551</li>
                <li>🌐 airjustice.tech</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <p>© 2026 Air Justice. Built with ❤️ for hackathon. All rights reserved.</p>
            <p className="text-sm mt-2">This is a demo project for educational purposes.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}