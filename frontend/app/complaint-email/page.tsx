'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FiMail, FiMapPin, FiThermometer, FiWind, FiShield } from 'react-icons/fi';

const parsePrecautions = (value: string | null) => {
  if (!value) return [];
  return value.split('|').filter(Boolean);
};

export default function ComplaintEmailPage() {
  const searchParams = useSearchParams();

  const aqi = Number(searchParams.get('aqi') ?? 0);
  const city = searchParams.get('city') ?? 'Unknown Location';
  const temperature = Number(searchParams.get('temperature') ?? 0);
  const smokeInhaled = Number(searchParams.get('smokeInhaled') ?? 0);
  const lat = searchParams.get('lat') ?? 'NA';
  const lon = searchParams.get('lon') ?? 'NA';
  const measuredAt = searchParams.get('measuredAt') ?? new Date().toISOString();
  const precautions = parsePrecautions(searchParams.get('precautions'));

  const authorityEmails = ['ngt@nic.in', 'chairman-cpcb@nic.in', 'delhi.pcb@gov.in', 'moefcc@gov.in'];
  const subject = `URGENT: AQI Legal Complaint (${city}) - AQI ${aqi}`;

  const emailBody = `To: ${authorityEmails.join(', ')}

Subject: ${subject}

Respected Authority,

I am filing an urgent public health and legal complaint regarding hazardous air pollution conditions.

--- LIVE INCIDENT DETAILS ---
Location: ${city}
Coordinates: ${lat}, ${lon}
Latest AQI: ${aqi}
Temperature: ${temperature}°C
24-hour Smoke Inhalation Equivalent: ${smokeInhaled} cigarettes/day
Measurement Time: ${new Date(measuredAt).toLocaleString('en-IN')}

--- PRECAUTIONS CURRENTLY REQUIRED ---
${precautions.map((item, index) => `${index + 1}. ${item}`).join('\n')}

--- LEGAL CONCERN ---
The AQI level is above 200, which indicates severe health risk and potential violation of environmental standards. I request immediate inspection, source identification, and enforcement action.

--- REQUESTED ACTION ---
1. Immediate field inspection and source audit
2. Public advisory issue for affected citizens
3. Corrective and penal action against violators
4. Written compliance update within 48 hours

I request acknowledgement of this complaint and urgent intervention.

Sincerely,
A Concerned Citizen
Filed via Air Justice Platform`;

  const mailtoLink = `mailto:${authorityEmails.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Complaint Email Draft</h1>
              <p className="text-gray-600">Everything is pre-filled from your live dashboard data.</p>
            </div>
            <Link href="/" className="text-blue-700 font-semibold hover:text-blue-900">
              ← Back to dashboard
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-red-50 rounded-xl border border-red-100"><FiWind className="inline mr-2" />Latest AQI: <strong>{aqi}</strong></div>
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100"><FiThermometer className="inline mr-2" />Temperature: <strong>{temperature}°C</strong></div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100"><FiMapPin className="inline mr-2" />City: <strong>{city}</strong></div>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100"><FiShield className="inline mr-2" />24h Smoke Inhaled: <strong>{smokeInhaled} cigarettes/day</strong></div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Recommended Precautions</h2>
            <ul className="space-y-2">
              {precautions.map((item, index) => (
                <li key={index} className="p-3 bg-green-50 rounded-lg border border-green-100 text-gray-800">{index + 1}. {item}</li>
              ))}
            </ul>
          </div>

          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Content (editable)</label>
          <textarea
            readOnly
            className="w-full h-[320px] p-4 border border-gray-300 rounded-xl bg-gray-50 text-sm text-gray-800"
            value={emailBody}
          />

          <a
            href={mailtoLink}
            className="mt-6 w-full md:w-auto inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-xl"
          >
            <FiMail className="mr-2" />
            Open in Email App
          </a>
        </div>
      </div>
    </main>
  );
}
