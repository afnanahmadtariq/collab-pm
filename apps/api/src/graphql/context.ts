import type { Request } from "express";
import { prisma } from "../lib/prisma.js";
import { redis } from "../lib/redis.js";
import { verifyToken, JWTPayload } from "../lib/auth.js";

export interface Context {
  prisma: typeof prisma;
  redis: typeof redis;
  user: JWTPayload | null;
}

export async function createContext({
  req,
}: {
  req: Request;
}): Promise<Context> {
  let user: JWTPayload | null = null;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    user = verifyToken(token);
  }

  return {
    prisma,
    redis,
    user,
  };
}
