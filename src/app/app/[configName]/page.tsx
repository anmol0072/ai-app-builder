import prisma from '@/lib/prisma';
import AppRenderer from '@/components/AppRenderer';
import { notFound } from 'next/navigation';

export default async function DynamicAppPage({ params }: { params: Promise<{ configName: string }> }) {
  const { configName } = await params;
  
  const config = await prisma.appConfiguration.findUnique({
    where: { name: configName },
  });

  if (!config) {
    notFound();
  }

  return <AppRenderer config={config} />;
}
