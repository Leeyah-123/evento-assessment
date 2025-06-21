# Evento Assessment: Technical Report

## Summary

This application is a simple event management system featuring a powerful, modular location selection component. This report provides a technical overview of the system architecture, component design, implementation details, and integration patterns used throughout the application.

## System Architecture

### Tech Stack

- **Frontend**: Next.js 14 with React and TypeScript
- **UI Framework**: Tailwind CSS with custom component library
- **Form Management**: React Hook Form with Zod validation
- **Maps Integration**: Google Maps JavaScript API, Places API, Geocoding API
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM

### Component Architecture

The application follows a modular component architecture with clear separation of concerns:

1. **Base Components**: Reusable UI elements (e.g., LocationSearchInput, LocationMap)
2. **Core Components**: Feature-specific components combining base components (e.g., LocationPicker)
3. **API Integration**: Backend routes handling external API calls and database operations

## LocationPicker Component

The LocationPicker is a feature-rich component that enables location selection through multiple methods:

### Component Structure

```
LocationPicker
├── LocationSearchInput
├── LocationSuggestionsList
├── SelectedLocationDisplay
├── LocationMap
└── LocationManualEntryForm
```

### Key Features

1. **Interactive Map Selection**

   - Google Maps integration for direct location selection
   - Reverse geocoding to obtain address details
   - Real-time marker updates

   [Demo Video: Selecting a Location on the Map](https://vimeo.com/1095273728)

2. **Location Search with Autocomplete**

   - Place search with Google Places API
   - Type-ahead suggestions with debounced queries
   - Structured address formatting

   [Demo Video: Entering a Location and Selecting from Suggestions](https://vimeo.com/1095276527)

3. **Manual Location Entry**

   - Structured form for manual address input
   - Field validation with Zod schema
   - Support for locations not found in Google Places

   [Demo Video: Entering a Location Manually](https://vimeo.com/1095272347)

## Event Management System

The surrounding event management system integrates with the LocationPicker to provide a complete event creation and management workflow, showcasing the LocationPicker's capabilities.

### Data Model

```
Event
├── Title
├── Description
├── StartDateTime
├── EndDateTime
├── Location (relationship)
│   ├── PlaceId
│   ├── FormattedAddress
│   ├── Latitude/Longitude
│   └── Address Components
├── Organizer
│   ├── Name
│   └── Email
└── Optional Fields
    ├── MaxAttendees
    ├── Price
    └── Tags
```

### API Endpoints

- `POST /api/events`: Create new events
- `GET /api/events`: Retrieve events with optional filtering
- `GET /api/places/search`: Search for places using Google Places API
- `GET /api/places/details`: Get detailed place information by ID
- `POST /api/places/reverse-geocode`: Convert coordinates to address

## Implementation Details

### LocationPicker Component

The LocationPicker component manages several complex workflows:

1. **Google Maps Integration**

   - Dynamic loading of Maps JavaScript API
   - Library initialization with proper error handling
   - Map instance management and event binding

2. **Places API Integration**

   - Search query debouncing to reduce API calls
   - Structured prediction formatting
   - Error handling for API failures

3. **Form State Management**
   - React Hook Form integration
   - Zod schema validation
   - Default values and state reset functionality

### Code Example: Place Selection Handler

```typescript
const handleSelectPlace = async (placeId: string) => {
  if (!placeId) return;

  setShowSuggestions(false);
  setIsLoading(true);

  try {
    const response = await fetch(`/api/places/details?place_id=${placeId}`);
    const data = await response.json();

    if (data) {
      const place = data;
      const location = {
        place_id: place.place_id,
        name: place.name || '',
        // ... Additional address component processing
        formattedAddress: place.formatted_address || '',
        latitude: place.geometry?.location.lat || null,
        longitude: place.geometry?.location.lng || null,
      };

      form.reset(location);
      setSearchQuery('');

      if (onLocationSelect) {
        onLocationSelect(location);
      }
    }
  } catch (error) {
    console.error('Error fetching place details:', error);
    setIsError(true);
  } finally {
    setIsLoading(false);
  }
};
```

## Database Integration

The application uses Prisma ORM to interact with a PostgreSQL database:

1. **Schema Design**

   - Proper relationships between entities
   - Type-safe fields with appropriate constraints
   - Migration management for schema evolution

2. **Data Access Layer**
   - Repository pattern for data access
   - Prisma Client for type-safe queries
   - Transaction support for complex operations

## UI/UX Considerations

1. **Progressive Enhancement**

   - Map remains visible even when no location is selected to prevent large UI shifts that can affect UX
   - Multiple selection methods for different user preferences (manual entry, map selection, and search)
   - Graceful degradation when APIs are unavailable

2. **Error Handling**

   - Informative error messages
   - Fallback mechanisms (e.g., manual entry when API fails)
   - Loading states for async operations

3. **Accessibility**
   - Keyboard navigation support
   - Screen reader compatibility
   - Proper ARIA attributes

## Performance Optimizations

1. **Query Debouncing**

   - Reduced API calls during typing
   - Improved user experience and reduced costs

2. **Lazy Loading**

   - Dynamic import of Google Maps libraries
   - Reduced initial page load time

3. **State Management**
   - Efficient component re-renders
   - Careful handling of form state

## Deployment Details

### Deployment Platforms

1. **Frontend**: Vercel
2. **Backend**: Vercel
3. **Database**: Render

### Access Links

- **Live Application**: [https://evento-assessment.vercel.app](https://evento-assessment.vercel.app)
- **GitHub Repository**: [https://github.com/Leeyah-123/evento-assessment](https://github.com/Leeyah-123/evento-assessment)

**Appendix: Environment Setup Requirements**

- Node.js 18+ and pnpm
- PostgreSQL database
- Google Maps API key with:
  - Maps JavaScript API enabled
  - Places API enabled
  - Geocoding API enabled
- Environment variables configured in `.env` file:
  - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
  - `DATABASE_URL`
