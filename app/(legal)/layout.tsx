import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#080810] pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">{children}</div>
      </main>
      <Footer />
    </>
  );
}
