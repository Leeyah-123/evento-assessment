'use client';

import { MapPin } from 'lucide-react';
import { Button } from '../ui/button';

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

interface LocationSuggestionsListProps {
  suggestions: PlacePrediction[];
  onSelectSuggestion: (placeId: string) => void;
  onManualEntry: () => void;
  isVisible: boolean;
}

export function LocationSuggestionsList({
  suggestions,
  onSelectSuggestion,
  onManualEntry,
  isVisible,
}: LocationSuggestionsListProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg border rounded-md py-1 max-h-60 overflow-auto">
      {suggestions.length > 0 ? (
        suggestions.map((prediction) => (
          <div
            key={prediction.place_id}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
            onClick={() => onSelectSuggestion(prediction.place_id)}
          >
            <MapPin className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
            <div>
              {prediction.structured_formatting ? (
                <>
                  <div className="font-medium">
                    {prediction.structured_formatting.main_text}
                  </div>
                  <div className="text-sm text-gray-500">
                    {prediction.structured_formatting.secondary_text}
                  </div>
                </>
              ) : (
                <span>{prediction.description}</span>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="px-4 py-3 text-center">
          <p className="text-sm text-gray-500">No locations found</p>
        </div>
      )}

      <div className="px-4 py-2 flex items-center text-center text-sm text-gray-500">
        <p>Can&apos;t find what you're looking for?</p>
        <Button
          className="ml-1 p-0 text-blue-400 cursor-pointer"
          variant="link"
          onClick={onManualEntry}
        >
          Enter manually
        </Button>
      </div>
    </div>
  );
}
