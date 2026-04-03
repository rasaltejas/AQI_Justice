'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiAlertCircle, FiCheck, FiLoader, FiArrowRight, FiMail, FiCopy } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function ComplaintPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Get parameters from URL (passed from dashboard)
    const aqi = searchParams.get('aqi') || '200';
    const lat = searchParams.get('lat') || '28.6139';
    const lon = searchParams.get('lon') || '77.2090';
    const city = searchParams.get('city') || 'Delhi';
    const healthImpact = searchParams.get('healthImpact') || 'Air quality is unhealthy.';
    const precautions = searchParams.get('precautions') || 'Use N95 masks and limit outdoor activities.';

    // Default user data
    const [userData, setUserData] = useState({
        name: 'Concerned Citizen',
        email: 'citizen@airjustice.tech',
        phone: '+91-XXXXXXXXXX'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [complaintId, setComplaintId] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Try to get user data from localStorage
        const storedData = localStorage.getItem('airJusticeUserData');
        if (storedData) {
            try {
                setUserData(JSON.parse(storedData));
            } catch (e) {
                console.log('Could not parse stored data');
            }
        }
        
        // Auto-submit complaint on mount
        submitComplaint();
    }, []);

    const generateEmailSubject = () => {
        return `URGENT: AQI Legal Complaint (${city}) - AQI ${Math.round(parseFloat(aqi))}`;
    };

    const generateEmailBody = () => {
        const aqiValue = Math.round(parseFloat(aqi));
        const cigaretteEquivalent = (aqiValue / 100).toFixed(1);
        const timestamp = new Date().toLocaleString('en-IN');

        return `Respected Authority,

I am filing an urgent public health and legal complaint regarding hazardous air pollution conditions.

--- LIVE INCIDENT DETAILS ---
Location: ${city}
Coordinates: ${lat}, ${lon}
Latest AQI: ${aqiValue}
24-hour Smoke Inhalation Equivalent: ${cigaretteEquivalent} cigarettes/day
Measurement Time: ${timestamp}

--- HEALTH IMPACT ASSESSMENT ---
${healthImpact}

--- PRECAUTIONS CURRENTLY REQUIRED ---
${precautions}

--- LEGAL CONCERN ---
The AQI level is above 200, which indicates severe health risk and potential violation of environmental standards including:
• National Green Tribunal Act, 2010 (Section 15, 16, 19)
• Air (Prevention and Control of Pollution) Act, 1981
• Environment Protection Act, 1986
• WHO Air Quality Guidelines

I request immediate inspection, source identification, and enforcement action.

--- REQUESTED ACTION ---
1. Immediate field inspection and source audit
2. Public advisory issue for affected citizens
3. Corrective and penal action against violators
4. Written compliance update within 48 hours
5. Air quality monitoring station installation

Complainant Details:
Name: ${userData.name}
Contact: ${userData.email}
Platform: Air Justice - Citizen Empowerment Initiative

I request acknowledgement of this complaint and urgent intervention.

Sincerely,
${userData.name}
Filed via Air Justice Platform
https://airjustice.tech`;
    };

    const submitComplaint = async () => {
        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:8000/complaint/file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userData.email,
                    name: userData.name,
                    location_lat: parseFloat(lat),
                    location_lon: parseFloat(lon),
                    location_address: city,
                    aqi_value: parseFloat(aqi),
                    health_impact: healthImpact,
                    precautions: precautions,
                    description: `Automatic complaint filed via Air Justice Platform`
                })
            });

            const data = await response.json();

            if (data.success) {
                setComplaintId(data.complaint_id);
                setSuccess(true);
            } else {
                setError(data.detail || 'Failed to file complaint');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const sendViaEmail = () => {
        const subject = encodeURIComponent(generateEmailSubject());
        const body = encodeURIComponent(generateEmailBody());
        const to = 'ngt@nic.in,chairman-cpcb@nic.in,delhi.pcb@gov.in,moefcc@gov.in';
        
        // Open default email client with pre-filled content
        window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    };

    const copyEmailContent = () => {
        const emailContent = `To: ngt@nic.in, chairman-cpcb@nic.in, delhi.pcb@gov.in, moefcc@gov.in\n\nSubject: ${generateEmailSubject()}\n\n${generateEmailBody()}`;
        navigator.clipboard.writeText(emailContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isSubmitting) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center"
                >
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-spin">
                        <FiLoader className="w-8 h-8 text-blue-600" />
                    </div>
                    
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Filing Complaint...</h2>
                    
                    <p className="text-gray-600">
                        Your complaint is being submitted to environmental authorities.
                    </p>
                </motion.div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Success Header */}
                        <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white p-8 text-center">
                            <FiCheck className="w-16 h-16 mx-auto mb-4" />
                            <h1 className="text-4xl font-bold mb-2">Complaint Filed Successfully!</h1>
                            <p className="text-green-100">Your complaint has been submitted to environmental authorities</p>
                        </div>

                        <div className="p-8">
                            {/* Tracking ID */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-blue-50 rounded-xl p-6 mb-8 border-2 border-blue-200"
                            >
                                <p className="text-sm text-gray-600 font-semibold mb-2">YOUR COMPLAINT ID</p>
                                <p className="text-3xl font-bold text-blue-600 font-mono mb-4">{complaintId}</p>
                                <p className="text-sm text-gray-600">Save this ID to track your complaint status</p>
                            </motion.div>

                            {/* Email Draft Section */}
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                                    <FiMail className="mr-2 text-blue-600" />
                                    Complaint Email Draft
                                </h3>
                                
                                <p className="text-sm text-gray-600 mb-4">
                                    Here's the professional email that has been prepared. You can send it to environmental authorities:
                                </p>

                                {/* Email Preview */}
                                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6">
                                    <div className="space-y-4 text-sm font-mono text-gray-800">
                                        <div>
                                            <span className="font-bold">To:</span> ngt@nic.in, chairman-cpcb@nic.in, delhi.pcb@gov.in, moefcc@gov.in
                                        </div>
                                        <div className="border-t pt-4">
                                            <span className="font-bold">Subject:</span> {generateEmailSubject()}
                                        </div>
                                        <div className="border-t pt-4">
                                            <span className="font-bold">Body:</span>
                                            <div className="mt-2 whitespace-pre-wrap text-gray-700 max-h-96 overflow-y-auto bg-white p-4 rounded border border-gray-200">
                                                {generateEmailBody()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 flex-wrap">
                                    <button
                                        onClick={sendViaEmail}
                                        className="flex-1 min-w-64 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 group"
                                    >
                                        <FiMail className="group-hover:scale-110 transition-transform" />
                                        <div className="text-left">
                                            <span className="block">Send via Email</span>
                                            <span className="text-xs text-blue-100">Opens your email client - just send!</span>
                                        </div>
                                    </button>
                                    
                                    <button
                                        onClick={copyEmailContent}
                                        className="flex-1 min-w-64 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center space-x-2"
                                    >
                                        <FiCopy />
                                        <span>{copied ? '✓ Copied!' : 'Copy Email'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Next Steps */}
                            <div className="bg-green-50 border-l-4 border-green-600 rounded-lg p-6">
                                <h4 className="font-bold text-green-900 mb-4">✓ What Happens Next?</h4>
                                <ul className="space-y-3 text-sm text-green-900">
                                    <li className="flex items-start space-x-3">
                                        <FiCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold">1. Complaint Filed</p>
                                            <p className="text-green-800">Your complaint has been officially recorded in our system</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <FiCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold">2. One-Click Email Send</p>
                                            <p className="text-green-800">Click "Send via Email" button above to open your default email client with a pre-drafted professional complaint. Just hit Send!</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <FiCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold">3. Fast-Track Investigation</p>
                                            <p className="text-green-800">Authorities will begin investigation within 24-48 hours of email receipt</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <FiCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold">4. Track Your Complaint</p>
                                            <p className="text-green-800">Use your complaint ID: <span className="font-mono bg-green-200 px-2 py-1 rounded">{complaintId}</span></p>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 flex-col sm:flex-row mt-8">
                                <button
                                    onClick={() => router.push('/trackComplaint')}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                                >
                                    <span>📍 Track This Complaint</span>
                                    <FiArrowRight />
                                </button>
                                <button
                                    onClick={() => router.push('/')}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                                >
                                    <span>Back to Dashboard</span>
                                    <FiArrowRight />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Fallback (shouldn't show since we auto-submit)
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
            <div className="text-center">
                <p className="text-gray-600">Loading complaint page...</p>
            </div>
        </div>
    );
}
