import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const incident = await prisma.incident.findUnique({
      where: { id },
    });

    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    const formatted = {
      id: incident.id,
      startTime: incident.startTime.toISOString(),
      affectedEndpoint: incident.affectedEndpoint,
      serviceId: incident.serviceId,
      serviceName: incident.serviceName,
      errorRate: incident.errorRate,
      status: incident.status,
      explanation: incident.explanation,
      confidence: incident.confidence,
      triggeringEvent: incident.triggeringEvent,
      suggestedNextStep: incident.suggestedNextStep,
      timeline: incident.timelineJson ? JSON.parse(incident.timelineJson) : [],
      createdAt: incident.createdAt.toISOString(),
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch incident details:', error);
    return NextResponse.json({ error: 'Failed to fetch incident details' }, { status: 500 });
  }
}
