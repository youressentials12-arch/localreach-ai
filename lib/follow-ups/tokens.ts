import { createHmac } from "crypto";

const SECRET = process.env.JWT_TRACKING_SECRET ?? "dev-tracking-secret";

function b64url(s: string): string {
  return Buffer.from(s).toString("base64url");
}
function fromb64url(s: string): string {
  return Buffer.from(s, "base64url").toString();
}

export function signToken(payload: Record<string, unknown>): string {
  const data = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyToken(token: string): Record<string, unknown> | null {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", SECRET).update(data).digest("base64url");
  if (sig !== expected) return null;
  try {
    return JSON.parse(fromb64url(data)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function makeOpenToken(messageId: string): string {
  return signToken({ t: "open", mid: messageId });
}

export function makeClickToken(messageId: string, url: string): string {
  return signToken({ t: "click", mid: messageId, url });
}

export function makeUnsubscribeToken(prospectId: string, userId: string): string {
  return signToken({ t: "unsub", pid: prospectId, uid: userId, exp: Date.now() + 365 * 24 * 3600 * 1000 });
}

export function verifyUnsubscribeToken(token: string): { prospectId: string; userId: string } | null {
  const payload = verifyToken(token);
  if (!payload || payload.t !== "unsub") return null;
  if (typeof payload.exp === "number" && Date.now() > payload.exp) return null;
  return { prospectId: payload.pid as string, userId: payload.uid as string };
}
