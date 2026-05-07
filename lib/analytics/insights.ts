import type { ChannelStat, HeatmapCell } from "./queries";

const CHANNEL_LABELS: Record<string, string> = {
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
  linkedin: "LinkedIn",
  manual_call: "Apel telefonic",
  instagram: "Instagram",
  facebook: "Facebook",
};

const DAY_NAMES = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];

export function generateChannelInsight(data: ChannelStat[]): string {
  const withData = data.filter(d => d.sent >= 3);
  if (withData.length === 0) {
    return "Date insuficiente. Trimite cel puțin 3 mesaje per canal pentru insight-uri.";
  }
  const sorted = [...withData].sort((a, b) => b.reply_rate - a.reply_rate);
  const best = sorted[0];
  const bestLabel = CHANNEL_LABELS[best.channel] ?? best.channel;

  if (sorted.length === 1) {
    return `${bestLabel} are o rată de răspuns de ${(best.reply_rate * 100).toFixed(1)}% (${best.replied}/${best.sent} mesaje).`;
  }

  const worst = sorted[sorted.length - 1];
  const worstLabel = CHANNEL_LABELS[worst.channel] ?? worst.channel;
  const diff = ((best.reply_rate - worst.reply_rate) * 100).toFixed(1);
  return `${bestLabel} performează cel mai bine cu ${(best.reply_rate * 100).toFixed(1)}% rată de răspuns — cu ${diff}pp mai mult față de ${worstLabel}. Concentrează efortul pe ${bestLabel}.`;
}

export function generateBestTimeInsight(cells: HeatmapCell[]): string {
  if (cells.every(c => c.count === 0)) {
    return "Nu sunt date suficiente pentru analiza timpului optim de trimitere.";
  }

  const byDay = Array.from({ length: 7 }, (_, d) => ({
    day: d,
    count: cells.filter(c => c.day === d).reduce((s, c) => s + c.count, 0),
  })).sort((a, b) => b.count - a.count);

  const byHour = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    count: cells.filter(c => c.hour === h).reduce((s, c) => s + c.count, 0),
  })).sort((a, b) => b.count - a.count);

  const bestDay = byDay[0];
  const bestHour = byHour[0];
  const dayName = DAY_NAMES[bestDay.day];
  const hourStr = `${bestHour.hour.toString().padStart(2, "0")}:00`;

  return `Cel mai activ interval este ${dayName} în jurul orei ${hourStr}. Programează outreach-ul în acest interval pentru impact maxim.`;
}
