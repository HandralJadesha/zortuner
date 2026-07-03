"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function MainLayout({ children, footer, isAdminDomain }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/" && !isAdminDomain;
  const isOrderDetailsPage = pathname.includes("/admin/orders/");
  const isLoginPage = pathname === "/login";

  if (isOrderDetailsPage || isLoginPage) {
    return (
      <main className="h-screen w-full overflow-hidden transition-colors duration-300 bg-window">
        {children}
      </main>
    );
  }

  if (isLandingPage) {
    return (
      <main className="flex-grow pt-0 flex flex-col min-h-screen transition-colors duration-300 bg-window">
        {children}
        {footer}
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-window">
      <div className="flex-grow mx-auto w-full flex flex-col relative pt-24 transition-colors duration-300 bg-container">
        <main className="flex-grow w-full">{children}</main>
        <div className="mt-auto px-4 sm:px-6 lg:px-8">{footer}</div>
      </div>
    </div>
  );
}
