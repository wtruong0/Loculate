import { TravelInfo } from '../types';

declare global {
  interface Window {
    google: any;
  }
}

export const getTravelTime = async (origin: string, destination: string): Promise<TravelInfo> => {
  console.log('Maps Service: Initiating travel time request');
  
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: 'GET_TRAVEL_TIME',
        origin,
        destination
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error('Maps Service: Runtime error occurred');
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (!response) {
          reject(new Error('No response from background script'));
          return;
        }

        if (!response.success) {
          console.error('Maps Service: API request failed');
          reject(new Error(response.error));
          return;
        }
        
        console.log('Maps Service: Travel time request completed successfully');
        
        // Add origin and destination to match TravelInfo interface
        resolve({
          ...response.data,
          origin,
          destination
        });
      }
    );
  });
};

// Load Google Maps Places library for address autocomplete
export const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?libraries=places';
    script.async = true;
    script.defer = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    
    document.head.appendChild(script);
  });
}; 