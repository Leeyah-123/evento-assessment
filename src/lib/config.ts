import { Libraries } from '@googlemaps/js-api-loader';

export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
export const GOOGLE_MAPS_LIBRARIES: Libraries = ['places'];
