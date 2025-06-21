import { getPlaceDetails } from '@/lib/services/places-api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('place_id');

    if (!placeId) {
      return NextResponse.json(
        { error: 'Place ID is required' },
        { status: 400 }
      );
    }

    const placeDetails = await getPlaceDetails(placeId);

    if (!placeDetails) {
      return NextResponse.json(
        { error: 'Place details not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(placeDetails);
  } catch (error) {
    console.error('Error fetching place details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch place details' },
      { status: 500 }
    );
  }
}
