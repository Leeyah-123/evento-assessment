import prisma from '@/lib/prisma';
import {
  getPlaceDetails,
  parseAddressComponents,
} from '@/lib/services/places-api';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for creating a location from Google Places
const placeIdSchema = z.object({
  placeId: z.string().min(1, 'Place ID is required'),
});

// Schema for manually creating a location
const manualLocationSchema = z.object({
  name: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    let locations;

    if (query) {
      // Search locations by query
      locations = await prisma.location.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { city: { contains: query, mode: 'insensitive' } },
            { country: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: { updatedAt: 'desc' },
      });
    } else {
      // Get all locations
      locations = await prisma.location.findMany({
        orderBy: { updatedAt: 'desc' },
      });
    }

    return NextResponse.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle location from Google Places
    if (body.placeId) {
      const parseResult = placeIdSchema.safeParse(body);

      if (!parseResult.success) {
        return NextResponse.json(
          { error: 'Invalid place ID' },
          { status: 400 }
        );
      }

      const placeDetails = await getPlaceDetails(body.placeId);

      if (!placeDetails) {
        return NextResponse.json(
          { error: 'Failed to fetch place details' },
          { status: 400 }
        );
      }

      const addressComponents = parseAddressComponents(
        placeDetails.address_components
      );

      const location = await prisma.location.create({
        data: {
          placeId: placeDetails.place_id,
          name:
            placeDetails.name || placeDetails.formatted_address.split(',')[0],
          streetAddress: addressComponents.streetAddress,
          city: addressComponents.city,
          region: addressComponents.region,
          country: addressComponents.country || 'Unknown',
          postalCode: addressComponents.postalCode,
          latitude: placeDetails.geometry.location.lat,
          longitude: placeDetails.geometry.location.lng,
          formattedAddress: placeDetails.formatted_address,
          isManuallyEntered: false,
        },
      });

      return NextResponse.json(location, { status: 201 });
    }
    // Handle manually entered location
    else {
      const parseResult = manualLocationSchema.safeParse(body);

      if (!parseResult.success) {
        return NextResponse.json(
          { error: parseResult.error.format() },
          { status: 400 }
        );
      }

      const location = await prisma.location.create({
        data: {
          ...body,
          isManuallyEntered: true,
        },
      });

      return NextResponse.json(location, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  }
}
