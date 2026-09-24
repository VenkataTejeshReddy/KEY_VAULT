import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MOCK_SERVICES, MOCK_KEYS, MOCK_LOGS } from '@/lib/mockData';

export async function POST() {
  try {
    // 1. Upsert Services
    for (const s of MOCK_SERVICES) {
      await prisma.apiService.upsert({
        where: { id: s.id },
        update: {
          name: s.name,
          category: s.category,
          used: s.used,
          limit: s.limit,
          status: s.status,
          statusColor: s.statusColor,
          resetTime: s.resetTime,
          endpointUrl: s.endpointUrl,
          latencyMs: s.latencyMs,
          description: s.description,
          color: s.color,
        },
        create: {
          id: s.id,
          name: s.name,
          category: s.category,
          used: s.used,
          limit: s.limit,
          status: s.status,
          statusColor: s.statusColor,
          resetTime: s.resetTime,
          endpointUrl: s.endpointUrl,
          latencyMs: s.latencyMs,
          description: s.description,
          color: s.color,
        },
      });
    }

    // 2. Upsert Keys
    for (const k of MOCK_KEYS) {
      await prisma.apiKey.upsert({
        where: { id: k.id },
        update: {
          serviceId: k.serviceId,
          serviceName: k.serviceName,
          environment: k.environment,
          maskedKey: k.maskedKey,
          rawKey: k.rawKey,
          status: k.status,
          lastUsed: k.lastUsed,
          dateAdded: k.dateAdded,
        },
        create: {
          id: k.id,
          serviceId: k.serviceId,
          serviceName: k.serviceName,
          environment: k.environment,
          maskedKey: k.maskedKey,
          rawKey: k.rawKey,
          status: k.status,
          lastUsed: k.lastUsed,
          dateAdded: k.dateAdded,
        },
      });
    }

    // 3. Insert Logs if empty
    const logCount = await prisma.usageLog.count();
    if (logCount === 0) {
      for (const log of MOCK_LOGS) {
        await prisma.usageLog.create({
          data: {
            id: log.id,
            serviceId: log.serviceId,
            serviceName: log.serviceName,
            endpoint: log.endpoint,
            status: log.status,
            responseTime: log.responseTime,
            payloadSize: log.payloadSize,
            timestamp: log.timestamp,
          },
        });
      }
    }

    // 4. Default Settings
    await prisma.userSettings.upsert({
      where: { id: 'default-settings' },
      update: {},
      create: {
        id: 'default-settings',
        tier: 'pro',
        alertThreshold: 80,
        theme: 'dark',
      },
    });

    return NextResponse.json({ message: 'Database successfully seeded with default services and credentials!' });
  } catch (error) {
    console.error('Failed to seed database:', error);
    return NextResponse.json({ error: 'Failed to seed database', details: String(error) }, { status: 500 });
  }
}
