# Evento Assessment Submission

This is my submission for the Evento assessment.

## Project Overview

This application includes the following key features:

- **Event Management**: Create and manage events with comprehensive details
- **Location Selection**: Search for locations using Google Places autocomplete
- **Interactive Map**: Click on any point on the map to select a location
- **Manual Entry**: Manually enter location details when automatic options don't suffice
- **Form Validation**: Complete validation with Zod to ensure data integrity
- **Database Integration**: PostgreSQL database storage with Prisma ORM
- **Modern UI**: Built with TailwindCSS and shadcn/ui components

## Prerequisites

- Node.js 16.x or later
- npm, yarn, or pnpm
- Google Cloud Platform account with Maps JavaScript API, Geography API and Places API (new and old) enabled

## Required Google API Setup

1. Visit the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Library"
4. Enable the following APIs:
   - [Maps JavaScript API](https://console.cloud.google.com/apis/library/maps-backend.googleapis.com)
   - [Places API](https://console.cloud.google.com/apis/library/places-backend.googleapis.com)
   - [Geography API](https://console.cloud.google.com/apis/library/geography.googleapis.com)
5. Go to "APIs & Services" > "Credentials"
6. Create an API Key (restrict it to Maps JavaScript API, Geography API and Places API for security)
7. Note down your API key for the next steps

## Installation

1. Clone the repository

```bash
git clone https://github.com/Leeyah-123/evento-assessment.git
cd evento-assessment
```

2. Install dependencies

```bash
pnpm install
```

3. Create a `.env` file in the root directory with the following:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_api_key_here
DATABASE_URL=postgresql://username:password@localhost:5432/db_name
```

## Running the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Key Components

### Event Management

The application features a complete event management system:

- **Event Creation Form**: Create events with title, description, dates, location, and additional details
- **Database Integration**: Events are stored in PostgreSQL via Prisma ORM
- **Event Details View**: After submission, view comprehensive details of the created event
- **Form Validation**: Complete validation with Zod ensures data integrity
- **Organizer Information**: Track event organizers with contact details

### Location Picker

The `LocationPicker` component provides a comprehensive interface for selecting locations:

- **Search Input**: Type to search for locations
- **Suggestions List**: Shows autocomplete results from Google Places API
- **Map View**: Interactive Google Map for visualization and selection
- **Manual Entry Form**: Fallback for manually entering location details
- **Reverse Geocoding**: Click on any point on the map to select a location

## Environment Variables

| Variable                        | Description              | Required |
| ------------------------------- | ------------------------ | -------- |
| NEXT_PUBLIC_GOOGLE_MAPS_API_KEY | Your Google Maps API key | Yes      |
| DATABASE_URL                    | Your database URL        | Yes      |

## Common Issues

- **Map Not Loading**: Check that your API key is correctly set and has the required APIs enabled
- **Places Not Working**: Ensure the Places API is enabled in your Google Cloud Console
- **API Key Restrictions**: If you've restricted your API key, make sure to allow your development domain

## Technical Implementation

### Database Schema

The application uses Prisma ORM with PostgreSQL to manage the data models:

**Location Model**
```prisma
model Location {
  id                String   @id @default(uuid())
  placeId           String?  @unique
  name              String?
  streetAddress     String?
  city              String?
  region            String?
  country           String
  postalCode        String?
  latitude          Float?
  longitude         Float?
  formattedAddress  String?
  isManuallyEntered Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  events            Event[]
}
```

**Event Model**
```prisma
model Event {
  id            String    @id @default(uuid())
  title         String
  description   String?
  startDate     DateTime
  endDate       DateTime?
  locationId    String
  location      Location  @relation(fields: [locationId], references: [id])
  organizerName String
  organizerEmail String
  maxAttendees  Int?
  imageUrl      String?
  price         Float?
  tags          String[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### API Routes

The application provides several API endpoints:

- `POST /api/events`: Creates a new event
- `GET /api/events`: Lists all events
- `GET /api/places/search`: Searches for places using Google Places API
- `GET /api/places/details`: Gets details for a specific place
- `GET /api/places/geocode`: Performs reverse geocoding for map clicks

## Built With

- [Next.js](https://nextjs.org/) - React framework
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [React Hook Form](https://react-hook-form.com/) - Form handling
- [Zod](https://github.com/colinhacks/zod) - Schema validation
- [Google Maps API](https://developers.google.com/maps) - Maps and location services
- [Prisma](https://www.prisma.io/) - Database ORM
- [PostgreSQL](https://www.postgresql.org/) - Database

## License

This project is licensed under the MIT License.
