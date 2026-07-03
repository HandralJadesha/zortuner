"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
const VIDEO = "/videos/NweHero.mp4";
export default function CinematicHero() {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    /* Generate particle styles on client to avoid hydration mismatch and purity errors */
    const generatedParticles = Array.from({ length: 40 }).map(() => ({
      width: Math.random() * 6 + 1 + "px",
      height: Math.random() * 6 + 1 + "px",
      top: Math.random() * 100 + "%",
      left: Math.random() * 100 + "%",
      animation: `float ${Math.random() * 10 + 5}s ease-in-out infinite`,
      animationDelay: `-${Math.random() * 5}s`,
    }));
    setTimeout(() => setParticles(generatedParticles), 0);
  }, []);
  return (
    <section
      id="home"
      className="relative w-full min-h-[85vh] lg:min-h-0 lg:aspect-video mx-0 mt-0 mb-0 overflow-hidden bg-slate-900 flex items-center justify-start pt-20 lg:pt-0"
    >
      {" "}
      {/* Background with continuous slow zoom/pan */}{" "}
      <div className="absolute inset-0 z-0">
        {" "}
        <video
          src={VIDEO}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center"
        />{" "}
      </div>{" "}
      {/* No dark overlays to keep video in raw, pure color */}{" "}
      {/* CSS Particles Simulation (Floating Elements) */}{" "}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {" "}
        {particles.map((style, i) => (
          <div
            key={i}
            className="absolute bg-primary rounded-full opacity-30 shadow-[0_0_10px_rgba(44,0,102,0.5)]"
            style={style}
          />
        ))}{" "}
      </div>{" "}
      {/* Hero Content */}{" "}
      <div className="relative z-20 flex flex-col items-start text-left max-w-3xl px-8 sm:px-16 lg:px-24 mt-16">
        {" "}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {" "}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-fortuner italic uppercase tracking-wider text-slate-900 leading-tight drop-shadow-sm">
            {" "}
            Transforming Ideas Into <br />{" "}
            <span className="text-slate-900">Reality Through 3D Printing</span>{" "}
          </h1>{" "}
        </motion.div>{" "}
        <motion.p
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-5 text-base sm:text-lg text-orange-500 font-bold max-w-lg drop-shadow-sm"
        >
          {" "}
          Premium custom-designed and ready-to-buy 3D printed creations crafted
          with precision.{" "}
        </motion.p>{" "}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          {" "}
          <Link
            href="/shop"
            className="rounded-full bg-orange-500 hover:bg-orange-300 hover:from-secondary hover:to-primary px-8 py-4 text-sm font-bold tracking-wider text-slate-900  hover:scale-105 active:scale-95 transition-all cursor-pointer text-center hover:"
          >
            {" "}
            Shop Collection{" "}
          </Link>{" "}
          <Link
            href="#categories"
            className="rounded-full bg-white/50 backdrop-blur-md border border-slate-200 px-8 py-4 text-sm font-bold tracking-wider text-slate-900 hover:bg-white/80 hover:scale-105 active:scale-95 transition-all cursor-pointer text-center"
          >
            {" "}
            Explore Categories{" "}
          </Link>{" "}
        </motion.div>{" "}
      </div>{" "}
    </section>
  );
}
