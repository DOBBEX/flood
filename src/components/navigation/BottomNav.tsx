"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShieldAlert, AlertTriangle, FileText, Settings } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Protocols", href: "/protocols", icon: ShieldAlert },
    { name: "Alerts", href: "/alerts", icon: AlertTriangle },
    { name: "History", href: "/history", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto select-none">
      <nav className="flex items-center space-x-1.5 bg-[#18181c]/95 backdrop-blur-2xl border border-white/15 rounded-full px-3.5 py-2 shadow-2xl relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-[68px] sm:w-[76px] h-[52px] group transition-all duration-300 rounded-full ${
                isActive
                  ? "bg-zinc-800 text-white border border-zinc-600/60 shadow-md scale-[1.03]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
              }`}
            >
              <Icon
                strokeWidth={1.75}
                className={`w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] mb-1 z-10 transition-transform duration-300 ${
                  isActive ? "scale-105 text-white" : "group-hover:scale-110 text-zinc-400"
                }`}
              />
              <span
                className={`text-[10px] font-bold tracking-wide z-10 transition-colors duration-300 ${
                  isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
