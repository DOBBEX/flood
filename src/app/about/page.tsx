"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/settings");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-zinc-400 text-sm font-semibold">
      Redirecting to System Settings & Architecture...
    </div>
  );
}
