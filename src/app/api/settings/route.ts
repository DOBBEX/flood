import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const SettingsSchema = z.object({
  distWarningCm: z.number().min(0).max(255),
  distCriticalCm: z.number().min(0).max(255),
  distHysteresisCm: z.number().min(0).max(50),
  waterCritThresh: z.number().min(0).max(1023),
  waterHysteresis: z.number().min(0).max(200),
  rainAoThresh: z.number().min(0).max(1023),
  smsCooldownMs: z.number().min(0),
  probeDebounceMs: z.number().min(0),
  rainResumeMs: z.number().min(0),
  recipientPhone: z.string().min(1),
});

let memorySettings = {
  distWarningCm: 50,
  distCriticalCm: 25,
  distHysteresisCm: 8,
  waterCritThresh: 600,
  waterHysteresis: 80,
  rainAoThresh: 800,
  smsCooldownMs: 120000,
  probeDebounceMs: 500,
  rainResumeMs: 30000,
  recipientPhone: "+1234567890",
};

export async function GET() {
  try {
    const config = await prisma.systemConfig.findFirst();
    return NextResponse.json(config || memorySettings);
  } catch {
    return NextResponse.json(memorySettings);
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const parsed = SettingsSchema.parse(data);

    try {
      let config = await prisma.systemConfig.findFirst();
      if (!config) {
        config = await prisma.systemConfig.create({ data: parsed });
      } else {
        config = await prisma.systemConfig.update({
          where: { id: config.id },
          data: parsed,
        });
      }
      memorySettings = { ...memorySettings, ...parsed };
      return NextResponse.json(config);
    } catch {
      memorySettings = { ...memorySettings, ...parsed };
      return NextResponse.json(memorySettings);
    }
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
