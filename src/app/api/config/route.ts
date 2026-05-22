import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// Zod schema to validate the incoming application configuration
const ConfigSchema = z.object({
  name: z.string(),
  entities: z.array(z.object({
    name: z.string(),
    fields: z.array(z.object({
      name: z.string(),
      type: z.enum(['string', 'number', 'boolean', 'date']),
      required: z.boolean().optional().default(false),
    }).passthrough()),
  }).passthrough()),
  ui: z.object({
    views: z.array(z.object({
      type: z.enum(['table', 'form', 'dashboard']),
      entity: z.string().optional(),
      title: z.string(),
    }).passthrough()).optional().default([]),
  }).passthrough().optional().default({ views: [] }),
}).passthrough();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ConfigSchema.parse(body);

    // Upsert the configuration (create if it doesn't exist, update if it does)
    const config = await prisma.appConfiguration.upsert({
      where: { name: parsed.name },
      update: { schema: parsed as any },
      create: { name: parsed.name, schema: parsed as any },
    });

    return NextResponse.json({ success: true, data: config }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 });
    }
    console.error('Config API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const configs = await prisma.appConfiguration.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, data: configs });
  } catch (error) {
    console.error('Config API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
