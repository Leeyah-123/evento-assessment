import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventSchema, EventFormValues } from '@/lib/schemas/event-schema';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import LocationPicker from './LocationPicker';
import { cn } from '@/lib/utils';

export type EventFormProps = {
  onEventCreated: (event: any) => void;
  className?: string;
};

export default function EventForm({ onEventCreated, className }: EventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      organizerName: '',
      organizerEmail: '',
      location: {
        country: '',
      },
      price: 0,
      tags: [],
    },
  });

  async function onSubmit(data: EventFormValues) {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create event');
      }
      
      onEventCreated(result.event);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn("space-y-6 p-6 bg-white rounded-lg shadow", className)}>
      <div>
        <h2 className="text-2xl font-bold">Create New Event</h2>
        <p className="text-sm text-gray-500 mt-1">Fill in the details below to create your event</p>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Title</FormLabel>
                <FormControl>
                  <Input placeholder="Summer Concert in the Park" {...field} />
                </FormControl>
                <FormDescription>
                  Give your event a catchy title
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Provide details about your event" 
                    className="min-h-[120px]" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Describe what your event is about
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : undefined)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <LocationPicker 
                    initialLocation={field.value} 
                    onLocationSelect={(location) => {
                      field.onChange(location);
                    }} 
                  />
                </FormControl>
                <FormDescription>
                  Search for a location or click on the map to select
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="organizerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organizer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="organizerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organizer Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="maxAttendees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Attendees (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="100" 
                      type="number" 
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : undefined;
                        field.onChange(value);
                      }}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave empty for unlimited attendees
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="0.00" 
                      type="number" 
                      step="0.01" 
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value ? parseFloat(e.target.value) : 0;
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Set to 0 for free events
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Creating Event...' : 'Create Event'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
