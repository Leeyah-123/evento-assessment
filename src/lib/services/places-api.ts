import { GOOGLE_MAPS_API_KEY } from '@/lib/config';

export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface PlaceDetails {
  place_id: string;
  formatted_address: string;
  name?: string;
  address_components: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

/**
 * Searches for places based on the input query
 */
export async function searchPlaces(query: string): Promise<PlacePrediction[]> {
  if (!query || query.length < 2) return [];
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API key not set');
    return [];
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        query
      )}&key=${GOOGLE_MAPS_API_KEY}&types=address&language=en`
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.status);
      return [];
    }

    return data.predictions || [];
  } catch (error) {
    console.error('Error fetching place predictions:', error);
    return [];
  }
}

/**
 * Gets details for a specific place by ID
 */
export async function getPlaceDetails(
  placeId: string
): Promise<PlaceDetails | null> {
  if (!placeId) return null;
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API key not set');
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}&fields=place_id,formatted_address,name,address_components,geometry`
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.status);
      return null;
    }

    return data.result;
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
}

/**
 * Parses address components from Google Places API
 */
/**
 * Reverse geocodes coordinates to get place details
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<PlaceDetails | null> {
  if (!lat || !lng) return null;
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API key not set');
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.error('Google Geocoding API error:', data.status);
      return null;
    }

    return data.results[0];
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
}

export function parseAddressComponents(
  components: PlaceDetails['address_components']
) {
  const result = {
    streetAddress: '',
    city: '',
    region: '',
    country: '',
    postalCode: '',
  };

  if (!components || !Array.isArray(components)) {
    return result;
  }

  // Extract street number and route for street address
  const streetNumber =
    components.find((comp) => comp.types.includes('street_number'))
      ?.long_name || '';
  const route =
    components.find((comp) => comp.types.includes('route'))?.long_name || '';
  result.streetAddress = [streetNumber, route].filter(Boolean).join(' ');

  // Extract city
  result.city =
    components.find((comp) => comp.types.includes('locality'))?.long_name ||
    components.find((comp) => comp.types.includes('sublocality'))?.long_name ||
    components.find((comp) => comp.types.includes('postal_town'))?.long_name ||
    '';

  // Extract region/state
  result.region =
    components.find((comp) =>
      comp.types.includes('administrative_area_level_1')
    )?.long_name || '';

  // Extract country
  result.country =
    components.find((comp) => comp.types.includes('country'))?.long_name || '';

  // Extract postal code
  result.postalCode =
    components.find((comp) => comp.types.includes('postal_code'))?.long_name ||
    '';

  return result;
}
