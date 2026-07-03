"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "../store/authStore.js";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  {
    name: "Home Decor",
    slug: "home-decor",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
    count: 24,
  },
  {
    name: "Anime Figures",
    slug: "anime-figures",
    image:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
    count: 15,
  },
  {
    name: "Gaming Accessories",
    slug: "gaming-accessories",
    image:
      "https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?auto=format&fit=crop&w=800&q=80",
    count: 32,
  },
  {
    name: "Desk Accessories",
    slug: "desk-accessories",
    image:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80",
    count: 18,
  },
  {
    name: "Lamps & Lighting",
    slug: "lamps-lighting",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    count: 10,
  },
  {
    name: "Personalized Gifts",
    slug: "personalized-gifts",
    image:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
    count: 22,
  },
  {
    name: "3D Printers",
    slug: "3d-printers",
    image:
      "https://store.bblcdn.com/s7/default/c2d75be87c2946dba3ab5074fb4afe78/P2S_Combo.jpg",
    count: 4,
  },
  {
    name: "Filaments",
    slug: "filaments",
    image:
      "https://store.bblcdn.com/s7/default/f00291f9a7464d948b9f28fad351932c/White.jpg",
    count: 4,
  },
];

export default function CategoryCarousel() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(
      () =>
        setCurrentIndex((prevIndex) =>
          prevIndex === CATEGORIES.length - 1 ? 0 : prevIndex + 1,
        ),
      1500,
    );

    return () => {
      resetTimeout();
    };
  }, [currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? CATEGORIES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === CATEGORIES.length - 1 ? 0 : prev + 1));
  };

  const getVisibleCategories = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const idx = (currentIndex + i) % CATEGORIES.length;
      visible.push(CATEGORIES[idx]);
    }
    return visible;
  };

  return (
    <div className="relative w-full overflow-hidden py-6">
      <div className="flex gap-6 justify-center items-center px-4 md:px-12">
        <button
          onClick={handlePrev}
          className="rounded-full bg-slate-900/80 p-3 text-white border border-white/10 hover:bg-primary transition-all cursor-pointer z-10 hidden sm:block"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          <AnimatePresence mode="popLayout">
            {getVisibleCategories().map((cat, idx) => (
              <motion.div
                key={cat.slug + idx}
                layout
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="group relative h-80 rounded-lg overflow-hidden glass-panel border border-white/10 hover-glow cursor-pointer"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${cat.image})` }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />

                <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-1">
                  <span className="text-xs font-semibold tracking-wider text-accent uppercase">
                    {cat.count} Items
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight leading-tight">
                    {cat.name}
                  </h3>
                  <Link
                    href={`/shop?category=${cat.slug}`}
                    className="mt-2 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1 group-hover:underline"
                  >
                    View Collection &rarr;
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <button
          onClick={handleNext}
          className="rounded-full bg-slate-900/80 p-3 text-white border border-white/10 hover:bg-primary transition-all cursor-pointer z-10 hidden sm:block"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="flex justify-center gap-2 mt-8">
        {CATEGORIES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              idx === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-slate-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
