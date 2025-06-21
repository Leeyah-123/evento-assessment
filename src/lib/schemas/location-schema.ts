import { z } from 'zod';

export const locationSchema = z.object({
  // For Google Places selection
  placeId: z.string().optional(),
  
  // For manual entry
  name: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  isManuallyEntered: z.boolean().default(false),
  
  // For both
  formattedAddress: z.string().optional(),
});

export type LocationFormValues = z.infer<typeof locationSchema>;
