"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  Menu,
  X,
  Cpu,
  Layers,
  Sun,
  Moon
} from "lucide-react";
import { useAuthStore } from "../store/authStore.js";
import { useCartStore } from "../store/cartStore.js";
import { useWishlistStore } from "../store/wishlistStore.js";
import { api } from "../lib/api.js";

export default function Navbar({ isAdminDomain }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLandingPage = pathname === "/" && !isAdminDomain;
  const [searchQuery, setSearchQuery] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout, initialize: initAuth } = useAuthStore();
  const { items: cartItems, initializeCart } = useCartStore();
  const { products: wishlistItems, initializeWishlist } = useWishlistStore();
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    initAuth();
    initializeCart();
    initializeWishlist();
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [initAuth, initializeCart, initializeWishlist]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (pathname === "/shop") {
      setSearchQuery(q || "");
    } else {
      setSearchQuery("");
    }
  }, [searchParams, pathname]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setRecommendations([]);
      setShowRecommendations(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      api.get(`/products?limit=5&search=${encodeURIComponent(searchQuery.trim())}`)
        .then(res => {
          if (res.data.success) {
            setRecommendations(res.data.products);
            setShowRecommendations(true);
          }
        })
        .catch(err => console.error("Error fetching recommendations:", err));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setShowRecommendations(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  if (pathname.includes("/admin/orders/")) {
    return null;
  }

  const isDarkNav = false;
  const linkClass = "text-black";
  const iconClass = "text-black";
  const logoTextClass = "text-slate-900";
  return (
    <nav
      className={`fixed left-0 right-0 z-50 transition-all duration-300 w-full flex justify-center top-0 px-0`}
    >
      {" "}
      <div
        className={`mx-auto w-full transition-all duration-[400ms] ease-in-out ${isMobileMenuOpen ? "max-w-full py-2 px-4 sm:px-6 lg:px-8 bg-white shadow-xl border-b border-slate-200/80" : isScrolled ? "max-w-full py-2 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/50" : "max-w-full py-2 px-4 sm:px-6 lg:px-8 bg-white shadow-sm border-b border-slate-200/80"}`}
      >
        {" "}
        <div className="flex h-14 items-center justify-between w-full gap-4 xl:gap-8">
          {" "}
          {/* Left: Logo */}{" "}
          <div className="flex-1 flex items-center justify-start shrink-0 z-10">
            {" "}
            <Link href="/" className="flex items-center gap-2 group">
              {" "}
              <img
                src="/images/logo.png"
                alt="ZORTUNER Logo"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />{" "}
              <span
                className={`text-xl font-bold tracking-tight group- hidden sm:block ${logoTextClass}`} style={{ fontFamily: "\"Eurostile Bold Extended\", sans-serif" }}
              >
                {" "}
                ZORTUNER{" "}
              </span>{" "}
            </Link>{" "}
          </div>{" "}
          {/* Center: Links (Hidden on tablet/mobile, visible on lg screens) */}{" "}
          <div className="hidden lg:flex flex-none items-center justify-center gap-8 z-0">
            {" "}
            <Link
              href="/#home"
              className={`text-sm font-medium hover:scale-110 transition-all duration-300 ${linkClass}`}
            >
              {" "}
              Home{" "}
            </Link>{" "}
            <Link
              href="/#categories"
              className={`text-sm font-medium hover:scale-110 transition-all duration-300 ${linkClass}`}
            >
              {" "}
              Categories{" "}
            </Link>{" "}
            <Link
              href="/#featured"
              className={`text-sm font-medium hover:scale-110 transition-all duration-300 ${linkClass}`}
            >
              {" "}
              Featured{" "}
            </Link>{" "}
            <Link
              href="/custom-print"
              className={`text-sm font-medium hover:scale-110 transition-all duration-300 flex items-center gap-1 whitespace-nowrap ${linkClass}`}
            >
              {" "}
              <Layers className="h-3.5 w-3.5" /> Custom Orders{" "}
            </Link>{" "}
            <Link
              href="/#about"
              className={`text-sm font-medium hover:scale-110 transition-all duration-300 ${linkClass}`}
            >
              {" "}
              About Us{" "}
            </Link>{" "}
            <Link
              href="/#contact"
              className={`text-sm font-medium hover:scale-110 transition-all duration-300 ${linkClass}`}
            >
              {" "}
              Contact{" "}
            </Link>{" "}
          </div>{" "}
          {/* Right: Search & Icons */}{" "}
          <div className="flex-1 flex items-center justify-end gap-3 sm:gap-4 shrink-0 z-10">
            {" "}
            {/* If on tablet, show links here instead of center so they fit */}{" "}
            <div className="hidden md:flex lg:hidden items-center gap-4 mr-2">
              {" "}
              <Link
                href="/#home"
                className={`text-sm font-medium hover:scale-110 transition-all duration-300 ${linkClass}`}
              >
                Home
              </Link>{" "}
              <Link
                href="/custom-print"
                className={`text-sm font-medium hover:scale-110 transition-all duration-300 ${linkClass}`}
              >
                Custom
              </Link>{" "}
            </div>{" "}
            <div className="hidden lg:flex w-10 h-10 hover:w-[18rem] focus-within:w-[18rem] transition-all duration-500 ease-out relative group">
              <form onSubmit={handleSearch} className="relative w-full h-full flex items-center bg-slate-100 rounded-full border border-slate-200 group-hover:border-primary/50 group-focus-within:border-primary/50 group-hover:bg-white group-focus-within:bg-white transition-all duration-300 overflow-hidden shadow-sm">
                <input
                  type="text"
                  placeholder="Search designs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if(searchQuery.trim().length > 0) setShowRecommendations(true); }}
                  onBlur={() => setTimeout(() => setShowRecommendations(false), 200)}
                  className="w-full h-full bg-transparent pl-4 pr-10 text-sm text-slate-800 placeholder-slate-400 outline-none opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 w-10 h-10 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors cursor-pointer bg-transparent"
                >
                  <Search className="h-5 w-5" />
                </button>
              </form>
              {showRecommendations && searchQuery.trim().length > 0 && (
                <div onMouseDown={(e) => e.preventDefault()} className="absolute top-full mt-2 w-full min-w-[20rem] right-0 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
                  {recommendations.length > 0 ? (
                    <>
                      {recommendations.map(product => (
                        <Link
                          key={product._id}
                          href={`/shop/${product.slug}`}
                          className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                          onClick={() => setShowRecommendations(false)}
                        >
                          <img src={product.images?.[0] || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=40&q=80"} alt={product.title} className="w-10 h-10 object-cover rounded-md" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-800 line-clamp-1">{product.title}</span>
                            <span className="text-xs font-bold text-primary">₹{product.discountPrice || product.basePrice}</span>
                          </div>
                        </Link>
                      ))}
                      <button type="button" onClick={handleSearch} className="w-full text-center p-2 text-xs text-primary font-bold hover:bg-slate-50 transition-colors border-t border-slate-100 cursor-pointer">
                        View all results
                      </button>
                    </>
                  ) : (
                    <div className="p-4 text-center text-sm text-slate-500">
                      No products found
                    </div>
                  )}
                </div>
              )}
            </div>{" "}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              {" "}
              <Link
                href="/wishlist"
                className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 transition-all"
              >
                {" "}
                <Heart className="h-5 w-5" />{" "}
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white animate-pulse">
                    {" "}
                    {wishlistCount}{" "}
                  </span>
                )}{" "}
              </Link>{" "}
              {false && <Link
                href="/cart"
                className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 transition-all"
              >
                {" "}
                <ShoppingBag className="h-5 w-5" />{" "}
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white transition-all duration-300">
                    {" "}
                    {cartCount}{" "}
                  </span>
                )}{" "}
              </Link>}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  {" "}
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1.5 hover:bg-emerald-200 transition-all cursor-pointer"
                  >
                    {" "}
                    <User className="h-4 w-4 text-emerald-800" />{" "}
                    <span className="text-xs font-bold text-emerald-800">
                      {user.name.split(" ")[0]}
                    </span>{" "}
                  </button>{" "}
                  <div className={`absolute right-0 mt-2 w-48 origin-top-right rounded-xl glass-panel p-2 shadow-2xl ring-1 ring-black/5 transition-all duration-200 bg-white ${isUserMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                    {" "}
                    <Link
                      href={user.role === "admin" ? "/admin" : "/dashboard"}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 transition-all"
                    >
                      {" "}
                      Dashboard{" "}
                    </Link>{" "}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left block rounded-lg px-4 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
                    >
                      {" "}
                      Sign Out{" "}
                    </button>{" "}
                  </div>{" "}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="whitespace-nowrap rounded-full bg-orange-500 hover:bg-orange-300 px-5 py-2 text-xs font-semibold tracking-wider text-slate-800  transition-all ml-1 transition-all duration-300"
                >
                  {" "}
                  Sign In{" "}
                </Link>
              )}{" "}
            </div>{" "}
            {/* Mobile toggles */}{" "}
            <div className="flex md:hidden items-center gap-2">
              {" "}
              {false && <Link
                href="/cart"
                className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 transition-all"
              >
                {" "}
                <ShoppingBag className="h-5 w-5" />{" "}
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white transition-all duration-300">
                    {" "}
                    {cartCount}{" "}
                  </span>
                )}{" "}
              </Link>}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-full p-2 text-slate-600 hover:bg-slate-100 transition-all"
              >
                {" "}
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div
          className={`md:hidden flex flex-col overflow-hidden transition-all duration-300 ease-in-out bg-white rounded-lg ${isMobileMenuOpen ? "max-h-[36rem] opacity-100 mt-4 pb-2 border border-slate-200 p-4 shadow-xl" : "max-h-0 opacity-0"}`}
        >
          {" "}
          <div className="relative w-full mb-4">
            <form onSubmit={handleSearch} className="relative w-full">
              {" "}
              <input
                type="text"
                placeholder="Search premium 3D designs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if(searchQuery.trim().length > 0) setShowRecommendations(true); }}
                onBlur={() => setTimeout(() => setShowRecommendations(false), 200)}
                className="w-full rounded-full bg-slate-100 border border-slate-200 px-4 py-2.5 pl-4 pr-12 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-primary/60 shadow-sm transition-all"
              />{" "}
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 p-1.5 rounded-full bg-primary text-white cursor-pointer transition-colors shadow-sm transition-all duration-300"
              >
                {" "}
                <Search className="h-4 w-4" />{" "}
              </button>{" "}
            </form>{" "}
            {showRecommendations && searchQuery.trim().length > 0 && (
              <div onMouseDown={(e) => e.preventDefault()} className="mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col z-10">
                {recommendations.length > 0 ? (
                  <>
                    {recommendations.map(product => (
                      <Link
                        key={product._id}
                        href={`/shop/${product.slug}`}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                        onClick={() => {
                          setShowRecommendations(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <img src={product.images?.[0] || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=40&q=80"} alt={product.title} className="w-10 h-10 object-cover rounded-md" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-800 line-clamp-1">{product.title}</span>
                          <span className="text-xs font-bold text-primary">₹{product.discountPrice || product.basePrice}</span>
                        </div>
                      </Link>
                    ))}
                    <button type="button" onClick={() => { setIsMobileMenuOpen(false); handleSearch(); }} className="w-full text-center p-2 text-xs text-primary font-bold hover:bg-slate-50 transition-colors border-t border-slate-100 cursor-pointer">
                      View all results
                    </button>
                  </>
                ) : (
                  <div className="p-4 text-center text-sm text-slate-500">
                    No products found
                  </div>
                )}
              </div>
            )}
          </div>{" "}
          <Link
            href="/#home"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-bold text-black py-2.5 px-3 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {" "}
            Home{" "}
          </Link>{" "}
          <Link
            href="/#categories"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-bold text-black py-2.5 px-3 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {" "}
            Categories{" "}
          </Link>{" "}
          <Link
            href="/#featured"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-bold text-black py-2.5 px-3 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {" "}
            Featured Products{" "}
          </Link>{" "}
          <Link
            href="/custom-print"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-bold text-black py-2.5 px-3 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {" "}
            Custom Orders{" "}
          </Link>{" "}
          <Link
            href="/#about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-bold text-black py-2.5 px-3 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {" "}
            About Us{" "}
          </Link>{" "}
          <Link
            href="/#contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-bold text-black py-2.5 px-3 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {" "}
            Contact Us{" "}
          </Link>{" "}
          <Link
            href="/wishlist"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-bold text-black py-2.5 px-3 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {" "}
            Wishlist ({wishlistCount}){" "}
          </Link>{" "}
          <hr className="border-slate-200 my-2" />{" "}
          {user ? (
            <div className="flex flex-col gap-1">
              {" "}
              <Link
                href={user.role === "admin" ? "/admin" : "/dashboard"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-bold text-black py-2.5 px-3 rounded-xl hover:bg-slate-100 transition-colors"
              >
                {" "}
                Dashboard Account{" "}
              </Link>{" "}
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left text-sm font-bold text-red-500 py-2.5 px-3 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
              >
                {" "}
                Sign Out{" "}
              </button>{" "}
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="whitespace-nowrap mt-2 mb-2 rounded-full bg-orange-500 hover:bg-orange-300 py-3.5 px-6 text-center text-sm font-bold tracking-wider text-slate-800  transition-all transition-all duration-300"
            >
              {" "}
              Sign In{" "}
            </Link>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </nav>
  );
}
