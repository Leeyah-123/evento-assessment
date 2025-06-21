import prisma from '@/lib/prisma';
import { eventSchema } from '@/lib/schemas/event-schema';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate event data
    const validationResult = eventSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid event data',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { location, ...eventData } = validationResult.data;

    // Create or find the location
    let locationRecord = await prisma.location.create({
      data: {
        ...location,
        latitude: location.latitude ? Number(location.latitude) : null,
        longitude: location.longitude ? Number(location.longitude) : null,
      },
    });

    // Convert string dates to Date objects for Prisma
    const startDate = new Date(eventData.startDate);
    const endDate = eventData.endDate ? new Date(eventData.endDate) : null;

    // Create the event with the location
    const event = await prisma.event.create({
      data: {
        ...eventData,
        startDate,
        endDate,
        locationId: locationRecord.id,
      },
      include: {
        location: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        event,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        location: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
