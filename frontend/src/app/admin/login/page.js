"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, AlertCircle, Eye, EyeOff, Lock } from "lucide-react";
import { api } from "../../../lib/api.js";
import { useAuthStore } from "../../../store/authStore.js";

function AdminLoginContent() {
  const router = useRouter();
  const redirect = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get("redirect") || "/" : "/";

  const { login, logout, isAuthenticated, user, isLoading } = useAuthStore();

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isClient, setIsClient] = useState(false);
  
  const [step, setStep] = useState(1);
  const [authCode, setAuthCode] = useState("");
  const [tempAuthData, setTempAuthData] = useState(null);

  // Force logout immediately on mount so they always have to authenticate again
  useEffect(() => {
    setIsClient(true);
    logout();
  }, [logout]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await api.post("/auth/login", {
        email: adminEmail,
        password: adminPassword,
      });
      if (res.data.success) {
        if (res.data.user.role !== "admin") {
          setLoginError("Access denied. Admin credentials required.");
          return;
        }
        // Save auth data temporarily and move to 2FA step
        setTempAuthData({ user: res.data.user, token: res.data.token });
        setStep(2);
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || "Invalid admin credentials");
    }
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    setLoginError("");
    
    // Inbuilt 6-digit security code
    if (authCode === "999999") {
      login(tempAuthData.user, tempAuthData.token);
      router.push(redirect);
    } else {
      setLoginError("Invalid Security Code");
    }
  };

  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center p-4 fixed inset-0 z-[100]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-mono text-emerald-500 fixed inset-0 z-[100] overflow-hidden">
      {/* Background Matrix/Grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      {/* Intense pulsing glow behind the panel */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      <div className="w-full max-w-md border border-emerald-500/30 bg-black/90 p-10 shadow-[0_0_60px_rgba(16,185,129,0.2)] relative overflow-hidden backdrop-blur-xl rounded-sm">
        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20 z-10" />

        <div className="flex flex-col items-center mb-10 relative z-20 text-center">
          <div className="mb-4 p-3 bg-emerald-950/30 rounded-full border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Lock className="h-6 w-6 text-emerald-400" />
          </div>
          <h1 className="text-4xl font-black text-emerald-400 tracking-widest mb-1 uppercase drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" style={{ fontFamily: '"Eurostile Bold Extended", sans-serif' }}>
            ZORTUNER
          </h1>
          <p className="text-emerald-600/80 text-[10px] tracking-[0.3em] uppercase mt-1">
            Secure Network Access Protocol
          </p>
        </div>

        {loginError && (
          <div className="mb-6 border-l-2 border-red-500 bg-red-950/30 text-red-400 px-4 py-3 text-xs tracking-wider uppercase flex items-center gap-3">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        {step === 1 ? (
          <form
            onSubmit={handleAdminLogin}
            className="flex flex-col gap-6 relative z-20"
          >
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-emerald-600/80 uppercase tracking-widest">
                Terminal Identity
                <span className="block mt-1 text-emerald-700/60 text-[8px]">
                  USERNAME / EMAIL / NODE ID
                </span>
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-emerald-950/20 border-b border-emerald-800/50 px-3 py-2 text-sm text-emerald-400 outline-none focus:border-emerald-400 focus:bg-emerald-950/40 transition-colors placeholder-emerald-900/50"
                placeholder="root@layerly.net"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-emerald-600/80 uppercase tracking-widest">
                Secure Passcode
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className={`w-full bg-emerald-950/20 border-b border-emerald-800/50 px-3 py-2 pr-10 text-sm text-emerald-400 outline-none focus:border-emerald-400 focus:bg-emerald-950/40 transition-colors placeholder-emerald-900/50 ${!showPassword && adminPassword ? 'tracking-[0.3em]' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-700 hover:text-emerald-400 transition-colors cursor-pointer p-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full border border-emerald-500/50 bg-emerald-950/50 hover:bg-emerald-900/80 hover:border-emerald-400 text-emerald-400 uppercase tracking-widest text-xs font-bold py-4 transition-all cursor-pointer shadow-[inset_0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[inset_0_0_20px_rgba(16,185,129,0.3)] relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Shield className="h-3 w-3" />
                Authenticate
              </span>
            </button>

            <div className="text-center mt-4">
              <span className="text-[9px] text-emerald-700/50 uppercase tracking-[0.3em]">
                Encrypted Session (AES-256)
              </span>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleCodeSubmit}
            className="flex flex-col gap-6 relative z-20"
          >
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-emerald-600/80 uppercase tracking-widest text-center">
                Security Verification
                <span className="block mt-1 text-emerald-700/60 text-[8px]">
                  ENTER 6-DIGIT INBUILT AUTHORIZATION CODE
                </span>
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-emerald-950/20 border-b border-emerald-800/50 px-3 py-4 text-center text-2xl tracking-[1em] font-black text-emerald-400 outline-none focus:border-emerald-400 focus:bg-emerald-950/40 transition-colors placeholder-emerald-900/50"
                placeholder="------"
              />
            </div>

            <button
              type="submit"
              className="mt-6 w-full border border-emerald-500/50 bg-emerald-950/50 hover:bg-emerald-900/80 hover:border-emerald-400 text-emerald-400 uppercase tracking-widest text-xs font-bold py-4 transition-all cursor-pointer shadow-[inset_0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[inset_0_0_20px_rgba(16,185,129,0.3)] relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Shield className="h-3 w-3" />
                Verify Identity
              </span>
            </button>

            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="text-[9px] text-emerald-700 hover:text-emerald-500 transition-colors uppercase tracking-[0.3em] cursor-pointer"
              >
                ← Return to Primary Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex justify-center items-center p-4 fixed inset-0 z-[100]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}
