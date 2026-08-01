import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const configuredSecret = process.env.JWT_SECRET ?? process.env.SESSION_SECRET;
if (process.env.NODE_ENV === "production" && !configuredSecret) {
  throw new Error("JWT_SECRET or SESSION_SECRET is required in production");
}
const JWT_SECRET = configuredSecret ?? "monster-realms-secret-dev-only";
const JWT_EXPIRES_IN = "30d";

export function generateToken(playerId: string): string {
  return jwt.sign({ sub: playerId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
