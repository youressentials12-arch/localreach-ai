import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "bg-red-500";
  if (score >= 60) return "bg-orange-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-gray-500";
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Critică";
  if (score >= 60) return "Ridicată";
  if (score >= 40) return "Medie";
  return "Scăzută";
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    discovered: "bg-gray-600 text-gray-200",
    contacted: "bg-blue-600 text-blue-100",
    replied: "bg-purple-600 text-purple-100",
    negotiating: "bg-yellow-600 text-yellow-100",
    won: "bg-green-600 text-green-100",
    lost: "bg-red-700 text-red-100",
    not_qualified: "bg-gray-700 text-gray-300",
  };
  return map[status] ?? "bg-gray-600 text-gray-200";
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    discovered: "Descoperit",
    contacted: "Contactat",
    replied: "Răspuns",
    negotiating: "Negociere",
    won: "Câștigat",
    lost: "Pierdut",
    not_qualified: "Necalificat",
  };
  return map[status] ?? status;
}

export function getChannelLabel(channel: string): string {
  const map: Record<string, string> = {
    email: "Email",
    phone: "Telefon",
    instagram: "Instagram",
    facebook: "Facebook",
    linkedin: "LinkedIn",
  };
  return map[channel] ?? channel;
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

// Simple in-memory rate limiter per user
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  userId: string,
  maxRequests = 10,
  windowMs = 60_000
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;

  entry.count++;
  return true;
}
