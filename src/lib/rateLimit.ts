import { NextRequest } from "next/server";

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function rateLimit(req: NextRequest, limit: number = 100, windowMs: number = 60000) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  const record = rateLimitMap.get(ip)!;

  if (now - record.lastReset > windowMs) {
    record.count = 1;
    record.lastReset = now;
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}
