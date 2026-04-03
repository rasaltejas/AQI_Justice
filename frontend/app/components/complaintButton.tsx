'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FiFileText, FiSend, FiCheck, FiCopy, FiAlertTriangle, FiClock, FiShield, FiMail } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface ComplaintButtonProps {
  aqi: number;
  temperature: number;
  city: string;
  location: { lat: number; lon: number };
  healthImpact?: string;
  precautions?: string;
}

export default function ComplaintButton({ 
  aqi, 
  temperature, 
  location, 
  city = "Your Location", 
  healthImpact = "" 
}: ComplaintButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complaintId, setComplaintId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const smokeInhaled = useMemo(() => Number((aqi / 100).toFixed(1)), [aqi]);

  const precautionsList = useMemo(() => {
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

  const fileComplaint = async () => {
    if (aqi > 200) {
      setIsSubmitting(true);
      // Simulate progress
      let interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 150);

      setTimeout(() => {
        const params = new URLSearchParams({
          aqi: aqi.toString(),
          lat: location.lat.toString(),
          lon: location.lon.toString(),
          city: city,
          temperature: temperature.toString(),
          smokeInhaled: smokeInhaled.toString()
        });
        setComplaintId(`AQI-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
        setIsSubmitting(false);
      }, 2000);
    } else {
      alert('The AQI is below the legal threshold of 200.');
    }
  };

  const openComplaintForm = () => {
    const params = new URLSearchParams({
      aqi: String(aqi),
      city,
      temperature: String(temperature),
      smokeInhaled: String(smokeInhaled),
      lat: location.lat.toFixed(6),
      lon: location.lon.toFixed(6),
      measuredAt: new Date().toISOString(),
    });
    router.push(`/complaint-email?${params.toString()}`);
  };

  if (complaintId) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl shadow-2xl p-6 border-2 border-green-200">
        <div className="text-center mb-8">
          <FiCheck className="text-green-500 text-5xl mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-green-800">Complaint Filed!</h3>
          <p className="text-green-700">ID: {complaintId}</p>
        </div>
        <button onClick={() => setComplaintId(null)} className="w-full py-3 bg-green-600 text-white rounded-xl">Done</button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6">
      <div className="flex items-center mb-8">
        <FiFileText className="text-red-600 text-3xl mr-4" />
        <div>
          <h3 className="text-2xl font-bold text-gray-900">File Legal Complaint</h3>
          <p className="text-gray-600">Evidence-based reporting for {city}</p>
        </div>
      </div>

      {aqi <= 200 ? (
        <div className="text-center p-8 bg-blue-50 rounded-2xl">
          <FiShield className="text-blue-500 text-4xl mx-auto mb-2" />
          <p className="text-blue-800">AQI is {aqi}. Legal form unlocks at 200+.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-sm text-red-700">
            <strong>Evidence Captured:</strong> {aqi} AQI, {temperature}°C, {smokeInhaled} cigarettes/day equivalent.
          </div>
          
          <button
            onClick={openComplaintForm}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-2xl font-bold flex items-center justify-center shadow-lg"
          >
            <FiSend className="mr-2" /> Open Email Form
          </button>

          <button
            onClick={fileComplaint}
            disabled={isSubmitting}
            className="w-full py-4 border-2 border-red-600 text-red-600 rounded-2xl font-bold"
          >
            {isSubmitting ? `Filing... ${progress}%` : "Register in System"}
          </button>
        </div>
      )}
    </div>
  );
}