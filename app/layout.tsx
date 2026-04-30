import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LocalReach AI — Găsește afaceri locale care au nevoie de tine",
  description:
    "Platformă AI pentru freelanceri și agenții din România. Găsești afaceri locale calificate, le analizezi și creezi hook-uri personalizate pentru outreach pe orice canal.",
  keywords:
    "outreach afaceri locale, găsit clienți freelancer, prospecting AI România, lead generation local",
  openGraph: {
    title: "LocalReach AI",
    description: "Outreach inteligent pentru piața românească",
    url: "https://localreach.ai",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className="dark">
      <body className="min-h-screen bg-[#080810] text-[#e2e2f0] antialiased">
        {children}
      </body>
    </html>
  );
}
