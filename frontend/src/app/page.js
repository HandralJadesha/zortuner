"use client";
import React, { useState } from "react";
import { Printer, Cpu, Rocket, Shield, Loader2, Lock } from "lucide-react";
import { api } from "../lib/api.js";
import { useAuthStore } from "../store/authStore.js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import CinematicHero from "../components/CinematicHero.jsx";
import ProductShowcase from "../components/ProductShowcase.jsx";
import CategoryGrid from "../components/CategoryGrid.jsx";
export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [contactForm, setContactForm] = useState({ subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      await api.post("/support/tickets", contactForm);
      setSubmitStatus("success");
      setContactForm({ subject: "", message: "" });
    } catch (err) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full bg-window min-h-screen selection:bg-primary/20">
      {" "}
      <CinematicHero />{" "}
      <div className="relative z-10 grid-bg">
        {" "}
        <CategoryGrid /> <ProductShowcase />{" "}
        <motion.section
          id="about"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="pt-4 pb-16 md:pt-8 md:pb-24 w-full mx-0 px-4 sm:px-6 lg:px-8 relative overflow-hidden z-10 bg-container m-0 flex flex-col justify-center border-b border-slate-200"
        >
          {/* Luxury Background Ornaments */}
          <div className="absolute top-[10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-slate-800/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-orange-500/15 blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {" "}
            <div className="text-center max-w-3xl mx-auto mb-10">
              {" "}
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {" "}
                Why Choose Zortuner?{" "}
              </h2>{" "}
              <p className="mt-3 text-slate-600 font-light text-base">
                {" "}
                We combine modern additive manufacturing with traditional
                artistic finishes to deliver unparalleled quality.{" "}
              </p>{" "}
            </div>{" "}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {" "}
              {[
                {
                  icon: <Printer className="h-8 w-8 text-accent" />,
                  title: "Precision Printing",
                  desc: "Micron-level accuracy using custom industrial FDM and SLA resin equipment.",
                },
                {
                  icon: <Cpu className="h-8 w-8 text-primary" />,
                  title: "Premium PLA Filaments",
                  desc: "High durability, plant-based materials offering an environmentally conscious alternative.",
                },
                {
                  icon: <Rocket className="h-8 w-8 text-secondary" />,
                  title: "Fast Shipping",
                  desc: "Insured post-dispatch packaging with rapid express deliveries across India.",
                },
                {
                  icon: <Shield className="h-8 w-8 text-accent" />,
                  title: "Custom Finishes",
                  desc: "Hand-finished, sanded, and painted variants tailored to your reference models.",
                },
              ].map((prop, idx) => (
                <div
                  key={idx}
                  className="glass-panel rounded-xl p-6 flex flex-col gap-4 hover-glow bg-white shadow-sm border border-slate-200"
                >
                  {" "}
                  <div className="rounded-lg bg-slate-50 w-fit p-4 shadow-inner border border-slate-100">
                    {" "}
                    {prop.icon}{" "}
                  </div>{" "}
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    {prop.title}
                  </h3>{" "}
                  <p className="text-slate-600 font-light leading-relaxed">
                    {prop.desc}
                  </p>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </div>{" "}
        </motion.section>{" "}
        <motion.section
          id="contact"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="pt-4 pb-16 mb-8 w-full mx-0 px-4 sm:px-6 lg:px-8 relative z-10 bg-container m-0 flex flex-col justify-center border-b border-slate-200 overflow-hidden"
        >
          {" "}
          {/* Luxury Background Ornaments */}
          <div className="absolute -top-[5%] right-[10%] h-[400px] w-[400px] rounded-full bg-orange-500/10 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] h-[700px] w-[700px] rounded-full bg-slate-900/10 blur-[150px] pointer-events-none" />
          <div className="text-center max-w-3xl mx-auto mb-6 relative z-20">
            {" "}
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {" "}
              Contact Zortuner{" "}
            </h2>{" "}
            <p className="mt-3 text-slate-600 font-light text-base">
              {" "}
              Have questions about custom prints, materials, scaling, or bulk
              orders? Speak directly to our artisans.{" "}
            </p>{" "}
          </div>{" "}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {" "}
            <div className="lg:col-span-5 flex flex-col gap-4 h-full">
              {" "}
              <div className="glass-panel rounded-xl p-6 flex flex-col gap-4 bg-white shadow-sm border border-slate-200 h-full">
                {" "}
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Our Workshop Details
                </h3>{" "}
                <div className="flex flex-col gap-4 text-slate-600">
                  {" "}
                  <div>
                    {" "}
                    <span className="font-bold text-slate-400 block text-xs uppercase tracking-wider mb-1.5">
                      Office Address
                    </span>{" "}
                    <p className="font-light text-base text-slate-800">
                      E03 RNSIT Dr. Vishnuvardhan Road, Post, Channasandra, Rajarajeshwari Nagar, Bengaluru, Karnataka 560098
                    </p>{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <span className="font-bold text-slate-400 block text-xs uppercase tracking-wider mb-1.5">
                      Email Inquiry
                    </span>{" "}
                    <p className="font-light text-base text-primary hover:text-accent transition-colors cursor-pointer">
                      support@zortuner.com
                    </p>{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <span className="font-bold text-slate-400 block text-xs uppercase tracking-wider mb-1.5">
                      Phone Helpline
                    </span>{" "}
                    <p className="font-light text-base text-slate-800">
                      8884828247
                    </p>{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <span className="font-bold text-slate-400 block text-xs uppercase tracking-wider mb-1.5">
                      Operational Hours
                    </span>{" "}
                    <p className="font-light text-base text-slate-800">
                      Monday - Saturday: 9:00 AM - 6:00 PM IST
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <div className="lg:col-span-7 h-full">
              {" "}
              <form
                onSubmit={handleContactSubmit}
                className="glass-panel rounded-xl p-6 flex flex-col gap-3 bg-white shadow-sm border border-slate-200 h-full"
              >
                {" "}
                  <div className="flex flex-col gap-1.5">
                    {" "}
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Subject Inquiry
                    </label>{" "}
                    <input
                      type="text"
                      required
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      placeholder="Bulk order pricing / custom 3D scale..."
                      className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-primary/60 transition-all focus:bg-white shadow-inner"
                    />{" "}
                  </div>{" "}
                  <div className="flex flex-col gap-1.5 flex-grow">
                    {" "}
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Detailed Message
                    </label>{" "}
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Describe your design scale, specifications, or query..."
                      className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none resize-none focus:border-primary/60 transition-all focus:bg-white shadow-inner h-full min-h-[120px]"
                    />{" "}
                  </div>{" "}
                  {submitStatus === "success" && (
                    <p className="text-sm text-emerald-600 font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-center">
                      Message sent successfully! We will get back to you soon.
                    </p>
                  )}
                  {submitStatus === "error" && (
                    <p className="text-sm text-red-600 font-bold bg-red-50 p-3 rounded-xl border border-red-100 text-center">
                      Failed to send message. Please try again.
                    </p>
                  )}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-300 text-slate-900 font-bold py-2.5 px-8 mx-auto w-fit text-sm tracking-wider mt-2 hover:transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {" "}
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Message to Zortuner"}
                  </motion.button>{" "}
                </form>
            </div>{" "}
          </div>{" "}
        </motion.section>{" "}
      </div>{" "}
    </div>
  );
}
