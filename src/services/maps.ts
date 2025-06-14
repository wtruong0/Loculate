interface TravelTimeResponse {
  duration: string;
  distance: string;
}

export const getTravelTime = async (
  origin: string,
  destination: string
): Promise<TravelTimeResponse> => {
  // TODO: Replace with private maps API key handling
  const API_KEY = 'API_KEY';
  
  const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
  url.searchParams.append('origins', origin);
  url.searchParams.append('destinations', destination);
  url.searchParams.append('key', API_KEY);
  url.searchParams.append('mode', 'driving');

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error('Failed to fetch travel time');
    }

    const element = data.rows[0].elements[0];
    if (element.status !== 'OK') {
      throw new Error('Could not calculate route');
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