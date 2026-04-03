import { useState } from 'react';

const SearchAQI = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [aqiData, setAqiData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery) return alert('Please enter a city or country name.');

        setLoading(true);
        try {
            const response = await fetch(`https://api.waqi.info/feed/${searchQuery}/?token=e47ccb9f3bd66f152ea701ad4063d07748d60120`); // Replace YOUR_API_TOKEN with your actual API token
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            if (data.status === 'ok') {
                setAqiData({
                    location: searchQuery,
                    aqi: data.data.aqi,
                    pm25: data.data.iaqi.pm25?.v || 'N/A',
                    pm10: data.data.iaqi.pm10?.v || 'N/A',
                });
            } else {
                alert('No data found for the entered location.');
            }
        } catch (error) {
            console.error('Error fetching AQI data:', error);
            alert('Failed to fetch AQI data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Search Air Quality Index (AQI)</h2>
            <div className="flex space-x-2">
                <input
                    type="text"
                    placeholder="Enter city or country name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded-md px-4 py-2 flex-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                    onClick={handleSearch}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>
            {aqiData && (
                <div className="mt-4 p-4 border rounded-md bg-gray-100">
                    <h3 className="text-lg font-semibold">Live AQI Data</h3>
                    <p><strong>Location:</strong> {aqiData.location}</p>
                    <p><strong>AQI:</strong> {aqiData.aqi}</p>
                    <p><strong>PM2.5:</strong> {aqiData.pm25} µg/m³</p>
                    <p><strong>PM10:</strong> {aqiData.pm10} µg/m³</p>
                    <p className={`mt-2 ${aqiData.aqi > 200 ? 'text-red-600' : 'text-green-600'}`}>
                        {aqiData.aqi > 200 ? 'Unhealthy Air Quality' : 'Good Air Quality'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default SearchAQI;