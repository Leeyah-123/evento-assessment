'use client';

import { Loader } from '@googlemaps/js-api-loader';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Import from relative paths to match project structure
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

// For Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

// Constants
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_LIBRARIES = ['places'];

// Define schema for location form
const locationSchema = z.object({
  placeId: z.string().optional(),
  name: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  isManuallyEntered: z.boolean().default(true),
  formattedAddress: z.string().optional(),
});

type LocationFormValues = z.infer<typeof locationSchema>;

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface LocationPickerProps {
  onLocationSelect?: (location: LocationFormValues) => void;
  initialValue?: LocationFormValues;
}

export default function LocationPicker({
  onLocationSelect,
  initialValue,
}: LocationPickerProps) {
  // Form and UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [placePredictions, setPlacePredictions] = useState<PlacePrediction[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [googleMapsError, setGoogleMapsError] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [manualDialog, setManualDialog] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema) as any,
    defaultValues: initialValue || {
      placeId: '',
      name: '',
      streetAddress: '',
      city: '',
      region: '',
      country: '',
      postalCode: '',
      latitude: null,
      longitude: null,
      isManuallyEntered: true,
      formattedAddress: '',
    },
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load Google Maps API
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key not provided');
      setGoogleMapsError(true);
      return;
    }

    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: GOOGLE_MAPS_LIBRARIES as any[],
    });

    loader
      .load()
      .then(() => {
        setGoogleMapsLoaded(true);
        console.log('Google Maps API loaded successfully');
      })
      .catch((error) => {
        console.error('Error loading Google Maps API:', error);
        setGoogleMapsError(true);
      });
  }, []);

  // Create a ref for the map container element
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  // Initialize map when Google Maps API is loaded
  useEffect(() => {
    if (!mapContainerRef.current || !googleMapsLoaded || !window.google) return;

    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: { lat: 0, lng: 0 },
      zoom: 2,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    setMapInstance(map);

    // Get location from form values
    const formValues = form.getValues();
    if (formValues.latitude && formValues.longitude) {
      const position = {
        lat: formValues.latitude,
        lng: formValues.longitude,
      };

      map.setCenter(position);
      map.setZoom(16);

      const newMarker = new window.google.maps.Marker({
        position,
        map,
        title: formValues.name || formValues.formattedAddress,
      });

      setMarker(newMarker);
    }

    // Clean up marker when component unmounts
    return () => {
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [googleMapsLoaded, form]);

  // Handle search for places
  useEffect(() => {
    const searchPlaces = async () => {
      if (
        !debouncedSearchQuery ||
        debouncedSearchQuery.length < 3 ||
        !googleMapsLoaded
      ) {
        setPlacePredictions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/places/search?q=${encodeURIComponent(debouncedSearchQuery)}`
        );
        const data = await response.json();

        if (data.predictions) {
          setPlacePredictions(data.predictions);
        }
      } catch (error) {
        console.error('Error searching for places:', error);
      } finally {
        setIsLoading(false);
      }
    };

    searchPlaces();
  }, [debouncedSearchQuery, googleMapsLoaded]);

  // Handle place selection
  const handlePlaceSelect = async (placeId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ placeId }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const locationData = await response.json();

      // Update form with location data
      form.reset(locationData);

      // Update map marker
      if (mapInstance && locationData.latitude && locationData.longitude) {
        const position = {
          lat: locationData.latitude,
          lng: locationData.longitude,
        };

        mapInstance.setCenter(position);
        mapInstance.setZoom(16);

        if (marker) {
          marker.setMap(null);
        }

        const newMarker = new window.google.maps.Marker({
          position,
          map: mapInstance,
          title: locationData.name || locationData.formattedAddress,
        });

        setMarker(newMarker);
      }

      // Clear search
      setSearchQuery('');
      setPlacePredictions([]);

      // Notify parent component
      if (onLocationSelect) {
        onLocationSelect(locationData);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      form.setError('root', { message: 'Failed to fetch place details' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission for manual entry
  const onSubmitManualEntry = async (data: LocationFormValues) => {
    setIsLoading(true);
    try {
      const locationData = {
        ...data,
        isManuallyEntered: true,
      };

      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const createdLocation = await response.json();

      // Update form with created location
      form.reset(createdLocation);

      // Update map if coordinates are available
      if (
        mapInstance &&
        createdLocation.latitude &&
        createdLocation.longitude
      ) {
        const position = {
          lat: createdLocation.latitude,
          lng: createdLocation.longitude,
        };

        mapInstance.setCenter(position);
        mapInstance.setZoom(16);

        if (marker) {
          marker.setMap(null);
        }

        const newMarker = new window.google.maps.Marker({
          position,
          map: mapInstance,
          title:
            createdLocation.name ||
            `${createdLocation.city}, ${createdLocation.country}`,
        });

        setMarker(newMarker);
      }

      // Close dialog
      setManualDialog(false);

      // Notify parent component
      if (onLocationSelect) {
        onLocationSelect(createdLocation);
      }
    } catch (error) {
      console.error('Error creating location:', error);
      form.setError('root', { message: 'Failed to create location' });
    } finally {
      setIsLoading(false);
    }
  };

  // Render location picker UI
  return (
    <div className="flex flex-col">
      {/* Main location field with search/select */}
      <div className="relative w-full">
        <div className="w-full flex items-center gap-2">
          <div className="flex-1">
            <Label htmlFor="location-search">Location</Label>
            <div className="relative">
              <Input
                id="location-search"
                placeholder="Search for a location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
                className="w-full"
                disabled={isLoading}
              />
              {isLoading && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-t-2 border-primary rounded-full" />
                </div>
              )}
            </div>
          </div>
          <div className="mt-6">
            <Dialog open={manualDialog} onOpenChange={setManualDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setManualDialog(true)}
                >
                  Manual Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Enter Location Details Manually</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmitManualEntry)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Building or Business Name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="streetAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="region"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Region/State</FormLabel>
                            <FormControl>
                              <Input placeholder="Region or State" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Country"
                                required
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Postal Code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="latitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Latitude</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.0000001"
                                placeholder="Latitude"
                                value={field.value?.toString() || ''}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ''
                                      ? null
                                      : parseFloat(e.target.value)
                                  )
                                }
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="longitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Longitude</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.0000001"
                                placeholder="Longitude"
                                value={field.value?.toString() || ''}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ''
                                      ? null
                                      : parseFloat(e.target.value)
                                  )
                                }
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setManualDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-white rounded-full" />
                            Saving...
                          </div>
                        ) : (
                          'Save Location'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search predictions dropdown */}
        {searchQuery.length > 0 && placePredictions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg border rounded-md py-1 max-h-60 overflow-auto">
            {placePredictions.map((prediction) => (
              <div
                key={prediction.place_id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                onClick={() => handlePlaceSelect(prediction.place_id)}
              >
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span>{prediction.description}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected location display */}
      {form.watch('formattedAddress') && (
        <div className="mt-4 p-4 border rounded-md">
          <div className="flex items-start justify-between">
            <div>
              {form.watch('name') && (
                <h3 className="font-medium">{form.watch('name')}</h3>
              )}
              <p>{form.watch('formattedAddress')}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => {
                form.reset({
                  placeId: '',
                  name: '',
                  streetAddress: '',
                  city: '',
                  region: '',
                  country: '',
                  postalCode: '',
                  latitude: null,
                  longitude: null,
                  isManuallyEntered: true,
                  formattedAddress: '',
                });
                if (marker) {
                  marker.setMap(null);
                  setMarker(null);
                }
                if (mapInstance) {
                  mapInstance.setCenter({ lat: 0, lng: 0 });
                  mapInstance.setZoom(2);
                }
                if (onLocationSelect) {
                  onLocationSelect(null as any);
                }
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Map preview */}
      <div className="mt-4 h-60 w-full rounded-md overflow-hidden border">
        {googleMapsError ? (
          <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">Failed to load Google Maps</p>
          </div>
        ) : (
          <div ref={mapContainerRef} className="h-full w-full bg-gray-100" />
        )}
      </div>
    </div>
  );
}
