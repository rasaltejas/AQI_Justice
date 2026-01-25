'use client';

import { FiHeart, FiAlertCircle, FiActivity, FiEye } from 'react-icons/fi';
import { FaLungs } from 'react-icons/fa';
import { useEffect, useState } from 'react';
interface HealthImpactProps {
  aqi: number;
}

export default function HealthImpact({ aqi }: HealthImpactProps) {
  const [animatedCigarettes, setAnimatedCigarettes] = useState(0);
  
  useEffect(() => {
    const targetCigarettes = aqi / 100;
    const duration = 1500;
    const steps = 60;
    const stepValue = targetCigarettes / steps;
    
    let current = 0;
    const interval = setInterval(() => {
      current += stepValue;
      if (current >= targetCigarettes) {
        current = targetCigarettes;
        clearInterval(interval);
      }
      setAnimatedCigarettes(Number(current.toFixed(1)));
    }, duration / steps);
    
    return () => clearInterval(interval);
  }, [aqi]);

  const getHealthData = () => {
    if (aqi <= 50) {
      return {
        level: 'Good',
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        risks: ['Air quality is satisfactory', 'No health risks expected'],
        advice: ['Ideal for outdoor activities', 'No restrictions needed'],
        icon: '✅'
      };
    } else if (aqi <= 100) {
      return {
        level: 'Moderate',
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        risks: ['Minor discomfort for sensitive people', 'Possible irritation'],
        advice: ['Sensitive groups limit outdoor exertion', 'Monitor symptoms'],
        icon: '⚠️'
      };
    } else if (aqi <= 150) {
      return {
        level: 'Unhealthy for Sensitive',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        risks: ['Increased risk for asthma patients', 'Breathing discomfort', 'Aggravated heart disease'],
        advice: ['Sensitive groups avoid outdoor activities', 'Keep medications handy', 'Use air purifiers'],
        icon: '😷'
      };
    } else if (aqi <= 200) {
      return {
        level: 'Unhealthy',
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        risks: ['Everyone may experience effects', 'Serious aggravation for sensitive', 'Reduced lung function'],
        advice: ['Avoid prolonged outdoor exertion', 'Sensitive groups stay indoors', 'Run air purifiers continuously'],
        icon: '🚨'
      };
    } else if (aqi <= 300) {
      return {
        level: 'Very Unhealthy',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        risks: ['Health alert for everyone', 'Serious cardiovascular effects', 'High infection risk', 'Emergency conditions'],
        advice: ['Avoid all outdoor activities', 'Stay indoors with purifier', 'Wear N95 mask if going out'],
        icon: '🆘'
      };
    } else {
      return {
        level: 'Hazardous',
        color: 'text-red-800',
        bg: 'bg-red-100',
        border: 'border-red-300',
        risks: ['Health emergency', 'Immediate respiratory distress', 'Premature mortality', 'All exposed affected'],
        advice: ['Remain indoors', 'Use highest grade air purifier', 'Consider temporary relocation'],
        icon: '💀'
      };
    }
  };

  const health = getHealthData();
  const cigarettes = aqi / 100;

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6">
      <div className="flex items-center mb-8">
        <div className={`p-3 rounded-xl ${health.bg} ${health.color} mr-4`}>
          <FiHeart className="text-2xl" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Health Impact Analysis</h3>
          <p className="text-gray-600">Personalized risk assessment</p>
        </div>
      </div>
      
      {/* Cigarette Equivalent */}
      <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-100">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 md:mr-6">
            <div className="flex items-center mb-2">
              <FiActivity className="text-red-600 mr-2 text-xl" />
              <h4 className="text-lg font-bold text-red-800">Cigarette Equivalent</h4>
            </div>
            <p className="text-red-700 text-sm">
              Breathing this air for 24 hours equals smoking:
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-red-600 mb-2">
              {animatedCigarettes}
            </div>
            <div className="text-lg font-semibold text-red-700">cigarettes</div>
          </div>
        </div>
        
        {/* Cigarette Visualization */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {Array.from({ length: Math.min(Math.ceil(cigarettes), 12) }).map((_, i) => (
            <div key={i} className="relative">
              <div className="w-8 h-12 bg-gradient-to-b from-red-300 to-red-500 rounded-sm"></div>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-yellow-600 rounded-full"></div>
              {i < Math.ceil(cigarettes) - 1 && (
                <div className="absolute top-1/2 right-0 transform translate-x-1/2 w-2 h-1 bg-gray-400"></div>
              )}
            </div>
          ))}
          {cigarettes > 12 && (
            <div className="flex items-center ml-2 text-gray-600">
              <span className="text-2xl">+</span>
              <span className="ml-1">{(cigarettes - 12).toFixed(1)} more</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-center text-sm text-red-600">
          {cigarettes > 5 ? "⚠️ Equivalent to heavy smoker's daily intake" :
           cigarettes > 2 ? "⚠️ Significant health impact equivalent to moderate smoking" :
           "Mild impact but avoidable"}
        </div>
      </div>

      {/* Health Risks */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <FiAlertCircle className="text-red-600 mr-2" />
          <h4 className="text-lg font-bold text-gray-900">Health Risks</h4>
        </div>
        <div className={`p-4 rounded-xl ${health.bg} ${health.border}`}>
          <ul className="space-y-3">
            {health.risks.map((risk, index) => (
              <li key={index} className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-800">{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Medical Advice */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <FaLungs className="text-green-600 mr-2" />
          <h4 className="text-lg font-bold text-gray-900">Medical Advice</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {health.advice.map((advice, index) => (
            <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-start">
                <span className="text-green-600 mr-2 text-lg">✓</span>
                <span className="text-gray-800">{advice}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Groups */}
      {aqi > 100 && (
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-center mb-3">
            <FiEye className="text-blue-600 mr-2" />
            <h4 className="font-bold text-blue-800">High Risk Groups</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { emoji: "👶", label: "Children", desc: "Developing lungs" },
              { emoji: "👴", label: "Elderly", desc: "Weakened immunity" },
              { emoji: "🫁", label: "Asthma", desc: "Respiratory issues" },
              { emoji: "❤️", label: "Heart Patients", desc: "Cardiovascular risk" }
            ].map((group, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 text-center hover:shadow-md transition">
                <div className="text-2xl mb-1">{group.emoji}</div>
                <div className="font-medium text-gray-800">{group.label}</div>
                <div className="text-xs text-gray-600 mt-1">{group.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Warning */}
      {aqi > 200 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl text-white">
          <div className="flex items-center">
            <div className="text-2xl mr-3">🚨</div>
            <div>
              <h4 className="font-bold">HEALTH EMERGENCY</h4>
              <p className="text-sm opacity-90">
                Current AQI requires immediate protective measures. Follow all medical advice.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}