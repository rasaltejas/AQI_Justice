'use client';

import {
  FiAlertTriangle,
  FiFileText,
  FiClock,
  FiSend,
  FiBook,
} from 'react-icons/fi';

import { FaGavel } from 'react-icons/fa';


interface LegalViolationsProps {
  aqi: number;
  location: { lat: number; lon: number };
}

export default function LegalViolations({ aqi, location }: LegalViolationsProps) {
  const laws = [
    {
      id: 1,
      name: 'National Green Tribunal Act, 2010',
      code: 'NGT Order 2018',
      threshold: 200,
      penalty: '₹5 lakh - ₹50 lakh fine + Imprisonment',
      authority: 'National Green Tribunal',
      description: 'Mandates immediate action when AQI exceeds 200',
      status: aqi > 200 ? 'VIOLATED' : 'COMPLIANT',
      color: aqi > 200 ? 'red' : 'green',
      section: 'Section 15, NGT Act'
    },
    {
      id: 2,
      name: 'CPCB National Standards 2020',
      code: 'CPCB Notification S.O. 3067(E)',
      threshold: 250,
      penalty: 'Industry closure + ₹1 crore/day fine',
      authority: 'Central Pollution Control Board',
      description: 'Industrial emission standards for PM2.5',
      status: aqi > 250 ? 'VIOLATED' : 'COMPLIANT',
      color: aqi > 250 ? 'red' : 'green',
      section: 'Schedule VI, Rule 3'
    },
    {
      id: 3,
      name: 'WHO Air Quality Guidelines',
      code: 'WHO AQG 2021',
      threshold: 25,
      penalty: 'Health advisory + International pressure',
      authority: 'World Health Organization',
      description: 'Global health-based guideline values',
      status: aqi > 25 ? 'VIOLATED' : 'COMPLIANT',
      color: 'orange',
      section: 'Annex 1, Guideline 4.1'
    },
    {
      id: 4,
      name: 'Right to Clean Air (Article 21)',
      code: 'Constitution of India',
      threshold: 100,
      penalty: 'Fundamental rights violation case',
      authority: 'Supreme Court of India',
      description: 'Right to life includes right to clean air',
      status: aqi > 100 ? 'VIOLATED' : 'COMPLIANT',
      color: aqi > 100 ? 'red' : 'green',
      section: 'Article 21, Constitution'
    }
  ];

  const violatedLaws = laws.filter(law => law.status === 'VIOLATED');
  const majorViolations = violatedLaws.filter(l => l.color === 'red');
  const totalExcess = laws.reduce((sum, law) => sum + Math.max(0, aqi - law.threshold), 0);

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="mb-4 md:mb-0">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaGavel className="mr-3 text-blue-600" />
            Legal Compliance Status
          </h3>
          <p className="text-gray-600">Environmental law violation analysis</p>
        </div>
        
        {violatedLaws.length > 0 ? (
          <div className="flex flex-col md:items-end">
            <div className="px-6 py-3 bg-red-100 text-red-800 rounded-full font-bold text-lg flex items-center">
              <FiAlertTriangle className="mr-2" />
              {violatedLaws.length} Legal Violation{violatedLaws.length > 1 ? 's' : ''}
            </div>
            {majorViolations.length > 0 && (
              <div className="mt-2 text-sm text-red-600 font-medium">
                ⚠️ {majorViolations.length} major violation(s) detected
              </div>
            )}
          </div>
        ) : (
          <div className="px-6 py-3 bg-green-100 text-green-800 rounded-full font-bold text-lg flex items-center">
            ✅ All Laws Compliant
          </div>
        )}
      </div>

      {/* Legal Summary */}
      <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h4 className="font-bold text-blue-800 text-lg">Legal Summary</h4>
            <p className="text-blue-700 text-sm mt-1">
              {violatedLaws.length > 0 
                ? `Current AQI of ${aqi} violates ${violatedLaws.length} environmental law${violatedLaws.length > 1 ? 's' : ''}.`
                : 'All environmental laws are being followed.'}
            </p>
          </div>
          <div className="mt-3 md:mt-0 text-center">
            <div className="text-3xl font-bold text-blue-600">{totalExcess.toFixed(0)}</div>
            <div className="text-sm text-blue-700">Total excess points</div>
          </div>
        </div>
      </div>

      {/* Laws List */}
      <div className="space-y-6">
        {laws.map((law) => (
          <div 
            key={law.id}
            className={`p-5 rounded-2xl border-2 transition-all hover:shadow-lg ${
              law.status === 'VIOLATED' 
                ? 'border-red-200 bg-gradient-to-r from-red-50 to-red-50/50' 
                : 'border-green-200 bg-gradient-to-r from-green-50 to-green-50/50'
            }`}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              {/* Law Details */}
              <div className="mb-4 md:mb-0 md:mr-6">
                <div className="flex items-center mb-2">
                  <div className={`p-2 rounded-lg mr-3 ${
                    law.status === 'VIOLATED' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}>
                    <FiBook />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{law.name}</h4>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <FiFileText className="mr-1" />
                      <span>{law.code}</span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-11 space-y-2">
                  <div className="flex items-center text-sm">
                    <FiClock className="mr-2 text-gray-500" />
                    <span className="text-gray-700">
                      Threshold: <span className="font-bold">AQI ≤ {law.threshold}</span>
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">{law.description}</div>
                  <div className="text-sm">
                    <span className="font-medium">Authority:</span> {law.authority}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Legal Section:</span> {law.section}
                  </div>
                </div>
              </div>

              {/* Status & Penalty */}
              <div className="text-right min-w-[200px]">
                <div className={`px-4 py-2 rounded-full font-bold text-lg mb-3 ${
                  law.status === 'VIOLATED' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {law.status}
                </div>
                
                {law.status === 'VIOLATED' ? (
                  <div className="space-y-2">
                    <div className="p-2 bg-white rounded-lg border">
                      <div className="text-red-600 font-bold">
                        Excess: {aqi - law.threshold} points
                      </div>
                      <div className="text-sm text-red-600">
                        ({(((aqi - law.threshold) / law.threshold) * 100).toFixed(1)}% above limit)
                      </div>
                    </div>
                    <div className="text-sm font-medium text-red-700">
                      Penalty: {law.penalty}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-green-700">
                    Within legal limits
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legal Action Section */}
      {violatedLaws.length > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center mb-2">
                <FiAlertTriangle className="text-red-600 text-2xl mr-3" />
                <h4 className="text-xl font-bold text-red-800">Legal Action Required</h4>
              </div>
              <p className="text-red-700">
                You have the right to file an official complaint under {violatedLaws.map(l => l.name).join(', ')}.
                Each violation carries legal penalties enforceable by {violatedLaws.map(l => l.authority).join(', ')}.
              </p>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-xl font-bold flex items-center hover:shadow-xl transition-all">
              <FiSend className="mr-2" />
              File Legal Complaint
            </button>
          </div>
          
          {/* Legal Process */}
          <div className="mt-6 pt-6 border-t border-red-200">
            <h5 className="font-bold text-red-800 mb-3">Legal Process Timeline:</h5>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: '1', title: 'Complaint Filing', desc: 'Submit to NGT/CPCB' },
                { step: '2', title: 'Investigation', desc: '48-hour response' },
                { step: '3', title: 'Legal Notice', desc: 'Issued to polluters' },
                { step: '4', title: 'Penalty', desc: 'Fines & compliance' }
              ].map((step, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-10 h-10 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                    {step.step}
                  </div>
                  <div className="font-medium text-red-800">{step.title}</div>
                  <div className="text-xs text-red-600">{step.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Legal Disclaimer */}
      <div className="mt-6 text-xs text-gray-500 text-center">
        <p>
          This legal analysis is based on publicly available environmental laws and regulations. 
          Consult a legal professional for specific advice.
        </p>
      </div>
    </div>
  );
}