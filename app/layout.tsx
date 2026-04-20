import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LocalReach AI — Prospecting inteligent pentru afaceri locale",
  description:
    "Găsește afaceri locale calificate și generează hook-uri de outreach personalizate cu AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" className="dark">
      <body className="min-h-screen bg-[#0f0f13] text-[#e2e2f0] antialiased">
        {children}
      </body>
    </html>
  );
}
