"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const stats = [
  { value: 3, suffix: "%", label: "Rată răspuns", sub: "outreach generic" },
  { value: 27, suffix: "%", label: "Rată răspuns", sub: "outreach personalizat" },
  { value: 4, suffix: "h", label: "Timp pierdut zilnic", sub: "prospecting manual" },
  { value: 90, suffix: "%", label: "Afaceri locale", sub: "fără strategie digitală" },
];

export default function StatsBar() {
  return (
    <section className="bg-[#0a0a14] border-y border-white/5 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-white/5">
          {stats.map((s, i) => (
            <div key={i} className="px-8 py-4 text-center">
              <p className="font-syne font-bold text-4xl text-white">
                <Counter target={s.value} suffix={s.suffix} />
              </p>
              <p className="text-sm font-medium text-white/70 mt-1">{s.label}</p>
              <p className="text-xs text-[#6b7280] mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
