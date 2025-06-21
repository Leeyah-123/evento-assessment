'use client';

import { Loader } from '@googlemaps/js-api-loader';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

// Import base components
import { LocationManualEntryForm } from '../base/LocationManualEntryForm';
import { LocationMap } from '../base/LocationMap';
import { LocationSearchInput } from '../base/LocationSearchInput';
import { LocationSuggestionsList } from '../base/LocationSuggestionsList';
import { SelectedLocationDisplay } from '../base/SelectedLocationDisplay';

// Import UI components
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

// Import hooks
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_LIBRARIES } from '@/lib/config';
import {
  LocationFormValues,
  LocationManualFormValues,
  locationSchema,
} from '@/lib/schemas/location-schema';
import useDebounce from '../../hooks/useDebounce';

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

export interface Location
  extends Omit<LocationFormValues, 'isManuallyEntered'> {
  place_id?: string;
  formattedAddress?: string | null;
  isManuallyEntered: boolean;
}

interface LocationPickerProps {
  initialLocation?: Location;
  onLocationSelect?: (location: Location) => void;
}

export default function LocationPicker({
  initialLocation,
  onLocationSelect,
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const initialLocationWithDefaults: LocationFormValues = initialLocation
    ? {
        ...initialLocation,
        isManuallyEntered: initialLocation.isManuallyEntered ?? false,
      }
    : {
        placeId: undefined,
        name: '',
        streetAddress: '',
        city: '',
        region: '',
        country: '',
        postalCode: '',
        formattedAddress: '',
        latitude: null,
        longitude: null,
        isManuallyEntered: false,
      };

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: initialLocationWithDefaults,
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Initialize Google Maps API
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key not set');
      setIsError(true);
      return;
    }

    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: GOOGLE_MAPS_LIBRARIES,
    });

    loader
      .importLibrary('places')
      .then(() => setGoogleMapsLoaded(true))
      .catch((error) => {
        console.error('Error loading Google Maps API:', error);
        setIsError(true);
      });
  }, []);

  // Search for places when the debounced search query changes
  useEffect(() => {
    if (!debouncedSearchQuery.trim() || !googleMapsLoaded) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    fetch(`/api/places/search?q=${encodeURIComponent(debouncedSearchQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.predictions) {
          setSuggestions(data.predictions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching place suggestions:', error);
        setSuggestions([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [debouncedSearchQuery, googleMapsLoaded]);

  // Handle selection of a place from the suggestions
  const handleSelectPlace = async (placeId: string) => {
    if (!placeId) return;

    setShowSuggestions(false);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/places/details?place_id=${placeId}`);
      const data = await response.json();

      if (data) {
        const place = data;
        const location = {
          placeId,
          name: place.name || null,
          streetAddress:
            place.address_components?.find((c: any) =>
              c.types.includes('street_number')
            )?.long_name || null,
          city:
            place.address_components?.find((c: any) =>
              c.types.includes('locality')
            )?.long_name || null,
          region:
            place.address_components?.find((c: any) =>
              c.types.includes('administrative_area_level_1')
            )?.long_name || null,
          country:
            place.address_components?.find((c: any) =>
              c.types.includes('country')
            )?.long_name || '',
          postalCode:
            place.address_components?.find((c: any) =>
              c.types.includes('postal_code')
            )?.long_name || null,
          formattedAddress: place.formatted_address || null,
          latitude: place.geometry?.location.lat || null,
          longitude: place.geometry?.location.lng || null,
          isManuallyEntered: false,
        };

        form.reset(location);
        setSearchQuery('');

        if (onLocationSelect) {
          onLocationSelect(location);
        }
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle manual entry form submission
  const handleManualEntrySubmit = (data: LocationManualFormValues) => {
    // Create a formatted address from the form data
    const addressParts = [
      data.streetAddress,
      data.city,
      data.region,
      data.postalCode,
      data.country,
    ].filter(Boolean);

    const formattedAddress = addressParts.join(', ');

    const location: Location = {
      ...data,
      formattedAddress: formattedAddress || null,
      isManuallyEntered: true,
    };

    form.reset(location);
    setShowManualEntry(false);
    setSearchQuery(formattedAddress || '');

    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  // Handle map click to select location
  const handleMapLocationSelect = async (lat: number, lng: number) => {
    setIsLoading(true);

    try {
      // Call reverse geocoding API
      const response = await fetch(`/api/places/geocode?lat=${lat}&lng=${lng}`);

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const place = await response.json();
      if (!place) {
        throw new Error('No results found for the given coordinates');
      }

      const location = {
        placeId: undefined,
        name: place.name || null,
        streetAddress:
          place.address_components?.find((c: any) =>
            c.types.includes('street_number')
          )?.long_name || null,
        city:
          place.address_components?.find((c: any) =>
            c.types.includes('locality')
          )?.long_name || null,
        region:
          place.address_components?.find((c: any) =>
            c.types.includes('administrative_area_level_1')
          )?.long_name || null,
        country:
          place.address_components?.find((c: any) =>
            c.types.includes('country')
          )?.long_name || '',
        postalCode:
          place.address_components?.find((c: any) =>
            c.types.includes('postal_code')
          )?.long_name || null,
        formattedAddress: place.formatted_address || null,
        latitude: lat,
        longitude: lng,
        isManuallyEntered: false,
      };

      form.reset(location);
      setSearchQuery('');

      if (onLocationSelect) {
        onLocationSelect(location);
      }
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle clearing the selected location
  const handleClearLocation = () => {
    form.reset({
      placeId: undefined,
      name: '',
      streetAddress: '',
      city: '',
      region: '',
      country: '',
      postalCode: '',
      formattedAddress: '',
      latitude: null,
      longitude: null,
      isManuallyEntered: false,
    });
    setSearchQuery('');

    if (onLocationSelect) {
      onLocationSelect({
        placeId: undefined,
        country: '',
        isManuallyEntered: false,
      });
    }
  };

  const formValues = form.getValues();
  const hasSelectedLocation = !!formValues.formattedAddress;

  return (
    <div className="space-y-4">
      <div className="relative">
        <LocationSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          isLoading={isLoading}
          placeholder="Search for a location..."
          label="Location"
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => {
            // Use setTimeout to allow click events on suggestions to fire before hiding
            setTimeout(() => setIsInputFocused(false), 150);
          }}
        />

        <LocationSuggestionsList
          suggestions={suggestions}
          onSelectSuggestion={handleSelectPlace}
          onManualEntry={() => setShowManualEntry(true)}
          isVisible={
            showSuggestions && searchQuery.length > 0 && isInputFocused
          }
        />
      </div>

      <div className="flex flex-col md:gap-4 w-full mt-4">
        {hasSelectedLocation && (
          <SelectedLocationDisplay
            name={formValues.name}
            formattedAddress={formValues.formattedAddress}
            onClear={handleClearLocation}
          />
        )}

        <div className="h-[200px]">
          <LocationMap
            latitude={formValues.latitude || undefined}
            longitude={formValues.longitude || undefined}
            googleMapsLoaded={googleMapsLoaded}
            onLocationSelect={handleMapLocationSelect}
            className="h-full w-full rounded-md border"
          />
        </div>
      </div>

      <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Enter Location Details</DialogTitle>
          </DialogHeader>
          <LocationManualEntryForm
            onSubmit={handleManualEntrySubmit}
            initialValues={formValues}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {isError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
          There was an error loading location details. Please try again later or
          enter location details manually.
        </div>
      )}
    </div>
  );
}
