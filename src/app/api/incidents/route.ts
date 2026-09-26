import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAndAnalyzeIncident } from '@/lib/rootCauseAnalyzer';

export async function GET() {
  try {
    let incidents = await prisma.incident.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // If no incidents exist yet, create a seed incident for immediate demonstration
    if (incidents.length === 0) {
      const demoIncident = await createAndAnalyzeIncident({
        affectedEndpoint: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY',
        serviceId: 'alphavantage',
        serviceName: 'Alpha Vantage',
        errorRate: 38.5,
      });

      return NextResponse.json([demoIncident]);
    }

    const formatted = incidents.map((inc) => ({
      id: inc.id,
      startTime: inc.startTime.toISOString(),
      affectedEndpoint: inc.affectedEndpoint,
      serviceId: inc.serviceId,
      serviceName: inc.serviceName,
      errorRate: inc.errorRate,
      status: inc.status,
      explanation: inc.explanation,
      confidence: inc.confidence,
      triggeringEvent: inc.triggeringEvent,
      suggestedNextStep: inc.suggestedNextStep,
      timeline: inc.timelineJson ? JSON.parse(inc.timelineJson) : [],
      createdAt: inc.createdAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch incidents:', error);
    return NextResponse.json({ error: 'Failed to fetch incidents', details: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const affectedEndpoint = body.affectedEndpoint || 'https://api.twilio.com/2010-04-01/Accounts/Messages.json';
    const serviceId = body.serviceId || 'twilio';
    const serviceName = body.serviceName || 'Twilio SMS';
    const errorRate = body.errorRate !== undefined ? Number(body.errorRate) : 42.0;

    const incident = await createAndAnalyzeIncident({
      affectedEndpoint,
      serviceId,
      serviceName,
      errorRate,
    });

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    console.error('Failed to create and analyze incident:', error);
    return NextResponse.json({ error: 'Failed to create and analyze incident', details: String(error) }, { status: 500 });
  }
}
