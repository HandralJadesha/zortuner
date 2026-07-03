"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore.js";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  {
    name: "Home Decor",
    slug: "home-decor",
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Desk Accessories",
    slug: "desk-accessories",
    image:
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Miniatures",
    slug: "miniatures",
    image:
      "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Custom Gifts",
    slug: "personalized-gifts",
    image:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Gaming Accessories",
    slug: "gaming-accessories",
    image:
      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Educational Models",
    slug: "educational-models",
    image:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Anime Figures",
    slug: "anime-figures",
    image:
      "https://images.unsplash.com/photo-1606660265514-358ebbadc80d?auto=format&fit=crop&w=600&q=80",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function CategoryGrid() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  return (
    <section
      id="categories"
      className="pt-4 pb-8 md:pt-8 md:pb-8 w-full mx-0 px-4 sm:px-6 lg:px-8 relative overflow-hidden z-10 bg-container m-0 flex flex-col justify-center"
    >
      {/* Luxury Background Ornaments */}
      <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute left-[10%] bottom-0 h-[600px] w-[600px] rounded-full bg-slate-900/15 blur-[120px] pointer-events-none" />

      <div className="text-center w-full max-w-5xl mx-auto mb-12 relative z-20">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Explore by Category
        </h2>
        <p className="mt-2 text-slate-600 font-light text-base">
          Find exactly what you need from our extensive collection of
          specialized 3D prints.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-20"
      >
        {CATEGORIES.map((cat, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <Link
              href={`/shop?category=${cat.slug}`}
              className="block relative h-56 rounded-xl overflow-hidden group glass-panel border border-slate-200 hover-glow"
            >
              <div className="absolute inset-0 bg-orange-100">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1 opacity-50 group-hover:opacity-30"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-orange-200/90 via-orange-100/40 to-transparent" />

              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <h3 className="text-2xl font-bold text-orange-950 text-center tracking-wide">
                  {cat.name}
                </h3>
                <span className="mt-4 text-sm font-bold tracking-wider uppercase text-orange-600 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300">
                  Explore Collection &rarr;
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
