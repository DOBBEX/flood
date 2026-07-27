import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BottomNav } from "@/components/navigation/BottomNav";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Smart Dam Flood Detection System",
  description: "A software simulation dashboard for the Smart Dam Flood Detection System. Monitor water levels, rain sensors, and system states in real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0f0f12] text-slate-50 relative selection:bg-zinc-700/50 selection:text-white">
        <main className="flex-1 relative z-10 w-full pb-32">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
