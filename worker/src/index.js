export default {
  async fetch(request, env) {
    console.log('Worker: Received request:', request.url);
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const url = new URL(request.url);
      const destination = url.searchParams.get('destination');
      const origin = url.searchParams.get('origin');
      console.log('Worker: Parsed parameters:', { origin, destination });

      if (!destination || !origin) {
        console.log('Worker: Missing parameters');
        return new Response('Missing required parameters: origin and destination', { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });
      }

      const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${env.GOOGLE_MAPS_API_KEY}`;
      console.log('Worker: Calling Google Maps API:', apiUrl);

      const response = await fetch(apiUrl);
      const data = await response.json();
      console.log('Worker: Google Maps API response:', data);

      if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
        const element = data.rows[0].elements[0];
        console.log('Worker: Original distance in meters:', element.distance.value);
        // Convert distance from meters to miles and round to nearest tenth
        const distanceInMiles = Math.round(element.distance.value * 0.000621371 * 10) / 10;
        console.log('Worker: Converted distance in miles:', distanceInMiles);
        const responseData = {
          duration: element.duration.text,
          distance: `${distanceInMiles} mi`
        };
        console.log('Worker: Sending response:', responseData);
        return new Response(JSON.stringify(responseData), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      console.log('Worker: API error response:', data);
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      console.log('Worker: Error caught:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
}; 