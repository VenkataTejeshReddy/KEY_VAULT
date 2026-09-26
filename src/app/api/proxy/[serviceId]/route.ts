import { NextRequest } from 'next/server';
import { GET as handlerGET, POST as handlerPOST, PUT as handlerPUT, PATCH as handlerPATCH, DELETE as handlerDELETE, HEAD as handlerHEAD, OPTIONS as handlerOPTIONS } from './[...path]/route';

export async function GET(req: NextRequest, context: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await context.params;
  return handlerGET(req, { params: Promise.resolve({ serviceId, path: [] }) });
}

export async function POST(req: NextRequest, context: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await context.params;
  return handlerPOST(req, { params: Promise.resolve({ serviceId, path: [] }) });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await context.params;
  return handlerPUT(req, { params: Promise.resolve({ serviceId, path: [] }) });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await context.params;
  return handlerPATCH(req, { params: Promise.resolve({ serviceId, path: [] }) });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await context.params;
  return handlerDELETE(req, { params: Promise.resolve({ serviceId, path: [] }) });
}

export async function HEAD(req: NextRequest, context: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await context.params;
  return handlerHEAD(req, { params: Promise.resolve({ serviceId, path: [] }) });
}

export async function OPTIONS() {
  return handlerOPTIONS();
}
