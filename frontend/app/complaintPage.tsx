import React from 'react';

const ComplaintPage = () => {
    return (
        <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
            <h1 className="text-3xl font-bold mb-6 text-center text-primary">Complaint Form</h1>
            <form className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Enter your email"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="aqi" className="block text-sm font-medium text-gray-700">Air Quality Index (AQI)</label>
                    <input
                        type="text"
                        id="aqi"
                        name="aqi"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                        value="[AQI Value]"
                        readOnly
                    />
                </div>
                <div>
                    <label htmlFor="effects" className="block text-sm font-medium text-gray-700">24-Hour Effects on Body</label>
                    <textarea
                        id="effects"
                        name="effects"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                        rows={4}
                        readOnly
                    >[24-Hour Effects]</textarea>
                </div>
                <div>
                    <label htmlFor="precautions" className="block text-sm font-medium text-gray-700">Precautions</label>
                    <textarea
                        id="precautions"
                        name="precautions"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                        rows={4}
                        readOnly
                    >[Precautions]</textarea>
                </div>
                <div>
                    <label htmlFor="advantages" className="block text-sm font-medium text-gray-700">Advantages</label>
                    <textarea
                        id="advantages"
                        name="advantages"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                        rows={4}
                        readOnly
                    >[Advantages]</textarea>
                </div>
                <div>
                    <label htmlFor="disadvantages" className="block text-sm font-medium text-gray-700">Disadvantages</label>
                    <textarea
                        id="disadvantages"
                        name="disadvantages"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                        rows={4}
                        readOnly
                    >[Disadvantages]</textarea>
                </div>
                <button
                    type="submit"
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition duration-300"
                >
                    Submit Complaint
                </button>
            </form>
        </div>
    );
};

export default ComplaintPage;