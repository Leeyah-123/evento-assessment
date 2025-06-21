import { searchPlaces } from '@/lib/services/places-api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ predictions: [] });
    }

    const predictions = await searchPlaces(query);
    return NextResponse.json({ predictions });
  } catch (error) {
    console.error('Error searching places:', error);
    return NextResponse.json(
      { error: 'Failed to search places', predictions: [] },
      { status: 500 }
    );
  }
}
