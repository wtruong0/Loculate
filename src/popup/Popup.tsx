import React, { useState, useEffect } from 'react';
import { getTravelTime } from '../services/maps';
import { TravelInfo } from '../types';

const Popup: React.FC = () => {
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [travelInfo, setTravelInfo] = useState<TravelInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedOrigins, setSavedOrigins] = useState<string[]>([]);
  const [selectedOriginIndex, setSelectedOriginIndex] = useState<number>(-1);
  const [isSavedAddressExpanded, setIsSavedAddressExpanded] = useState<boolean>(true);
  const [copySuccess, setCopySuccess] = useState<{ [key: string]: boolean }>({});
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [showSparkles, setShowSparkles] = useState<boolean>(false);
  const [newAddressIndex, setNewAddressIndex] = useState<number>(-1);

  useEffect(() => {
    // Load saved origins and selected origin
    chrome.storage.local.get(['savedOrigins', 'selectedOriginIndex'], (result) => {
      if (result.savedOrigins) {
        setSavedOrigins(result.savedOrigins);
        // Set the current origin to the selected one
        if (result.selectedOriginIndex !== undefined && result.selectedOriginIndex >= 0) {
          setOrigin(result.savedOrigins[result.selectedOriginIndex]);
          setSelectedOriginIndex(result.selectedOriginIndex);
        } else if (result.savedOrigins.length > 0) {
          // If no selected index but we have saved origins, use the first one
          setOrigin(result.savedOrigins[0]);
          setSelectedOriginIndex(0);
        }
      } else {
        // Fallback for old single origin format
        chrome.storage.local.get(['origin'], (oldResult) => {
          if (oldResult.origin) {
            setOrigin(oldResult.origin);
            setSavedOrigins([oldResult.origin]);
            setSelectedOriginIndex(0);
            // Migrate to new format
            chrome.storage.local.set({ 
              savedOrigins: [oldResult.origin], 
              selectedOriginIndex: 0 
            });
          }
        });
      }
    });

    // Load destination from storage
    chrome.storage.local.get(['selectedText'], (result) => {
      if (result.selectedText) {
        setDestination(result.selectedText);
      }
    });

    // On mount, check system preference and chrome.storage
    chrome.storage.local.get(['theme'], (result) => {
      if (result.theme) {
        setTheme(result.theme);
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }
    });
  }, []);

  // Persist theme changes
  useEffect(() => {
    chrome.storage.local.set({ theme });
  }, [theme]);

  // Add this useEffect to toggle the 'dark' class on <body> and set background color
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#131313';
      document.body.style.transition = 'background-color 0.3s ease';
    } else {
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '';
      document.body.style.transition = 'background-color 0.3s ease';
    }
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const calculateTravelTime = async (origin: string, destination: string) => {
    if (!origin || !destination) return;

    setLoading(true);
    setError(null);
    try {
      console.log('Popup: Calculating travel time...');
      const info = await getTravelTime(origin, destination);
      console.log('Popup: Travel calculation completed successfully');
      setTravelInfo(info);
    } catch (error) {
      console.error('Popup: Travel calculation failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to calculate travel time');
    } finally {
      setLoading(false);
    }
  };

  const triggerShakeAnimation = () => {
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
    }, 500);
  };

  const triggerSparkleAnimation = () => {
    setShowSparkles(true);
    setTimeout(() => {
      setShowSparkles(false);
    }, 800);
  };

  const triggerSlideDownAnimation = (index: number) => {
    setNewAddressIndex(index);
    setTimeout(() => {
      setNewAddressIndex(-1);
    }, 300);
  };

  const handleSaveOrigin = () => {
    if (!origin.trim()) return;
    
    // Check if address already exists
    const existingIndex = savedOrigins.findIndex(addr => addr.toLowerCase() === origin.toLowerCase());
    
    if (existingIndex >= 0) {
      // If it's not currently selected, select it and trigger calculation
      if (existingIndex !== selectedOriginIndex) {
        setSelectedOriginIndex(existingIndex);
        chrome.storage.local.set({ selectedOriginIndex: existingIndex }, () => {
          // Calculate travel time with selected origin
          if (destination) {
            calculateTravelTime(origin, destination);
          }
        });
        triggerSparkleAnimation();
      }
      // If it's already selected, do nothing
      return;
    }
    
    // Check if we're at the limit (now 2 addresses)
    if (savedOrigins.length >= 2) {
      triggerShakeAnimation();
      return;
    }
    
    const newSavedOrigins = [...savedOrigins, origin];
    const newSelectedIndex = newSavedOrigins.length - 1;
    
    setSavedOrigins(newSavedOrigins);
    setSelectedOriginIndex(newSelectedIndex);
    
    // Trigger slide down animation for the new address
    triggerSlideDownAnimation(newSelectedIndex);
    
    chrome.storage.local.set({ 
      savedOrigins: newSavedOrigins, 
      selectedOriginIndex: newSelectedIndex 
    }, () => {
      // Calculate travel time with new origin
      if (destination) {
        calculateTravelTime(origin, destination);
      }
    });
    
    triggerSparkleAnimation();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveOrigin();
    }
  };

  const handleSelectOrigin = (index: number) => {
    setSelectedOriginIndex(index);
    // Don't update the input field - let user keep typing their new address
    chrome.storage.local.set({ selectedOriginIndex: index }, () => {
      // Calculate travel time with selected origin
      if (destination) {
        calculateTravelTime(savedOrigins[index], destination);
      }
    });
  };

  const handleDeleteOrigin = (index: number) => {
    const newSavedOrigins = savedOrigins.filter((_, i) => i !== index);
    setSavedOrigins(newSavedOrigins);
    
    let newSelectedIndex = selectedOriginIndex;
    
    // Adjust selected index if needed
    if (index === selectedOriginIndex) {
      // If we deleted the selected origin, don't select any address
      newSelectedIndex = -1;
      // Clear travel info when selected address is deleted
      setTravelInfo(null);
      // Don't update the input field - let user keep typing their new address
    } else if (index < selectedOriginIndex) {
      // If we deleted an origin before the selected one, adjust the index
      newSelectedIndex = selectedOriginIndex - 1;
    }
    
    setSelectedOriginIndex(newSelectedIndex);
    
    chrome.storage.local.set({ 
      savedOrigins: newSavedOrigins, 
      selectedOriginIndex: newSelectedIndex 
    }, () => {
      // Only calculate travel time if we have a selected origin
      if (newSelectedIndex >= 0 && newSavedOrigins.length > 0 && destination) {
        calculateTravelTime(newSavedOrigins[newSelectedIndex], destination);
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
    if (selectedOriginIndex >= 0 && savedOrigins[selectedOriginIndex] && destination) {
      calculateTravelTime(savedOrigins[selectedOriginIndex], destination);
    }
  }, [destination, selectedOriginIndex, savedOrigins]);

  return (
    <div className="rounded-lg border-4 border-white dark:border-dark-bg min-h-[200px] w-[320px] bg-white dark:bg-dark-bg transition-all duration-300 p-2">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-blue-600 justify-between">
        <div className="flex items-center gap-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-blue-600 dark:text-loculate-blue" 
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
          <h1 className="text-2xl font-bold text-blue-600 dark:text-loculate-blue">Loculate</h1>
        </div>
        <button
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          className="relative w-14 h-7 flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTheme(); } }}
        >
          <span className="absolute left-2 text-yellow-400 transition-all duration-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 7.07l-1.41-1.41M6.34 6.34L4.93 4.93m12.02 0l-1.41 1.41M6.34 17.66l-1.41 1.41" />
            </svg>
          </span>
          <span className="absolute right-2 text-blue-700 dark:text-blue-400 transition-all duration-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
            </svg>
          </span>
          <span
            className={
              'absolute top-1 left-1 w-5 h-5 rounded-full bg-white dark:bg-[#0a0817] shadow-md transform transition-all duration-300' +
              (theme === 'dark' ? ' translate-x-7' : '')
            }
          />
        </button>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-loculate-blue flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 dark:text-loculate-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Adjust Origin
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter an origin address, city, zipcode..."
            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black dark:bg-dark-card dark:text-loculate-blue border-gray-200 dark:border-dark-inputBorder"
          />
          <div className="relative">
            <button
              onClick={handleSaveOrigin}
              className={`px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white dark:text-dark-card rounded-lg hover:from-blue-600 hover:to-blue-700 whitespace-nowrap transition-colors duration-200 flex items-center gap-1 ${isShaking ? 'animate-shake' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 dark:text-dark-card" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save
            </button>
            {showSparkles && (
              <>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#2563eb] rounded-full animate-sparkle"></div>
                <div className="absolute -top-2 -left-1 w-1.5 h-1.5 bg-[#2563eb] rounded-full animate-sparkle" style={{ animationDelay: '0.1s' }}></div>
                <div className="absolute -bottom-1 -right-2 w-1 h-1 bg-[#2563eb] rounded-full animate-sparkle" style={{ animationDelay: '0.2s' }}></div>
                <div className="absolute -bottom-2 left-1 w-1.5 h-1.5 bg-[#2563eb] rounded-full animate-sparkle" style={{ animationDelay: '0.3s' }}></div>
              </>
            )}
          </div>
        </div>
        <div className={`mt-2 ${isShaking ? 'animate-shake' : ''}`}>
          <button
            onClick={() => setIsSavedAddressExpanded(!isSavedAddressExpanded)}
            className="w-full flex items-center justify-between p-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-dark-card dark:to-dark-card rounded-t-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-loculate-blue flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 dark:text-loculate-blue" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Saved Origins ({savedOrigins.length}/2)
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transform transition-transform duration-200 ${isSavedAddressExpanded ? 'rotate-180' : ''} dark:text-loculate-blue`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div 
            className={`overflow-hidden transition-all duration-200 ease-in-out ${
              isSavedAddressExpanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="p-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-dark-card dark:to-dark-card rounded-b-lg border-x border-b border-gray-200 dark:border-gray-700">
              {savedOrigins.length === 0 ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <p className="text-sm">No saved addresses</p>
                </div>
              ) : (
                savedOrigins.map((savedOrigin, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0 ${newAddressIndex === index ? 'animate-slideDown' : ''}`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        onClick={() => handleSelectOrigin(index)}
                        className={`w-4 h-4 rounded-full border-2 cursor-pointer transition-colors duration-200 flex items-center justify-center ${
                          selectedOriginIndex === index
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600'
                        }`}
                      >
                        {selectedOriginIndex === index && (
                          <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-[#0a0817]' : 'bg-white'}`}></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 dark:text-loculate-blue flex-1">{savedOrigin}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteOrigin(index)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors duration-200 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      title="Delete origin"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {destination && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-loculate-blue flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 dark:text-loculate-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Selected Address
          </label>
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200 dark:bg-dark-card dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-loculate-blue">{destination}</span>
            <button
              onClick={() => handleCopy(destination, 'selected')}
              className="p-1 hover:bg-gray-200 dark:hover:bg-dark-bg rounded transition-colors duration-200 ml-2 dark:text-loculate-blue"
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
          <div className="rounded-lg border border-green-200 dark:border-green-accent p-4 bg-gradient-to-br from-green-50 via-green-100 to-green-50 dark:bg-green-infoBg dark:bg-none">
            <h2 className="text-lg font-semibold mb-1 text-green-800 dark:text-green-accent flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-800 dark:text-green-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Travel Information
            </h2>
            {selectedOriginIndex >= 0 && savedOrigins[selectedOriginIndex] && (
              <p className="text-xs text-green-700 dark:text-green-accent mb-3">
                (From {savedOrigins[selectedOriginIndex].length > 8 
                  ? `${savedOrigins[selectedOriginIndex].substring(0, 8)}...` 
                  : savedOrigins[selectedOriginIndex]
                })
              </p>
            )}
            <div className="border-b border-green-800 dark:border-green-accent mb-3"></div>
            <div className="space-y-2">
              <p className="text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 dark:text-green-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-green-800 dark:text-green-accent">Duration:</span>
                <span className="font-medium text-green-800 dark:text-green-accent">{travelInfo.duration}</span>
              </p>
              <p className="text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 dark:text-green-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="font-medium text-green-800 dark:text-green-accent">Distance:</span>
                <span className="font-medium text-green-800 dark:text-green-accent">{travelInfo.distance}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Popup;