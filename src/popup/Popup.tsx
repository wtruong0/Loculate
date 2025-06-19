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
  const [isSavedAddressExpanded, setIsSavedAddressExpanded] = useState<boolean>(true);
  const [copySuccess, setCopySuccess] = useState<{ [key: string]: boolean }>({});

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

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess({ ...copySuccess, [key]: true });
      setTimeout(() => {
        setCopySuccess({ ...copySuccess, [key]: false });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Calculate travel time when destination changes
  useEffect(() => {
    if (savedOrigin && destination) {
      calculateTravelTime(savedOrigin, destination);
    }
  }, [destination]);

  return (
    <div className="rounded-lg bg-white p-2 min-h-[200px] w-[320px] border-4 border-white">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-blue-600">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-blue-600" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"/>
          <path d="M16.2 7.8l-2 6.3-6.4 2.1 2-6.3z"/>
        </svg>
        <h1 className="text-2xl font-bold text-blue-600">Loculate</h1>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Origin Address
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Enter your origin address"
            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleSaveOrigin}
            className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 whitespace-nowrap transition-colors duration-200 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save
          </button>
        </div>
        {savedOrigin && (
          <div className="mt-2">
            <button
              onClick={() => setIsSavedAddressExpanded(!isSavedAddressExpanded)}
              className="w-full flex items-center justify-between p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg border border-gray-200 hover:from-gray-100 hover:to-gray-200 transition-colors duration-200"
            >
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Saved Origin Address
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transform transition-transform duration-200 ${isSavedAddressExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div 
              className={`overflow-hidden transition-all duration-200 ease-in-out ${
                isSavedAddressExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-lg border-x border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-800">{savedOrigin}</p>
                  <button
                    onClick={() => handleCopy(savedOrigin, 'saved')}
                    className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
                    title="Copy address"
                  >
                    {copySuccess['saved'] ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {destination && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Selected
          </label>
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-600">Selected: {destination}</span>
            <button
              onClick={() => handleCopy(destination, 'selected')}
              className="p-1 hover:bg-gray-200 rounded transition-colors duration-200 ml-2"
              title="Copy selected address"
            >
              {copySuccess['selected'] ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Calculating travel time...</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-gradient-to-r from-red-50 to-red-100 text-red-700 rounded-lg mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Travel Information Box with animation */}
      <div
        className={`transition-all duration-300 ${travelInfo && !loading && !error ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'} mt-4`}
      >
        {travelInfo && !loading && !error && (
          <div className="bg-gradient-to-br from-green-50 via-green-100 to-green-50 p-4 rounded-lg border border-green-200">
            <h2 className="text-lg font-semibold mb-3 text-green-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Travel Information
            </h2>
            <div className="border-b border-green-800 mb-3"></div>
            <div className="space-y-2">
              <p className="text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-green-800">Duration:</span> {travelInfo.duration}
              </p>
              <p className="text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="font-medium text-green-800">Distance:</span> {travelInfo.distance}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Popup; 