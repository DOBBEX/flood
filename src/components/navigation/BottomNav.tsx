"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShieldAlert, BellRing, Activity, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function BottomNav() {
  const pathname = usePathname();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navRef = useRef<HTMLElement>(null);

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Safety", href: "/protocols", icon: ShieldAlert },
    { name: "Alerts", href: "/alerts", icon: BellRing },
    { name: "History", href: "/history", icon: Activity },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const activeIndex = navItems.findIndex((item) => item.href === pathname);

  useEffect(() => {
    if (navRef.current && activeIndex !== -1) {
      // The first child is the indicator div, so the link is at activeIndex + 1
      const activeEl = navRef.current.children[activeIndex + 1] as HTMLElement;
      if (activeEl) {
        setIndicatorStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
          opacity: 1
        });
      }
    }
  }, [activeIndex, pathname]);

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto select-none px-2">
      <nav ref={navRef} className="relative flex items-center gap-1 bg-[#1a1c23]/60 backdrop-blur-2xl border border-white/5 rounded-full p-2 shadow-2xl">
        
        {/* Animated Background Indicator */}
        <div 
          className="absolute top-2 bottom-2 transition-all duration-500 ease-out flex items-center justify-center pointer-events-none"
          style={{ left: indicatorStyle.left, width: indicatorStyle.width, opacity: indicatorStyle.opacity }}
        >
          <div className="nav-water-indicator" />
        </div>

        {navItems.map((item) => {
          const isActive = item.href === pathname;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-14 sm:w-16 h-12 group rounded-full z-10 transition-colors duration-300 ${
                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <div className="relative z-10 flex flex-col items-center space-y-1 mt-0.5">
                <Icon
                  strokeWidth={2}
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isActive ? "scale-110" : "group-hover:scale-105"
                  }`}
                />
                <span className={`text-[10px] font-semibold tracking-wide transition-colors duration-300 ${isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"}`}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
