'use client';

import { MapPin } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface LocationSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
  placeholder?: string;
  label?: string;
}

export function LocationSearchInput({
  value,
  onChange,
  isLoading,
  placeholder = 'Search for a location...',
  label = 'Location',
}: LocationSearchInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="location-search">{label}</Label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          <MapPin className="h-4 w-4" />
        </div>
        <Input
          id="location-search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 pr-8 w-full"
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-t-2 border-primary rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
