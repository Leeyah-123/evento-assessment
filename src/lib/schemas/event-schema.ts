import { z } from 'zod';
import { locationSchema } from './location-schema';

export const eventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description cannot exceed 1000 characters'),
  startDate: z.string().refine((date) => {
    // Add date validation if needed
    return true;
  }, {
    message: 'Start date is required'
  }),
  endDate: z.string().optional(),
  location: locationSchema,
  organizerName: z.string().min(3, 'Organizer name must be at least 3 characters'),
  organizerEmail: z.string().email('Please enter a valid email address'),
  maxAttendees: z.number().int().positive().optional(),
  imageUrl: z.string().url().optional(),
  price: z.number().min(0, 'Price cannot be negative').optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;
