import { format } from 'date-fns';
import { MapPin, Calendar, User, Mail, Users, Tag, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type EventDetailsProps = {
  event: any;
  onBackToForm: () => void;
  className?: string;
};

export default function EventDetails({ event, onBackToForm, className }: EventDetailsProps) {
  if (!event) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP');
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <div>
            <CardTitle className="text-2xl">{event.title}</CardTitle>
            <CardDescription>Event created successfully</CardDescription>
          </div>
          <Button variant="outline" onClick={onBackToForm}>
            Create Another Event
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted p-4 rounded-md">
          <p className="text-sm text-muted-foreground mb-2">Event ID</p>
          <p className="font-mono text-sm">{event.id}</p>
        </div>

        {event.description && (
          <div>
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            <div>
              <p className="font-medium">Start Date</p>
              <p className="text-gray-600">{formatDate(event.startDate)}</p>
            </div>
          </div>

          {event.endDate && (
            <div className="flex items-start">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              <div>
                <p className="font-medium">End Date</p>
                <p className="text-gray-600">{formatDate(event.endDate)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="flex items-start mb-4">
            <MapPin className="h-5 w-5 mr-2 text-primary" />
            <div>
              <p className="font-medium">Location</p>
              <p className="text-gray-600">{event.location.name || 'Unnamed Location'}</p>
              <p className="text-gray-600">{event.location.formattedAddress || 
                [
                  event.location.streetAddress,
                  event.location.city,
                  event.location.region,
                  event.location.country,
                  event.location.postalCode
                ].filter(Boolean).join(', ')
              }</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <User className="h-5 w-5 mr-2 text-primary" />
              <div>
                <p className="font-medium">Organizer</p>
                <p className="text-gray-600">{event.organizerName}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Mail className="h-5 w-5 mr-2 text-primary" />
              <div>
                <p className="font-medium">Contact Email</p>
                <p className="text-gray-600">{event.organizerEmail}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {event.maxAttendees && (
            <div className="flex items-start">
              <Users className="h-5 w-5 mr-2 text-primary" />
              <div>
                <p className="font-medium">Maximum Attendees</p>
                <p className="text-gray-600">{event.maxAttendees}</p>
              </div>
            </div>
          )}

          <div className="flex items-start">
            <DollarSign className="h-5 w-5 mr-2 text-primary" />
            <div>
              <p className="font-medium">Price</p>
              <p className="text-gray-600">
                {event.price ? `$${parseFloat(event.price).toFixed(2)}` : 'Free'}
              </p>
            </div>
          </div>
        </div>

        {event.tags && event.tags.length > 0 && (
          <div>
            <div className="flex items-center mb-2">
              <Tag className="h-4 w-4 mr-2" />
              <p className="font-medium">Tags</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>Created: {formatDate(event.createdAt)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
