import { TravelInfo } from '../types';

declare global {
  interface Window {
    google: any;
  }
}

const API_KEY = 'AIzaSyDq_c2lopgSe7SpJgNJKorDi5s-ZL8VqPI';

export const getTravelTime = async (origin: string, destination: string): Promise<TravelInfo> => {
  console.log('Fetching travel time for:', { origin, destination });
  
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error('Google Maps API not loaded'));
      return;
    }

    const service = new window.google.maps.DistanceMatrixService();
    
    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [destination],
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (response: any, status: string) => {
        console.log('Distance Matrix API response:', { response, status });
        
        if (status === 'OK') {
          const result = response.rows[0].elements[0];
          
          if (result.status === 'OK') {
            resolve({
              duration: result.duration.text,
              distance: result.distance.text,
              origin,
              destination,
            });
          } else {
            console.error('Route calculation failed:', result.status);
            reject(new Error(`Failed to calculate route: ${result.status}`));
          }
        } else {
          console.error('Distance Matrix API error:', status);
          reject(new Error(`Distance Matrix API error: ${status}`));
        }
      }
    );
  });
};

export const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    
    document.head.appendChild(script);
  });
}; 