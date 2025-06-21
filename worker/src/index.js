addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  try {
    // Parse URL to get query parameters
    const url = new URL(request.url)
    const origin = url.searchParams.get('origin')
    const destination = url.searchParams.get('destination')
    
    // Log generic request info (no sensitive data)
    console.log('Worker: Processing travel request')
    
    // Validate required parameters
    if (!origin || !destination) {
      console.log('Worker: Missing required parameters')
      return new Response(JSON.stringify({ error: 'Missing origin or destination parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Get API key from environment
    const apiKey = GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.log('Worker: API key not configured')
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Construct Google Maps API URL
    const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`
    
    console.log('Worker: Calling Google Maps API')
    
    // Make request to Google Maps API
    const response = await fetch(apiUrl)
    const data = await response.json()
    
    if (data.status === 'OK') {
      const element = data.rows[0].elements[0]
      
      if (element.status === 'OK') {
        console.log('Worker: API response received successfully')
        
        // Convert meters to miles
        const distanceInMeters = element.distance.value
        const distanceInMiles = Math.round((distanceInMeters * 0.000621371) * 10) / 10
        
        console.log('Worker: Distance converted to miles')
        
        const responseData = {
          duration: element.duration.text,
          distance: `${distanceInMiles} miles`
        }
        
        console.log('Worker: Sending response to client')
        
        return new Response(JSON.stringify(responseData), {
          headers: { 'Content-Type': 'application/json' }
        })
      } else {
        console.log('Worker: Google Maps API returned error status')
        return new Response(JSON.stringify({ error: 'Unable to calculate route' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    } else {
      console.log('Worker: Google Maps API error response')
      return new Response(JSON.stringify({ error: 'Google Maps API error' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  } catch (error) {
    console.log('Worker: Error processing request')
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 