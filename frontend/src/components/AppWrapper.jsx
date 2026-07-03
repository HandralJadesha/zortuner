"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AppWrapper({ children }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  useEffect(() => {
    if (!isLandingPage) {
      document.body.style.overflow = "hidden";
      document.body.style.backgroundColor = "#e2e8f0"; // slate-200
    } else {
      document.body.style.overflow = "auto";
      document.body.style.backgroundColor = "";
    }
  }, [isLandingPage]);

  if (isLandingPage) {
    return <div className="min-h-screen flex flex-col">{children}</div>;
  }

  return (
    <div className="h-[100dvh] w-screen p-2 sm:p-3 overflow-hidden bg-slate-200">
      <div className="h-full w-full bg-[#fafafa] rounded-xl border border-slate-300 shadow-2xl overflow-y-auto overflow-x-hidden relative flex flex-col transform-gpu">
        {children}
      </div>
    </div>
  );
}
