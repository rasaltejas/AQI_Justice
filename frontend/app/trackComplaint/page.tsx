'use client';

import { useState } from 'react';
import { FiSearch, FiArrowLeft, FiCheck, FiClock, FiAlertCircle, FiDownload, FiShare2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface ComplaintDetails {
    id: string;
    status: string;
    date_filed: string;
    location: string;
    aqi_value: number;
    health_impact: string;
    precautions: string;
}

interface TrackingEntry {
    timestamp: string;
    status: string;
    message: string;
    authority?: string;
}

export default function TrackComplaintPage() {
    const router = useRouter();
    const [complaintId, setComplaintId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [complaint, setComplaint] = useState<ComplaintDetails | null>(null);
    const [history, setHistory] = useState<TrackingEntry[]>([]);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!complaintId.trim()) {
            setError('Please enter a complaint ID');
            return;
        }

        setLoading(true);
        setError('');
        setComplaint(null);
        setHistory([]);

        try {
            const response = await fetch(
                `http://localhost:8000/complaint/track/${complaintId}`
            );

            if (!response.ok) {
                throw new Error('Complaint not found');
            }

            const data = await response.json();

            if (data.success) {
                setComplaint(data.details);
                setHistory(data.tracking_history || []);
                setSearched(true);
            } else {
                setError('Complaint not found. Please check the ID.');
            }
        } catch (err) {
            setError('Unable to find complaint. Please verify the ID and try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'filed':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'investigation':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'resolved':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'closed':
                return 'bg-gray-100 text-gray-800 border-gray-300';
            default:
                return 'bg-purple-100 text-purple-800 border-purple-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'filed':
                return <FiClock className="w-5 h-5" />;
            case 'investigation':
                return <FiSearch className="w-5 h-5" />;
            case 'resolved':
                return <FiCheck className="w-5 h-5" />;
            case 'closed':
                return <FiCheck className="w-5 h-5" />;
            default:
                return <FiAlertCircle className="w-5 h-5" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
                    >
                        <FiArrowLeft />
                        <span>Back to Dashboard</span>
                    </button>

                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Track Your Complaint</h1>
                    <p className="text-gray-600">Enter your complaint ID to check the status and progress</p>
                </div>

                {/* Search Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-lg p-8 mb-8"
                >
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Enter your complaint ID (e.g., AJ-1775208750-d0bae3f5)"
                                value={complaintId}
                                onChange={(e) => setComplaintId(e.target.value)}
                                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg text-gray-900 placeholder-gray-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            <FiSearch />
                            <span>{loading ? 'Searching...' : 'Track'}</span>
                        </button>
                    </form>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center space-x-3"
                        >
                            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </motion.div>

                {/* Results Section */}
                {complaint && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Status Card */}
                        <div className="bg-white rounded-3xl shadow-lg p-8">
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Complaint Status</h2>
                                    <p className="text-gray-600">ID: {complaintId}</p>
                                </div>
                                <div
                                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl border-2 font-semibold text-lg ${getStatusColor(
                                        complaint.status
                                    )}`}
                                >
                                    {getStatusIcon(complaint.status)}
                                    <span className="capitalize">{complaint.status}</span>
                                </div>
                            </div>

                            {/* Complaint Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-blue-50 rounded-xl p-6">
                                    <h3 className="text-sm font-semibold text-gray-600 mb-2">FILED DATE</h3>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {new Date(complaint.date_filed).toLocaleDateString('en-IN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>

                                <div className="bg-orange-50 rounded-xl p-6">
                                    <h3 className="text-sm font-semibold text-gray-600 mb-2">AQI AT FILING</h3>
                                    <p className="text-2xl font-bold text-gray-900">{complaint.aqi_value}</p>
                                </div>

                                <div className="bg-green-50 rounded-xl p-6 md:col-span-2">
                                    <h3 className="text-sm font-semibold text-gray-600 mb-2">LOCATION</h3>
                                    <p className="text-lg font-semibold text-gray-900">{complaint.location}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tracking History */}
                        <div className="bg-white rounded-3xl shadow-lg p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-8">Tracking History</h3>

                            {history && history.length > 0 ? (
                                <div className="space-y-6">
                                    {history.map((entry, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="flex gap-6"
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    {entry.status === 'Resolved' ? (
                                                        <FiCheck className="w-5 h-5 text-green-600" />
                                                    ) : (
                                                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                                    )}
                                                </div>
                                                {idx !== history.length - 1 && (
                                                    <div className="w-1 h-12 bg-gray-300 my-2"></div>
                                                )}
                                            </div>

                                            <div className="flex-1 pb-6">
                                                <div className="bg-gray-50 rounded-xl p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-semibold text-gray-900">{entry.status}</h4>
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(entry.timestamp).toLocaleDateString('en-IN')}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700">{entry.message}</p>
                                                    {entry.authority && (
                                                        <p className="text-sm text-gray-600 mt-2">
                                                            Authority: <span className="font-semibold">{entry.authority}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FiClock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600">No tracking history yet. Check back soon!</p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="bg-white rounded-3xl shadow-lg p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Next Steps</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-left">
                                    <FiDownload className="w-6 h-6 text-blue-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Download PDF</p>
                                        <p className="text-sm text-gray-600">Get complaint receipt</p>
                                    </div>
                                </button>

                                <button className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors text-left">
                                    <FiShare2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Share Status</p>
                                        <p className="text-sm text-gray-600">Share with others</p>
                                    </div>
                                </button>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                <p className="text-sm text-blue-900">
                                    <span className="font-semibold">Need help?</span> Contact our support team at support@airjustice.tech or call 1800-AIR-JUST (1800-247-5878)
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Empty State */}
                {!searched && !complaint && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-3xl shadow-lg p-12 text-center"
                    >
                        <FiSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Enter Your Complaint ID</h3>
                        <p className="text-gray-600 mb-6">Track the progress of your air quality complaint</p>

                        <div className="bg-blue-50 rounded-xl p-6 text-left max-w-md mx-auto">
                            <p className="text-sm text-gray-700 mb-4">
                                Your complaint ID was provided when you filed your complaint. It looks like this:
                            </p>
                            <div className="font-mono bg-white p-3 rounded border-2 border-blue-200 text-blue-600 font-semibold text-center">
                                AJ-1775208750-d0bae3f5
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
