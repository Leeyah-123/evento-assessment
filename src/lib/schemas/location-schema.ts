import { z } from 'zod';

export const locationSchema = z.object({
  placeId: z.string().optional(),
  name: z.string().optional().nullable(),
  streetAddress: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().optional().nullable(),
  formattedAddress: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export type LocationFormValues = z.infer<typeof locationSchema>;

export const locationManualSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional().nullable(),
  streetAddress: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().optional().nullable(),
  formattedAddress: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export type LocationManualFormValues = z.infer<typeof locationManualSchema>;
