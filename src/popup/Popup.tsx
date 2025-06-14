import React, { useState, useEffect } from 'react';
import { getTravelTime } from '../services/maps';
import { TravelInfo } from '../types';

const Popup: React.FC = () => {
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [travelInfo, setTravelInfo] = useState<TravelInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedOrigin, setSavedOrigin] = useState<string>('');

  useEffect(() => {
    // Load saved origin
    chrome.storage.local.get(['origin'], (result) => {
      if (result.origin) {
        setOrigin(result.origin);
        setSavedOrigin(result.origin);
      }
    });

    // Load destination from storage
    chrome.storage.local.get(['selectedText'], (result) => {
      if (result.selectedText) {
        setDestination(result.selectedText);
      }
    });
  }, []);

  const calculateTravelTime = async (origin: string, destination: string) => {
    if (!origin || !destination) return;

    setLoading(true);
    setError(null);
    try {
      console.log('Calculating travel time...');
      const info = await getTravelTime(origin, destination);
      console.log('Travel time calculated:', info);
      setTravelInfo(info);
    } catch (error) {
      console.error('Error calculating travel time:', error);
      setError(error instanceof Error ? error.message : 'Failed to calculate travel time');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrigin = () => {
    chrome.storage.local.set({ origin }, () => {
      setSavedOrigin(origin);
      // Calculate travel time with new origin
      if (destination) {
        calculateTravelTime(origin, destination);
      }
    });
  };

  // Calculate travel time when destination changes
  useEffect(() => {
    if (savedOrigin && destination) {
      calculateTravelTime(savedOrigin, destination);
    }
  }, [destination]);

  return (
    <div className="p-4 w-80">
      <h1 className="text-xl font-bold mb-4">LocuLate</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Home Address</label>
        <input
          type="text"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter your home address"
        />
        <button
          onClick={handleSaveOrigin}
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save
        </button>
      </div>

      {destination && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Selected Address</label>
          <div className="p-2 bg-gray-100 rounded">{destination}</div>
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Calculating travel time...</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded mb-4">
          {error}
        </div>
      )}

      {travelInfo && !loading && !error && (
        <div className="bg-green-50 p-4 rounded">
          <h2 className="font-semibold mb-2">Travel Information</h2>
          <p>Duration: {travelInfo.duration}</p>
          <p>Distance: {travelInfo.distance}</p>
        </div>
      )}
    </div>
  );
};

export default Popup; 