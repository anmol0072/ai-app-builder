import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getUserIdFromRequest } from '@/lib/auth';

function validateData(schema: any, entityName: string, data: any) {
  const entityDef = schema.entities.find((e: any) => e.name === entityName);
  if (!entityDef) throw new Error(`Entity ${entityName} not found in configuration`);

  const shape: any = {};
  for (const field of entityDef.fields) {
    let zodType: z.ZodTypeAny;
    switch (field.type) {
      case 'string': zodType = z.string(); break;
      case 'number': zodType = z.number(); break;
      case 'boolean': zodType = z.boolean(); break;
      case 'date': zodType = z.string().datetime(); break;
      default: zodType = z.any();
    }
    if (!field.required) zodType = zodType.optional().nullable();
    shape[field.name] = zodType;
  }
  return z.object(shape).parse(data);
}

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params;
    const [configName, entityName, recordId] = path;
    const userId = getUserIdFromRequest(request);

    const config = await prisma.appConfiguration.findUnique({ where: { name: configName } });
    if (!config) return NextResponse.json({ error: 'Config not found' }, { status: 404 });

    if (recordId) {
      const record = await prisma.dynamicRecord.findUnique({
        where: { id: recordId, configurationId: config.id },
      });
      if (!record || (record.data as any)._entity !== entityName) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      // User scoped check
      if (record.userId && record.userId !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      return NextResponse.json({ success: true, data: record });
    } else {
      const { searchParams } = new URL(request.url);
      const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
      const search = searchParams.get('search') || '';

      let records = await prisma.dynamicRecord.findMany({
        where: {
          configurationId: config.id,
          ...(userId ? { userId } : {}),
          data: { path: ['_entity'], equals: entityName }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (search) {
        const lowerSearch = search.toLowerCase();
        records = records.filter(r => 
          Object.values(r.data as object).some(val => 
            String(val).toLowerCase().includes(lowerSearch)
          )
        );
      }

      const total = records.length;
      const paginatedRecords = records.slice((page - 1) * limit, page * limit);

      return NextResponse.json({ 
        success: true, 
        data: paginatedRecords,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params;
    const [configName, entityName, action] = path;
    const userId = getUserIdFromRequest(request);

    if (!userId) return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });

    const config = await prisma.appConfiguration.findUnique({ where: { name: configName } });
    if (!config) return NextResponse.json({ error: 'Config not found' }, { status: 404 });

    if (action === 'csv') {
      const body = await request.json();
      if (!Array.isArray(body)) return NextResponse.json({ error: 'Expected array' }, { status: 400 });

      const validRecords = [];
      const errors = [];
      for (let i = 0; i < body.length; i++) {
        try {
          const validated = validateData(config.schema, entityName, body[i]);
          validated._entity = entityName;
          validRecords.push(validated);
        } catch (e: any) {
          errors.push({ row: i + 1, error: e.errors || e.message });
        }
      }

      if (validRecords.length > 0) {
        await prisma.dynamicRecord.createMany({
          data: validRecords.map(data => ({ configurationId: config.id, userId, data: data as any }))
        });
      }
      return NextResponse.json({ success: true, imported: validRecords.length, errors }, { status: 201 });
    }

    const body = await request.json();
    let validatedData: any;
    try {
      validatedData = validateData(config.schema, entityName, body);
    } catch (e: any) {
      return NextResponse.json({ error: 'Validation Error', details: e.errors || e.message }, { status: 400 });
    }

    validatedData._entity = entityName;
    const record = await prisma.dynamicRecord.create({
      data: { configurationId: config.id, userId, data: validatedData as any }
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params;
    const [configName, entityName, recordId] = path;
    const userId = getUserIdFromRequest(request);

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const config = await prisma.appConfiguration.findUnique({ where: { name: configName } });
    if (!config) return NextResponse.json({ error: 'Config not found' }, { status: 404 });

    const existing = await prisma.dynamicRecord.findUnique({ where: { id: recordId } });
    if (existing?.userId !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const body = await request.json();
    const validatedData: any = validateData(config.schema, entityName, body);
    validatedData._entity = entityName;

    const record = await prisma.dynamicRecord.update({
      where: { id: recordId },
      data: { data: validatedData as any }
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params;
    const [configName, entityName, recordId] = path;
    const userId = getUserIdFromRequest(request);

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await prisma.dynamicRecord.findUnique({ where: { id: recordId } });
    if (existing?.userId !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    await prisma.dynamicRecord.delete({ where: { id: recordId } });
    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
