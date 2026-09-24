import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const keys = await prisma.apiKey.findMany({
      orderBy: { createdAt: 'desc' },
      include: { service: true },
    });
    return NextResponse.json(keys);
  } catch (error) {
    console.error('Failed to fetch keys:', error);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newKey = await prisma.apiKey.create({
      data: {
        serviceId: body.serviceId,
        serviceName: body.serviceName,
        environment: body.environment || 'Development',
        maskedKey: body.maskedKey,
        rawKey: body.rawKey,
        status: body.status || 'active',
        lastUsed: body.lastUsed || 'Just now',
        dateAdded: body.dateAdded || new Date().toISOString().split('T')[0],
      },
    });
    return NextResponse.json(newKey, { status: 201 });
  } catch (error) {
    console.error('Failed to create key:', error);
    return NextResponse.json({ error: 'Failed to create key' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }
    await prisma.apiKey.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete key:', error);
    return NextResponse.json({ error: 'Failed to delete key' }, { status: 500 });
  }
}
