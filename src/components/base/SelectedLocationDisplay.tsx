'use client';

import { X, MapPin } from 'lucide-react';
import { Button } from '../ui/button';

interface SelectedLocationDisplayProps {
  name?: string | null;
  formattedAddress?: string | null;
  onClear: () => void;
}

export function SelectedLocationDisplay({
  name,
  formattedAddress,
  onClear,
}: SelectedLocationDisplayProps) {
  if (!formattedAddress) return null;

  return (
    <div className="mt-2 p-3 border rounded-md bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex">
          <div className="mt-0.5 mr-2">
            <MapPin className="h-4 w-4 text-gray-500" />
          </div>
          <div>
            {name && <h3 className="font-medium text-sm">{name}</h3>}
            <p className="text-sm text-gray-600">{formattedAddress}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={onClear}
          className="h-6 w-6 p-0 rounded-full"
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Clear location</span>
        </Button>
      </div>
    </div>
  );
}
