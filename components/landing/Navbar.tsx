"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#080810]/90 backdrop-blur-md border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 font-syne font-bold text-lg">
          <span className="text-white">Local</span>
          <span className="text-[#6366f1]">Reach</span>
          <sup className="text-[#a3e635] text-[10px] font-bold ml-0.5 -mt-2">AI</sup>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {[
            ["Funcționalități", "#features"],
            ["Prețuri", "#pricing"],
            ["Cum funcționează", "#how-it-works"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="text-sm text-[#6b7280] hover:text-white transition-colors"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm text-[#6b7280] hover:text-white transition-colors">
            Intră în cont
          </Link>
          <Link
            href="/signup?ref=prelaunch"
            className="text-sm bg-[#6366f1] hover:bg-[#4f46e5] text-white px-4 py-2 rounded-full font-medium transition-all hover:scale-105"
          >
            Înregistrează-te pentru lansare
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-white p-1" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-[#0f0f18]/95 backdrop-blur-lg border-b border-white/5 px-4 pb-6 pt-2 space-y-4">
          {[
            ["Funcționalități", "#features"],
            ["Prețuri", "#pricing"],
            ["Cum funcționează", "#how-it-works"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block text-sm text-[#6b7280] hover:text-white py-1.5"
            >
              {label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
            <Link href="/login" className="text-sm text-[#6b7280] hover:text-white py-1.5">
              Intră în cont
            </Link>
            <Link
              href="/signup?ref=prelaunch"
              className="text-sm bg-[#6366f1] text-white px-4 py-2.5 rounded-full font-medium text-center"
            >
              Înregistrează-te pentru lansare
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
