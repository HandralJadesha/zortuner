"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, User, ShieldCheck, Key, Phone, Eye, EyeOff } from "lucide-react";
import { api } from "../../lib/api.js";
import { useAuthStore } from "../../store/authStore.js";

// HMR trigger
function LoginContent() {
  const router = useRouter();
  const redirect = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get("redirect") || "/" : "/";
  const { login, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirect);
    }
  }, [isAuthenticated, redirect, router]);
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success) {
        login(res.data.user, res.data.token);
        router.push(redirect);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/signup", {
        name,
        email,
        password,
        contact,
      });
      if (res.data.success) {
        setOtpEmail(email);
        setSuccessMsg(res.data.message || "OTP sent successfully!");
        setActiveTab("otp");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/verify-otp", {
        email: otpEmail,
        code: otpCode,
      });
      if (res.data.success) {
        login(res.data.user, res.data.token);
        router.push(redirect);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP code");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full glass-panel border border-white/10 rounded-xl p-6 shadow-2xl flex flex-col gap-4 relative z-10">
      {" "}
      {activeTab !== "otp" ? (
        <div className="grid grid-cols-2 bg-slate-100 border border-slate-200 rounded-full p-1 text-center">
          {" "}
          <button
            onClick={() => {
              setActiveTab("login");
              setError(null);
            }}
            className={`rounded-full py-2 text-xs font-bold transition-all cursor-pointer ${activeTab === "login" ? "bg-primary text-white" : "text-slate-500 hover:text-slate-800"}`}
          >
            {" "}
            Sign In{" "}
          </button>{" "}
          <button
            onClick={() => {
              setActiveTab("register");
              setError(null);
            }}
            className={`rounded-full py-2 text-xs font-bold transition-all cursor-pointer ${activeTab === "register" ? "bg-primary text-white" : "text-slate-500 hover:text-slate-800"}`}
          >
            {" "}
            Register Account{" "}
          </button>{" "}
        </div>
      ) : (
        <div className="text-center">
          {" "}
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5 justify-center">
            {" "}
            <ShieldCheck className="h-5 w-5 text-accent animate-pulse" />{" "}
            <span>Verify Your Email</span>{" "}
          </h2>{" "}
          {successMsg && (
            <p className="text-emerald-400 text-xs mt-1.5">{successMsg}</p>
          )}{" "}
        </div>
      )}{" "}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-2.5 text-xs text-center font-medium">
          {" "}
          {error}{" "}
        </div>
      )}{" "}
      {activeTab === "login" && (
        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
          {" "}
          <div className="flex flex-col gap-1.5">
            {" "}
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Email Address
            </label>{" "}
            <div className="relative">
              {" "}
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-300 px-4 py-2.5 pl-10 text-sm text-slate-800 placeholder-slate-400 outline-none"
              />{" "}
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />{" "}
            </div>{" "}
          </div>{" "}
          <div className="flex flex-col gap-1.5">
            {" "}
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Password
            </label>{" "}
            <div className="relative">
              {" "}
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-300 px-4 py-2.5 pl-10 pr-10 text-sm text-slate-800 placeholder-slate-400 outline-none"
              />{" "}
              <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />{" "}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>{" "}
          </div>{" "}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-orange-500 hover:bg-orange-300 text-slate-900 font-bold py-3 text-sm hover:opacity-95 tracking-wider mt-4 cursor-pointer transition-all duration-300"
          >
            {" "}
            {loading ? "Signing In..." : "Sign In"}{" "}
          </button>{" "}
        </form>
      )}{" "}
      {activeTab === "register" && (
        <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-2.5">
          {" "}
          <div className="flex flex-col gap-1.5">
            {" "}
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Full Name
            </label>{" "}
            <div className="relative">
              {" "}
              <input
                type="text"
                required
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-300 px-4 py-2 pl-10 text-sm text-slate-800 placeholder-slate-400 outline-none"
              />{" "}
              <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />{" "}
            </div>{" "}
          </div>{" "}
          <div className="flex flex-col gap-1.5">
            {" "}
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Email Address
            </label>{" "}
            <div className="relative">
              {" "}
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-300 px-4 py-2 pl-10 text-sm text-slate-800 placeholder-slate-400 outline-none"
              />{" "}
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />{" "}
            </div>{" "}
          </div>{" "}
          <div className="flex flex-col gap-1.5">
            {" "}
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Password
            </label>{" "}
            <div className="relative">
              {" "}
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-300 px-4 py-2 pl-10 pr-10 text-sm text-slate-800 placeholder-slate-400 outline-none"
              />{" "}
              <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />{" "}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>{" "}
          </div>{" "}
          <div className="flex flex-col gap-1.5">
            {" "}
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Contact Number (Optional)
            </label>{" "}
            <div className="relative">
              {" "}
              <input
                type="tel"
                placeholder="Enter your contact number"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-300 px-4 py-2 pl-10 text-sm text-slate-800 placeholder-slate-400 outline-none"
              />{" "}
              <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />{" "}
            </div>{" "}
          </div>{" "}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-orange-500 hover:bg-orange-300 text-slate-900 font-bold py-2.5 text-sm hover:opacity-95 tracking-wider mt-2 cursor-pointer transition-all duration-300"
          >
            {" "}
            {loading ? "Creating Account..." : "Sign Up"}{" "}
          </button>{" "}
        </form>
      )}{" "}
      {activeTab === "otp" && (
        <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
          {" "}
          <p className="text-xs text-slate-400 text-center leading-relaxed font-light">
            {" "}
            We sent a 6-digit verification code to{" "}
            <span className="font-semibold text-slate-800">{otpEmail}</span>.
            Please enter it below.{" "}
          </p>{" "}
          <div className="flex flex-col gap-1.5 mt-2">
            {" "}
            <div className="relative">
              {" "}
              <input
                type="text"
                required
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-300 px-4 py-3.5 pl-10 text-sm text-slate-800 tracking-[0.2em] font-bold text-center placeholder-slate-400 outline-none"
              />{" "}
              <Key className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />{" "}
            </div>{" "}
          </div>{" "}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-orange-500 hover:bg-orange-300 text-slate-900 font-bold py-3 text-sm hover:opacity-95 tracking-wider mt-4 cursor-pointer transition-all duration-300"
          >
            {" "}
            {loading ? "Verifying Code..." : "Verify Code & Sign In"}{" "}
          </button>{" "}
          <button
            type="button"
            onClick={() => {
              setActiveTab("login");
              setError(null);
            }}
            className="text-xs text-slate-400 hover:text-slate-800 text-center mt-2 cursor-pointer"
          >
            {" "}
            Back to Login{" "}
          </button>{" "}
        </form>
      )}{" "}
    </div>
  );
}
export default function LoginPage() {
  return (
    <div className="relative grid grid-cols-1 md:grid-cols-2 h-screen w-full overflow-hidden bg-white">
      
      {/* Left Column: Branding / Footer Details Panel */}
      <div className="relative hidden md:flex flex-col justify-center items-center bg-orange-50 pt-24 p-8 md:px-12 lg:px-16 border-r border-orange-200 overflow-hidden">
        {/* Soft Background Ornaments */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-orange-400/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col justify-between items-center h-full w-full max-w-lg animate-in slide-in-from-left-8 duration-700">
          
          {/* Main Centered Content Wrapper */}
          <div className="flex flex-col items-center justify-center flex-grow w-full mt-4">
            {/* Logo */}
            <img 
              src="/images/logo.png" 
              alt="Zortuner Logo" 
              className="h-16 lg:h-24 w-auto mb-4 drop-shadow-xl" 
            />
            
            {/* Description */}
            <p className="text-slate-600 font-medium text-xs lg:text-sm leading-relaxed mb-6 max-w-sm text-center">
              Transforming digital ideas into physical realities with precision 3D printing. We design and manufacture high-detail figurines, decor, and structural models.
            </p>
            
            {/* Contact Information */}
            <div className="flex flex-col items-center text-center w-full max-w-xs bg-white/40 p-4 rounded-xl border border-white/60 shadow-sm backdrop-blur-sm">
              <h3 className="text-[10px] font-bold tracking-widest text-orange-500 uppercase mb-3">Contact & Location</h3>
              <ul className="space-y-3 text-xs font-bold text-slate-700 w-full">
                <li className="flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4 text-orange-500 opacity-80" />
                  <span>8884828247</span>
                </li>
                <li className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4 text-orange-500 opacity-80" />
                  <span>support@zortuner.com</span>
                </li>
                <li className="flex items-start justify-center gap-2 mt-2 leading-relaxed text-slate-500 font-medium">
                  E03 RNSIT Dr. Vishnuvardhan Road, Post, Channasandra, Rajarajeshwari Nagar, Bengaluru, Karnataka 560098
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom: Copyright & Social Placeholder */}
          <div className="border-t border-orange-200/50 pt-4 mt-4 flex justify-between items-center w-full text-[10px] font-bold tracking-widest uppercase text-slate-400">
            <span>&copy; {new Date().getFullYear()} Zortuner. Made in India.</span>
            <div className="flex gap-3">
               <a href="#" className="hover:text-orange-600 transition-colors">Privacy</a>
               <a href="#" className="hover:text-orange-600 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Column: Auth Forms */}
      <div className="relative flex items-center justify-center p-4 pt-24 md:px-8 md:pb-8 bg-slate-50 overflow-y-auto overflow-x-hidden h-full">
        {/* Subtle Geometric Dot Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.2]" 
             style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, #cbd5e1 1.5px, transparent 0)', backgroundSize: '32px 32px' }} />
             
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
        
        <div className="mx-auto w-full max-w-md relative z-10 animate-in slide-in-from-right-8 duration-700">
          <div className="md:hidden flex justify-center mb-8">
             <img src="/images/logo.png" alt="Zortuner Logo" className="h-12 w-auto drop-shadow-sm" />
          </div>
          <Suspense
            fallback={
              <div className="w-full glass-panel border border-white/10 rounded-xl p-8 flex justify-center py-8 text-slate-400 text-sm shadow-2xl">
                {" "}
                Loading authentication forms...{" "}
              </div>
            }
          >
            {" "}
            <LoginContent />{" "}
          </Suspense>{" "}
        </div>
      </div>
    </div>
  );
}
