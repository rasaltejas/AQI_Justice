'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FiAlertTriangle, FiFileText, FiShield, FiSend } from 'react-icons/fi';

interface ComplaintButtonProps {
  aqi: number;
  temperature: number;
  city: string;
  location: { lat: number; lon: number };
}

export default function ComplaintButton({ aqi, temperature, city, location }: ComplaintButtonProps) {
  const router = useRouter();

  const smokeInhaled = useMemo(() => Number((aqi / 100).toFixed(1)), [aqi]);

  const precautions = useMemo(() => {
    if (aqi <= 100) {
      return [
        'Normal outdoor activity is okay, but monitor AQI updates.',
        'Hydrate well and keep windows ventilated during low traffic hours.',
      ];
    }

    if (aqi <= 200) {
      return [
        'Limit prolonged outdoor exertion.',
        'Use a mask if you are sensitive to pollution.',
        'Prefer morning hours for outdoor movement.',
      ];
    }

    return [
      'Wear N95/N99 mask while stepping outdoors.',
      'Keep doors and windows closed during traffic peak hours.',
      'Use an air purifier and avoid outdoor exercise.',
      'Children, elderly, and asthma/heart patients should remain indoors.',
    ];
  }, [aqi]);

  const openComplaintForm = () => {
    const params = new URLSearchParams({
      aqi: String(aqi),
      city,
      temperature: String(temperature),
      smokeInhaled: String(smokeInhaled),
      lat: location.lat.toFixed(6),
      lon: location.lon.toFixed(6),
      precautions: precautions.join('|'),
      measuredAt: new Date().toISOString(),
    });

    router.push(`/complaint-email?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6">
      <div className="flex items-center mb-8">
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center mr-4">
            <FiFileText className="text-red-600 text-2xl" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <FiAlertTriangle className="text-white text-sm" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">File Legal Complaint</h3>
          <p className="text-gray-600">Auto-filled email with live environmental evidence</p>
        </div>
      </div>

      {aqi <= 200 ? (
        <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-100">
          <div className="text-6xl mb-4">📋</div>
          <h4 className="text-xl font-bold text-blue-800 mb-2">Legal Threshold Not Crossed</h4>
          <p className="text-blue-700 mb-6 max-w-md mx-auto">
            Your current AQI of {aqi} is below the legal complaint threshold (200). We are still tracking all metrics for your safety.
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-lg text-blue-700 font-medium">
            <FiShield className="mr-2" />
            Complaint form unlocks automatically when AQI is above 200
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-200">
            <h4 className="text-lg font-bold text-red-800 mb-2">Why your complaint is strong</h4>
            <ul className="text-sm text-red-700 space-y-2">
              <li>• Latest AQI: {aqi} (exceeds legal threshold by {aqi - 200} points)</li>
              <li>• Temperature recorded: {temperature}°C</li>
              <li>• 24-hour smoke inhalation equivalent: {smokeInhaled} cigarettes/day</li>
              <li>• Geo evidence: {city} ({location.lat.toFixed(4)}, {location.lon.toFixed(4)})</li>
            </ul>
          </div>

          <button
            onClick={openComplaintForm}
            className="w-full py-5 rounded-2xl font-bold text-xl transition-all duration-300 shadow-2xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white transform hover:scale-[1.02]"
          >
            <div className="flex items-center justify-center">
              <FiSend className="mr-3 text-2xl" />
              Open Auto-Filled Complaint Email Form
            </div>
          </button>
        </>
      )}
    </div>
  );
}
