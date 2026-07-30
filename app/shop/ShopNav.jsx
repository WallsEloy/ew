"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    name: "Arte",
    href: "/shop?tab=arte",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    name: "Software",
    href: "/shop?tab=software",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    name: "Drop",
    href: "/shop?tab=drop",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    name: "Ropa",
    href: "/shop?tab=ropa",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46L16 2a8 8 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
      </svg>
    ),
  },
  {
    name: "Premium",
    href: "/shop?tab=premium",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4h20l-2 16H4L2 4z" />
        <path d="M12 4l-4 6 4 10 4-10-4-6z" />
        <path d="M4 10h16" />
      </svg>
    ),
  },
];

export default function ShopNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-[70px] md:top-[85px] z-[90] w-full flex justify-center px-4 mb-4">
      <nav className="flex items-center gap-2 md:gap-4 p-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const isActive = false; // We can check searchParams or path for active state later
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 px-3 md:px-5 py-2 rounded-full transition-all duration-300 ${
                isActive 
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]" 
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
              title={item.name}
            >
              <span className={`${isActive ? "text-black" : "text-current"}`}>
                {item.icon}
              </span>
              <span className={`text-sm font-semibold tracking-wide hidden md:block`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
