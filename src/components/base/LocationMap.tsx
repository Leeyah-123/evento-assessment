'use client';

import { useEffect, useRef } from 'react';

interface LocationMapProps {
  latitude?: number | null;
  longitude?: number | null;
  googleMapsLoaded: boolean;
  onMapLoad?: (map: any) => void;
  onLocationSelect?: (lat: number, lng: number) => void;
  className?: string;
}

// Declare global window interface to include Google Maps
declare global {
  interface Window {
    google: any;
  }
}

export function LocationMap({
  latitude,
  longitude,
  googleMapsLoaded,
  onMapLoad,
  onLocationSelect,
  className = 'h-full w-full bg-gray-100',
}: LocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any | null>(null);
  const markerRef = useRef<any | null>(null);

  // Initialize map when Google Maps API is loaded
  useEffect(() => {
    if (!mapContainerRef.current || !googleMapsLoaded || !window.google) return;

    // Default center (world view) when no coordinates provided
    const defaultPosition = { lat: 20, lng: 0 };
    const position =
      latitude && longitude
        ? { lat: latitude, lng: longitude }
        : defaultPosition;
    const zoom = latitude && longitude ? 15 : 2;

    // Create map if it doesn't exist
    if (!mapInstanceRef.current) {
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: position,
        zoom: zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      mapInstanceRef.current = map;

      // Add click listener to map for location selection
      if (onLocationSelect) {
        map.addListener('click', (e: any) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          onLocationSelect(lat, lng);
        });
      }

      // Pass the map instance to parent via callback
      if (onMapLoad) {
        onMapLoad(map);
      }
    }

    // Update map with coordinates if available
    if (latitude && longitude) {
      mapInstanceRef.current.setCenter(position);
      mapInstanceRef.current.setZoom(zoom);

      // Clear existing marker
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      // Create new marker
      markerRef.current = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
      });
    }

    return () => {
      // Clean up marker when component unmounts or when coordinates change
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [googleMapsLoaded, latitude, longitude, onMapLoad]);

  return <div ref={mapContainerRef} className={className} />;
}
