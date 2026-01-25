'use client';

import { useState, useEffect } from 'react';
import { FiFileText, FiSend, FiCheck, FiCopy, FiAlertTriangle, FiClock, FiShield, FiMail } from 'react-icons/fi';

interface ComplaintButtonProps {
  aqi: number;
  location: { lat: number; lon: number };
}

export default function ComplaintButton({ aqi, location }: ComplaintButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complaintId, setComplaintId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    if (isSubmitting) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            
            // Generate complaint ID
            setTimeout(() => {
              const newId = 'AJ-' + new Date().getTime().toString().slice(-8);
              setComplaintId(newId);
              setIsSubmitting(false);
              setProgress(0);
            }, 500);
            
            return 100;
          }
          return prev + 2;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isSubmitting]);

  const fileComplaint = async () => {
    if (aqi <= 200) return;
    setIsSubmitting(true);
  };

  const generateComplaintText = () => {
    const date = new Date();
    return `======================================================================
                     OFFICIAL COMPLAINT - AIR QUALITY VIOLATION
======================================================================

COMPLAINT ID: ${complaintId}
DATE: ${date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
TIME: ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}

===================== COMPLAINANT INFORMATION =====================
Name: [Citizen Name Protected]
Contact: [Protected via Air Justice Platform]
Platform: Air Justice - Citizen Empowerment Initiative
Reference: AJ-CIT-${new Date().getFullYear()}

===================== VIOLATION DETAILS ==========================
Location Coordinates:
  • Latitude: ${location.lat.toFixed(6)}
  • Longitude: ${location.lon.toFixed(6)}
  • Estimated Area: ${getAreaName(location)}

Air Quality Measurements:
  • Current AQI: ${aqi} µg/m³
  • PM2.5 Concentration: ${(aqi * 0.6).toFixed(1)} µg/m³
  • PM10 Concentration: ${(aqi * 0.8).toFixed(1)} µg/m³
  • Measurement Time: ${date.toISOString()}
  • Data Source: Air Justice Real-time Monitoring System

Legal Thresholds Exceeded:
  1. National Green Tribunal Limit: 200 µg/m³ (Exceeded by ${aqi - 200} points)
  2. CPCB Standards: 250 µg/m³ (Exceeded by ${aqi - 250} points)
  3. WHO Guidelines: 25 µg/m³ (Exceeded by ${aqi - 25} points)

===================== LEGAL BASIS ================================
This complaint is filed under:
  1. National Green Tribunal Act, 2010 (Section 15, 16, 19)
  2. Air (Prevention and Control of Pollution) Act, 1981 (Section 16, 17, 21)
  3. Environment Protection Act, 1986 (Section 3, 5)
  4. Right to Clean Air under Article 21, Constitution of India
  5. Supreme Court Judgement: MC Mehta vs Union of India (1986)

===================== HEALTH IMPACT ASSESSMENT ===================
Based on WHO Health Risk Assessment Model:
  • Cigarette Equivalent: ${(aqi / 100).toFixed(1)} cigarettes per day
  • Affected Population: Approximately 1,000-5,000 people in vicinity
  • High Risk Groups: Children, Elderly, Asthma Patients, Heart Patients
  • Emergency Health Advisory: Category ${aqi > 300 ? 'RED' : 'ORANGE'}

===================== REQUESTED ACTIONS ==========================
We respectfully request the following actions within 48 hours:
  1. IMMEDIATE INVESTIGATION under Section 19 of Air Act, 1981
  2. INSTALLATION of continuous air quality monitoring station
  3. NOTIFICATION to industries/vehicles violating standards
  4. PENALTY imposition under Section 37 (up to ₹1 crore + imprisonment)
  5. DAILY COMPLIANCE report submission
  6. PUBLIC HEALTH advisory issuance
  7. PREVENTIVE MEASURES implementation

===================== EVIDENCE & SUPPORT ========================
Supporting Evidence Available:
  • Real-time monitoring data logs
  • Historical violation patterns
  • Affected citizen testimonials (upon request)
  • Medical impact reports

===================== CONTACT FOR VERIFICATION ===================
For verification and further information, please contact:
Platform: Air Justice Citizen Portal
Email: support@airjustice.tech
Timestamp: ${date.toISOString()}
Digital Signature: [AUTOMATED_SYSTEM_SIGNATURE]

======================================================================
This complaint is filed in public interest under the Right to 
Information Act, 2005 and Right to Clean Air as a fundamental right.
======================================================================`;
  };

  const getAreaName = (loc: { lat: number; lon: number }) => {
    // Mock area detection
    const areas = [
      { lat: 28.6139, lon: 77.2090, name: "Central Delhi" },
      { lat: 28.7041, lon: 77.1025, name: "North Delhi" },
      { lat: 28.4595, lon: 77.0266, name: "Gurugram" },
      { lat: 28.5355, lon: 77.3910, name: "Noida" }
    ];
    
    let closest = "Unknown Area";
    let minDist = Infinity;
    
    areas.forEach(area => {
      const dist = Math.sqrt(Math.pow(loc.lat - area.lat, 2) + Math.pow(loc.lon - area.lon, 2));
      if (dist < minDist) {
        minDist = dist;
        closest = area.name;
      }
    });
    
    return minDist < 0.1 ? closest : "Residential Zone";
  };

  const copyComplaint = () => {
    navigator.clipboard.writeText(generateComplaintText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendToAuthorities = () => {
    setShowEmailModal(true);
  };

  const simulateEmailSend = () => {
    const authorities = [
      "ngt@nic.in",
      "cpcb@nic.in",
      "chairman-cpcb@nic.in",
      "delhi.pcb@gov.in",
      "moefcc@gov.in"
    ];
    
    alert(`Complaint sent to:\n${authorities.join('\n')}\n\nYou will receive confirmation emails shortly.`);
    setShowEmailModal(false);
  };

  if (complaintId) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl shadow-2xl p-6 border-2 border-green-200">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <FiCheck className="text-white text-3xl" />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <FiShield className="text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-green-800 mb-2">Complaint Successfully Filed!</h3>
          <p className="text-green-700">
            Your legal complaint has been registered and forwarded to authorities.
          </p>
        </div>

        {/* Complaint ID Card */}
        <div className="mb-8 p-5 bg-white rounded-2xl border-2 border-green-300 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <div>
              <div className="flex items-center">
                <FiFileText className="text-green-600 mr-2" />
                <span className="font-bold text-gray-800">Complaint ID</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Use this ID to track your complaint</p>
            </div>
            <div className="mt-3 md:mt-0">
              <div className="font-mono text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {complaintId}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <FiClock className="mr-1" />
              Filed: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <button
              onClick={copyComplaint}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <FiCopy className="mr-2" />
              {copied ? 'Copied!' : 'Copy ID'}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={sendToAuthorities}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl font-bold text-lg flex items-center justify-center hover:shadow-2xl transition-all hover:scale-[1.02]"
          >
            <FiSend className="mr-3 text-xl" />
            Send Directly to Authorities
          </button>
          
          <button
            onClick={copyComplaint}
            className="w-full py-4 bg-white border-2 border-green-600 text-green-600 rounded-xl font-bold text-lg flex items-center justify-center hover:bg-green-50 transition-all"
          >
            <FiCopy className="mr-3 text-xl" />
            Copy Full Complaint Text
          </button>
          
          <button className="w-full py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 text-blue-700 rounded-xl font-bold text-lg flex items-center justify-center hover:bg-blue-100 transition-all">
            <FiMail className="mr-3 text-xl" />
            Share with Community
          </button>
        </div>

        {/* Next Steps */}
        <div className="mt-8 pt-6 border-t border-green-200">
          <h4 className="font-bold text-green-800 text-lg mb-4">📋 Next Steps & Timeline</h4>
          <div className="space-y-4">
            {[
              { time: 'Within 24 hours', action: 'Authorities acknowledge receipt', icon: '📨' },
              { time: '48 hours', action: 'Preliminary investigation begins', icon: '🔍' },
              { time: '7 days', action: 'Legal notices issued to violators', icon: '⚖️' },
              { time: '30 days', action: 'Penalties imposed if violations confirmed', icon: '💰' },
            ].map((step, idx) => (
              <div key={idx} className="flex items-center p-3 bg-white/60 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-lg">{step.icon}</span>
                </div>
                <div>
                  <div className="font-bold text-green-800">{step.time}</div>
                  <div className="text-sm text-gray-700">{step.action}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Stats */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <h5 className="font-bold text-blue-800 mb-2">📊 Your Complaint's Impact</h5>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-center p-2 bg-white rounded">
              <div className="font-bold text-blue-600">1,000+</div>
              <div className="text-gray-600">People protected</div>
            </div>
            <div className="text-center p-2 bg-white rounded">
              <div className="font-bold text-blue-600">5 km²</div>
              <div className="text-gray-600">Area coverage</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showEmailModal) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-3xl shadow-2xl p-6 border-2 border-blue-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMail className="text-blue-600 text-2xl" />
          </div>
          <h3 className="text-2xl font-bold text-blue-800 mb-2">Send to Authorities</h3>
          <p className="text-blue-700">Select authorities to notify</p>
        </div>

        <div className="space-y-3 mb-6">
          {[
            { name: 'National Green Tribunal', email: 'ngt@nic.in', required: true },
            { name: 'CPCB Chairman', email: 'chairman-cpcb@nic.in', required: true },
            { name: 'State Pollution Board', email: 'delhi.pcb@gov.in', required: true },
            { name: 'MoEF&CC', email: 'moefcc@gov.in', required: false },
            { name: 'Local MLA/MP', email: 'constituency@mp.in', required: false },
          ].map((auth, idx) => (
            <div key={idx} className="flex items-center p-3 bg-white rounded-lg border">
              <input 
                type="checkbox" 
                defaultChecked={auth.required}
                className="mr-3 h-5 w-5 text-blue-600"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{auth.name}</div>
                <div className="text-sm text-gray-600">{auth.email}</div>
              </div>
              {auth.required && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Required</span>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <button
            onClick={simulateEmailSend}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition"
          >
            Send Complaints Now
          </button>
          <button
            onClick={() => setShowEmailModal(false)}
            className="w-full py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6">
      {/* Header */}
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
          <p className="text-gray-600">Take action against pollution violations</p>
        </div>
      </div>

      {aqi <= 200 ? (
        <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-100">
          <div className="text-6xl mb-4">📋</div>
          <h4 className="text-xl font-bold text-blue-800 mb-2">Legal Threshold Not Crossed</h4>
          <p className="text-blue-700 mb-6 max-w-md mx-auto">
            Your current AQI of {aqi} is below the legal complaint threshold of 200.
            Continue monitoring and file a complaint when violations occur.
          </p>
          <div className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-800 rounded-full font-bold text-lg">
            <FiShield className="mr-2" />
            Available when AQI {'>'} 200
          </div>
        </div>
      ) : (
        <>
          {/* Legal Grounds */}
          <div className="mb-8">
            <div className="p-5 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-200 mb-6">
              <div className="flex items-center mb-3">
                <FiAlertTriangle className="text-red-600 text-xl mr-3" />
                <h4 className="text-lg font-bold text-red-800">Legal Grounds for Complaint</h4>
              </div>
              <p className="text-red-700 mb-3">
                AQI of <span className="font-bold">{aqi}</span> violates multiple environmental laws, 
                exceeding limits by <span className="font-bold">{aqi - 200}</span> points.
              </p>
              <ul className="text-sm text-red-700 space-y-2">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  National Green Tribunal Act, 2010 - Threshold: 200
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  Air (Prevention and Control of Pollution) Act, 1981
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  Environment Protection Act, 1986
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  Right to Clean Air under Article 21, Constitution
                </li>
              </ul>
            </div>

            {/* Authority Grid */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { name: 'NGT', desc: 'Green Tribunal', color: 'bg-red-100 text-red-800' },
                { name: 'CPCB', desc: 'Central Board', color: 'bg-orange-100 text-orange-800' },
                { name: 'SPCB', desc: 'State Board', color: 'bg-yellow-100 text-yellow-800' },
              ].map((auth, idx) => (
                <div key={idx} className={`p-4 rounded-xl text-center ${auth.color}`}>
                  <div className="text-2xl font-bold mb-1">{auth.name}</div>
                  <div className="text-sm opacity-80">{auth.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Complaint Button */}
          <div className="mb-8">
            {isSubmitting ? (
              <div className="relative">
                <div className="w-full h-16 bg-gray-200 rounded-xl overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white font-bold text-lg">
                    Filing Complaint... {progress}%
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={fileComplaint}
                className="w-full py-5 rounded-2xl font-bold text-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white transform hover:scale-[1.02]"
              >
                <div className="flex flex-col items-center">
                  <div className="text-3xl mb-2">🚨</div>
                  <div>FILE LEGAL COMPLAINT</div>
                  <div className="text-lg font-normal mt-2 opacity-90">
                    AQI {aqi} exceeds limit by {aqi - 200} points
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Process Timeline */}
          <div className="p-5 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
            <h4 className="font-bold text-yellow-800 text-lg mb-4">📋 Complaint Process Timeline</h4>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-yellow-300"></div>
              {[
                { step: '1', title: 'File Complaint', desc: 'Generate legal document with tracking ID' },
                { step: '2', title: 'Authority Review', desc: 'NGT/CPCB review within 48 hours' },
                { step: '3', title: 'Investigation', desc: 'On-site investigation initiated' },
                { step: '4', title: 'Legal Action', desc: 'Penalties imposed on violators' },
                { step: '5', title: 'Follow-up', desc: 'Regular updates sent to you' },
              ].map((step, idx) => (
                <div key={idx} className="flex items-start mb-6 last:mb-0">
                  <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold z-10 mr-4">
                    {step.step}
                  </div>
                  <div>
                    <div className="font-bold text-yellow-800">{step.title}</div>
                    <div className="text-sm text-yellow-700">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              By filing a complaint, you exercise your legal rights as a citizen. 
              All complaints are documented and forwarded to appropriate authorities. 
              False complaints may be subject to legal action.
            </p>
          </div>
        </>
      )}
    </div>
  );
}