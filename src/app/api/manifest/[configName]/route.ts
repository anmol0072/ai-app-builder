import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ configName: string }> }
) {
  try {
    const { configName } = await params;
    
    const config = await prisma.appConfiguration.findUnique({
      where: { name: configName },
    });

    if (!config) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 });
    }

    const schema: any = config.schema;
    const name = schema.localization?.en?.title || schema.name || configName;

    const manifest = {
      name: name,
      short_name: configName,
      start_url: `/app/${configName}`,
      display: "standalone",
      background_color: "#0B0C10",
      theme_color: "#4F46E5",
      icons: [
        {
          src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%234F46E5'/><text y='50' x='50' fill='white' font-family='sans-serif' font-size='40' dominant-baseline='middle' text-anchor='middle'>" + configName[0].toUpperCase() + "</text></svg>",
          sizes: "192x192",
          type: "image/svg+xml",
          purpose: "any maskable"
        },
        {
          src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%234F46E5'/><text y='50' x='50' fill='white' font-family='sans-serif' font-size='40' dominant-baseline='middle' text-anchor='middle'>" + configName[0].toUpperCase() + "</text></svg>",
          sizes: "512x512",
          type: "image/svg+xml",
          purpose: "any maskable"
        }
      ]
    };

    return new NextResponse(JSON.stringify(manifest), {
      status: 200,
      headers: {
        'Content-Type': 'application/manifest+json',
      },
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
