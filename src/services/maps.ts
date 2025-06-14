interface TravelTimeResponse {
  duration: string;
  distance: string;
}

export const getTravelTime = async (
  origin: string,
  destination: string
): Promise<TravelTimeResponse> => {
  // TODO: Replace with private maps API key handling
  const API_KEY = 'AIzaSyDq_c2lopgSe7SpJgNJKorDi5s-ZL8VqPI'; //no private handling, key is restricted to chrome extension use
  
  const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
  url.searchParams.append('origins', origin);
  url.searchParams.append('destinations', destination);
  url.searchParams.append('key', API_KEY);
  url.searchParams.append('mode', 'driving');

  try {
    console.log('Fetching travel time from Google Maps API...');
    const response = await fetch(url.toString());
    const data = await response.json();
    console.log('Google Maps API response:', data);

    if (data.status !== 'OK') {
      console.error('Google Maps API error:', data.status, data.error_message);
      throw new Error(`Failed to fetch travel time: ${data.error_message || data.status}`);
    }

    const element = data.rows[0].elements[0];
    if (element.status !== 'OK') {
      console.error('Google Maps API route error:', element.status);
      throw new Error(`Could not calculate route: ${element.status}`);
    }

    return {
      duration: element.duration.text,
      distance: element.distance.text
    };
  } catch (error) {
    console.error('Error fetching travel time:', error);
    throw error;
  }
}; 