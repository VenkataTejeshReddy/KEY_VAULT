import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get('serviceId');

    const logs = await prisma.usageLog.findMany({
      where: serviceId ? { serviceId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const log = await prisma.usageLog.create({
      data: {
        serviceId: body.serviceId,
        serviceName: body.serviceName,
        endpoint: body.endpoint,
        status: body.status || 200,
        responseTime: body.responseTime || '120ms',
        payloadSize: body.payloadSize || '1.0 KB',
        timestamp: body.timestamp || new Date().toLocaleTimeString(),
      },
    });
    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Failed to create log:', error);
    return NextResponse.json({ error: 'Failed to create log' }, { status: 500 });
  }
}
