import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const services = await prisma.apiService.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return NextResponse.json({ error: 'Database connection failed or table missing' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const serviceData = {
      name: body.name,
      category: body.category,
      used: body.used || 0,
      limit: body.limit || 1000,
      status: body.status || 'healthy',
      statusColor: body.statusColor || 'green',
      resetTime: body.resetTime || '24h',
      endpointUrl: body.endpointUrl,
      latencyMs: body.latencyMs || 100,
      description: body.description,
      color: body.color || '#3b82f6',
    };

    const service = body.id
      ? await prisma.apiService.upsert({
          where: { id: body.id },
          update: serviceData,
          create: { id: body.id, ...serviceData },
        })
      : await prisma.apiService.create({
          data: serviceData,
        });

    return NextResponse.json(service, { status: 200 });
  } catch (error) {
    console.error('Failed to create/update service:', error);
    return NextResponse.json({ error: 'Failed to create or update service' }, { status: 500 });
  }
}
