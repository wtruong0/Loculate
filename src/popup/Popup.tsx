import React, { useState, useEffect } from 'react';
import { getTravelTime } from '../services/maps';

interface TravelInfo {
  duration: string;
  distance: string;
}

const Popup: React.FC = () => {
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [travelInfo, setTravelInfo] = useState<TravelInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load saved origin and destination on component mount
  useEffect(() => {
    chrome.storage.local.get(['origin', 'destination'], (result) => {
      if (result.origin) {
        setOrigin(result.origin);
      }
      if (result.destination) {
        setDestination(result.destination);
      }
    });
  }, []);

  // Calculate travel time when both origin and destination are available
  useEffect(() => {
    const calculateTravelTime = async () => {
      if (origin && destination) {
        setIsLoading(true);
        setError(null);
        try {
          console.log('Calculating travel time from', origin, 'to', destination);
          const result = await getTravelTime(origin, destination);
          console.log('Travel time result:', result);
          setTravelInfo(result);
        } catch (err) {
          console.error('Error calculating travel time:', err);
          setError('Could not calculate travel time. Please check the addresses and try again.');
          setTravelInfo(null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    calculateTravelTime();
  }, [origin, destination]);

  const saveOrigin = () => {
    chrome.storage.local.set({ origin }, () => {
      // Show feedback that location was saved
      const saveButton = document.getElementById('saveButton');
      if (saveButton) {
        const originalText = saveButton.textContent;
        saveButton.textContent = 'Saved!';
        setTimeout(() => {
          if (saveButton) saveButton.textContent = originalText;
        }, 2000);
      }
    });
  };

  return (
    <div className="w-80 p-4">
      <h1 className="text-xl font-bold mb-4">LocuLate</h1>
      <div className="space-y-4">
        <div className="border p-2 rounded">
          <label className="block text-sm font-medium mb-1">Home Location</label>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Enter your home address"
            className="w-full p-2 border rounded"
          />
          <button
            id="saveButton"
            onClick={saveOrigin}
            className="mt-2 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
          >
            Save Location
          </button>
        </div>
        
        <div className="border p-2 rounded">
          <h2 className="text-lg font-semibold mb-2">Travel Time</h2>
          {destination ? (
            <div>
              <p className="text-sm text-gray-600 mb-2">To: {destination}</p>
              {isLoading ? (
                <p className="text-gray-600">Calculating...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : travelInfo ? (
                <div className="space-y-1">
                  <p className="text-gray-800">Duration: {travelInfo.duration}</p>
                  <p className="text-gray-800">Distance: {travelInfo.distance}</p>
                </div>
              ) : (
                <p className="text-gray-600">Select an address on any webpage to see travel time</p>
              )}
            </div>
          ) : (
            <p className="text-gray-600">Select an address on any webpage to see travel time</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Popup; 