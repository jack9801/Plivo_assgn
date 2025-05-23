import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/services - Get all services
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

// POST /api/services - Create or update a service
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, status, description } = body;

    const service = await prisma.service.upsert({
      where: { id: id || '' },
      update: {
        name,
        status,
        description
      },
      create: {
        name,
        status,
        description
      }
    });

    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
} 