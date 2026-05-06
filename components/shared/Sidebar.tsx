"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  History,
  Settings,
  LogOut,
  Target,
  CalendarClock,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/campaigns", label: "Campanii", icon: Megaphone },
  { href: "/prospects", label: "Prospecți", icon: Users },
  { href: "/history", label: "Istoric CRM", icon: History },
  { href: "/follow-ups", label: "Follow-up", icon: CalendarClock },
  { href: "/settings", label: "Setări", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-56 min-h-screen bg-[#16161d] border-r border-[#2a2a3d] flex flex-col">
      <div className="p-4 border-b border-[#2a2a3d]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#6366f1] rounded-lg flex items-center justify-center shrink-0">
            <Target size={16} className="text-white" />
          </div>
          <span className="font-bold text-[#e2e2f0] text-sm leading-tight">
            LocalReach <span className="text-[#6366f1]">AI</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-[#6366f1]/15 text-[#6366f1] font-medium"
                  : "text-[#6b7280] hover:text-[#e2e2f0] hover:bg-[#1c1c26]"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#2a2a3d]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#6b7280] hover:text-[#ef4444] hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={16} />
          Deconectare
        </button>
      </div>
    </aside>
  );
}
