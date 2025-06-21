# Evento Assessment Submission

This is my submission for the Evento assessment.

## Project Overview

This application includes the following key features:

- **Location Selection**: Search for locations using Google Places autocomplete
- **Interactive Map**: Click on any point on the map to select a location
- **Manual Entry**: Manually enter location details when automatic options don't suffice
- **Form Validation**: Complete validation with Zod to ensure location data integrity
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
git clone <repository-url>
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

### Location Picker

The main `LocationPicker` component provides a comprehensive interface for selecting locations:

- **Search Input**: Type to search for locations
- **Suggestions List**: Shows autocomplete results from Google Places API
- **Map View**: Interactive Google Map for visualization and selection
- **Manual Entry Form**: Fallback for manually entering location details

## Environment Variables

| Variable                        | Description              | Required |
| ------------------------------- | ------------------------ | -------- |
| NEXT_PUBLIC_GOOGLE_MAPS_API_KEY | Your Google Maps API key | Yes      |
| DATABASE_URL                    | Your database URL        | Yes      |

## Common Issues

- **Map Not Loading**: Check that your API key is correctly set and has the required APIs enabled
- **Places Not Working**: Ensure the Places API is enabled in your Google Cloud Console
- **API Key Restrictions**: If you've restricted your API key, make sure to allow your development domain

## Built With

- [Next.js](https://nextjs.org/) - React framework
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [React Hook Form](https://react-hook-form.com/) - Form handling
- [Zod](https://github.com/colinhacks/zod) - Schema validation
- [Google Maps API](https://developers.google.com/maps) - Maps and location services

## License

This project is licensed under the MIT License.
