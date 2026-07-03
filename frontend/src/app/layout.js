import "./globals.css";
import Providers from "../components/Providers.jsx";
import Navbar from "../components/Navbar.jsx";
import MainLayout from "../components/MainLayout.jsx";
import Footer from "../components/Footer.jsx";

import React from 'react';

export const metadata = {
  title: "ZORTUNER - Premium 3D Printed Designs & Custom Prints",
  description:
    "Premium custom 3D printed models, high-definition collectibles, and home décor. Transform your ideas into reality with ZORTUNER.",
  keywords:
    "3D printing, custom 3D prints, collectibles, home decor, design marketplace, custom prototyping, India",
  openGraph: {
    title: "ZORTUNER - Premium 3D Printed Designs",
    description:
      "Transforming Ideas Into Reality with premium 3D printed creations.",
    type: "website",
    locale: "en_IN",
    url: "https://zortuner.com",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  const isAdminDomain = false; // Resolved on client instead for static export

  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col transition-colors duration-300 bg-window overflow-x-hidden relative">
        {/* Global Luxury Geometric Pattern */}
        <div className="fixed inset-0 z-[-1] opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, #0f172a 1.5px, transparent 0)', backgroundSize: '48px 48px' }} />
        <Providers>
          <React.Suspense fallback={null}>
            <Navbar isAdminDomain={isAdminDomain} />
          </React.Suspense>
          <MainLayout footer={<Footer />} isAdminDomain={isAdminDomain}>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
