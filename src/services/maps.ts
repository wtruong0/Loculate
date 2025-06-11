interface TravelTimeResponse {
  duration: string;
  distance: string;
}

export async function getTravelTime(
  origin: string,
  destination: string
): Promise<TravelTimeResponse> {
  // TODO: Implement Google Maps Distance Matrix API call
  // This is a placeholder that will be implemented later
  throw new Error('Not implemented');
} 