"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Heart,
  ShoppingBag,
  Eye,
  ShieldAlert,
  Cpu,
  Sparkles,
  Scale,
  Info,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { api } from "../../../lib/api.js";
import ThreeDViewer from "../../../components/ThreeDViewer.jsx";
import { useCartStore } from "../../../store/cartStore.js";
import { useWishlistStore } from "../../../store/wishlistStore.js";
import { useAuthStore } from "../../../store/authStore.js";
const getColorCode = (colorName) => {
  if (!colorName) return '#E5E7EB';
  const map = {
    white: '#FFFFFF',
    black: '#000000',
    red: '#EF4444',
    blue: '#3B82F6',
    green: '#10B981',
    yellow: '#F59E0B',
    orange: '#F97316',
    purple: '#8B5CF6',
    pink: '#EC4899',
    gray: '#6B7280',
    silver: '#D1D5DB',
    gold: '#FBBF24',
    brown: '#92400E',
    rainbow: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)'
  };
  return map[colorName.toLowerCase()] || '#E5E7EB';
};

export default function ProductDetailPage() {
  const { key } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("images");
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [userName, setUserName] = useState("");
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const handleImagesScroll = (e) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    if (width > 0) {
      const newIdx = Math.round(scrollLeft / width);
      if (
        newIdx !== activeImageIdx &&
        newIdx >= 0 &&
        newIdx < product.images.length
      ) {
        setActiveImageIdx(newIdx);
      }
    }
  };
  useEffect(() => {
    if (!key) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const prodRes = await api.get(`/products/${key}`);
        if (prodRes.data.success) {
          const prod = prodRes.data.product;
          setProduct(prod);
          setSelectedMaterial("PLA");
          setSelectedColor(prod.colors?.[0] || "Black");
          const relRes = await api.get(
            `/products?category=${prod.category?._id}&limit=3`,
          );
          if (relRes.data.success) {
            setRelated(relRes.data.products.filter((p) => p._id !== prod._id));
          }
        }
        const revRes = await api.get(`/reviews/${prodRes.data.product._id}`);
        if (revRes.data.success) {
          setReviews(revRes.data.reviews);
        }
      } catch (err) {
        console.error("Failed to load detail pages data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [key]);
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        {" "}
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>{" "}
        <span className="mt-4 text-sm text-slate-400">
          Loading premium 3D design details...
        </span>{" "}
      </div>
    );
  }
  if (!product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-8 text-center flex flex-col items-center gap-6">
        {" "}
        <ShieldAlert className="h-12 w-12 text-red-500" />{" "}
        <h2 className="text-2xl font-bold text-white">Product Not Found</h2>{" "}
        <p className="text-slate-400">
          The 3D design model you are looking for might have been removed or
          cataloged under a new ID.
        </p>{" "}
        <Link
          href="/shop"
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white border border-primary hover:bg-transparent hover:text-primary transition-all duration-300"
        >
          {" "}
          Back to Shop{" "}
        </Link>{" "}
      </div>
    );
  }
  const isWish = isInWishlist(product?._id);
  const finalPrice = product.discountPrice || product.basePrice;
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative">
      {" "}
      <div className="absolute top-[10%] right-1/4 h-[300px] w-[300px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />{" "}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start lg:h-[calc(100vh-180px)] mb-8">
        {" "}
        <div className="lg:col-span-6 flex flex-col gap-4 h-full">
          {" "}
          <div className="flex gap-2 bg-slate-100 border border-slate-200 rounded-full p-1 w-fit shrink-0">
            {" "}
            <button
              onClick={() => setActiveTab("images")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold cursor-pointer transition-all ${activeTab === "images" ? "bg-primary text-white shadow-md" : "text-slate-500 hover:text-slate-800"}`}
            >
              {" "}
              High-Res Photos{" "}
            </button>{" "}
            <button
              onClick={() => setActiveTab("3d")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${activeTab === "3d" ? "bg-primary text-white shadow-md" : "text-slate-500 hover:text-slate-800"}`}
            >
              {" "}
              <Eye className="h-3.5 w-3.5" /> 360° 3D Mesh{" "}
            </button>{" "}
          </div>{" "}
          <div className="relative w-full flex-grow rounded-lg overflow-hidden glass-panel border border-slate-200 flex items-center justify-center min-h-[300px] aspect-square lg:aspect-auto">
            {" "}
            {activeTab === "images" ? (
              <div
                onScroll={handleImagesScroll}
                className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-none"
              >
                {" "}
                {product.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-full h-full min-w-full snap-center shrink-0 overflow-hidden"
                  >
                    {" "}
                    <Image
                      src={img}
                      alt={`${product.title} - ${idx + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-110 cursor-zoom-in"
                      priority={idx === 0}
                    />{" "}
                  </div>
                ))}{" "}
              </div>
            ) : (
              <ThreeDViewer
                className="w-full h-full border-none"
                autoRotate={true}
              />
            )}{" "}
          </div>{" "}
          {activeTab === "images" && product.images.length > 1 && (
            <div className="flex justify-center items-center gap-1.5 mt-2 shrink-0">
              {" "}
              {product.images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${activeImageIdx === idx ? "w-6 bg-primary" : "w-2 bg-slate-300"}`}
                />
              ))}{" "}
              <span className="text-[10px] text-slate-500 ml-2">
                Swipe/Scroll horizontally to view all
              </span>{" "}
            </div>
          )}{" "}
        </div>{" "}
        <div className="lg:col-span-6 flex flex-col gap-4 h-full lg:pr-2 pb-2">
          {" "}
          <div>
            {" "}
            <div className="flex items-center gap-2">
              {" "}
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded">
                {" "}
                {product.category?.name || "Collection"}{" "}
              </span>{" "}
              {product.inventory <= 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider bg-red-500 rounded shadow-sm">
                  {" "}
                  Out of Stock{" "}
                </span>
              )}{" "}
            </div>{" "}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-2">
              {product.title}
            </h1>{" "}
            <div className="flex items-center gap-2 mt-1.5">
              {" "}
              <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold">
                {" "}
                <Star className="h-3.5 w-3.5 fill-yellow-500" />{" "}
                <span>{product.averageRating || "4.5"}</span>{" "}
              </div>{" "}
              <span className="text-slate-300 text-sm">•</span>{" "}
              <span className="text-slate-500 text-xs font-medium hover:underline cursor-pointer">
                {reviews.length} customer reviews
              </span>{" "}
            </div>{" "}
          </div>{" "}
          <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm w-fit">
            {" "}
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              ₹{finalPrice}
            </span>{" "}
            {product.discountPrice && (
              <span className="text-slate-400 line-through text-sm font-medium">
                ₹{product.basePrice}
              </span>
            )}{" "}
            {product.discountPrice && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md">
                {" "}
                Save ₹{product.basePrice - product.discountPrice} ({" "}
                {Math.round(
                  ((product.basePrice - product.discountPrice) /
                    product.basePrice) *
                    100,
                )}
                % Off){" "}
              </span>
            )}{" "}
          </div>{" "}
          <p className="text-slate-600 font-light text-sm line-clamp-3">
            {" "}
            {product.description}{" "}
          </p>{" "}
          <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-4">
            {" "}
            <div className="flex flex-col gap-2">
              {" "}
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Material
              </span>{" "}
              <button className="rounded-lg px-3 py-1.5 text-xs font-bold bg-primary text-white shadow-sm w-fit cursor-default">
                {" "}
                PLA{" "}
              </button>{" "}
            </div>{" "}
            <div className="flex flex-col gap-2">
              {" "}
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Color
              </span>{" "}
              <div className="flex flex-wrap gap-1.5">
                {" "}
                {(product.colors?.length > 0 ? product.colors : ["Black"]).map((col) => {
                  const colorCode = getColorCode(col);
                  const isGradient = colorCode.includes('gradient');
                  return (
                    <button
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      title={col}
                      className={`flex items-center justify-center w-10 h-10 rounded-xl bg-white border transition-all cursor-pointer ${
                        selectedColor === col 
                          ? "border-slate-900 shadow-md ring-2 ring-slate-900/20 scale-105" 
                          : "border-slate-200 hover:border-slate-300 hover:shadow-sm hover:bg-slate-50"
                      }`}
                    >
                      {" "}
                      <span 
                        className="w-6 h-6 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] border border-slate-200/60" 
                        style={isGradient ? { background: colorCode } : { backgroundColor: colorCode }}
                      />
                    </button>
                  );
                })}{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div className="glass-panel border border-slate-200 rounded-xl p-4 flex justify-between items-center bg-slate-50/50">
            {" "}
            <div className="flex flex-col gap-1 items-center">
              {" "}
              <Scale className="h-4 w-4 text-slate-400" />
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Weight</span>{" "}
              <span className="font-bold text-slate-700 text-xs">
                {product.weight || "120"}g
              </span>{" "}
            </div>{" "}
            <div className="w-px h-8 bg-slate-200" />
            <div className="flex flex-col gap-1 items-center">
              {" "}
              <Info className="h-4 w-4 text-slate-400" />
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Dimensions</span>{" "}
              <span className="font-bold text-slate-700 text-xs">
                {" "}
                {product.dimensions?.length}x{product.dimensions?.width}x{" "}
                {product.dimensions?.height} mm{" "}
              </span>{" "}
            </div>{" "}
            <div className="w-px h-8 bg-slate-200" />
            <div className="flex flex-col gap-1 items-center">
              {" "}
              <Sparkles className="h-4 w-4 text-slate-400" />
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Print Time</span>{" "}
              <span className="font-bold text-slate-700 text-xs">
                ~{product.printDuration || "6.5"} hrs
              </span>{" "}
            </div>{" "}
          </div>{" "}
          <div className="flex gap-3 mt-auto pt-2">
            {" "}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shrink-0">
              {" "}
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-10 w-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all text-lg font-medium cursor-pointer"
              >
                {" "}
                -{" "}
              </button>{" "}
              <span className="w-8 text-center text-sm font-bold text-slate-800">
                {quantity}
              </span>{" "}
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="h-10 w-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all text-lg font-medium cursor-pointer"
              >
                {" "}
                +{" "}
              </button>{" "}
            </div>{" "}
            <div className="flex flex-col gap-2 flex-grow">
              <input
                type="text"
                placeholder="Your Name (Required for WhatsApp Order)"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-sm text-slate-800 outline-none"
              />
              <button
                onClick={(e) => {
                  if (!userName.trim()) {
                    alert("Please enter your name before ordering.");
                    return;
                  }
                  const text = `Hi, my name is ${userName.trim()}. I would like to order ${product.title} (${quantity}x).`;
                  window.open(`https://wa.me/918884828247?text=${encodeURIComponent(text)}`, "_blank");
                }}
                disabled={product.inventory <= 0}
                className={`flex-grow rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 h-12 ${product.inventory <= 0 ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"}`}
              >
                <FaWhatsapp className="h-5 w-5" />
                <span>
                  {product.inventory <= 0
                    ? "Out of Stock"
                    : `Order - ₹${finalPrice * quantity}`}
                </span>
              </button>
            </div>
            <button
              onClick={() => toggleWishlist(product)}
              className="rounded-xl border border-slate-200 bg-white w-14 h-[88px] flex items-center justify-center text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 cursor-pointer transition-all shrink-0 group"
            >
              <Heart
                className={`h-5 w-5 transition-transform group-hover:scale-110 ${isWish ? "fill-red-500 text-red-500" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>{" "}
      {related.length > 0 && (
        <section className="py-8 min-h-[calc(100vh-100px)] flex flex-col justify-center border-t border-slate-200/60">
          {" "}
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-6">
            Related 3D Models
          </h2>{" "}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {" "}
            {related.map((p) => {
              const isW = isInWishlist(p._id);
              return (
                <div
                  key={p._id}
                  className="group relative flex flex-col rounded-lg overflow-hidden glass-panel border border-slate-100 hover-glow transition-all"
                >
                  {" "}
                  <div className="relative aspect-video sm:aspect-[4/3] lg:aspect-video w-full bg-slate-100 overflow-hidden shrink-0">
                    {" "}
                    <Image
                      src={p.images?.[0]}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />{" "}
                    <button
                      onClick={() => toggleWishlist(p)}
                      className="absolute top-3 right-3 rounded-full bg-black/60 p-2 text-slate-300 hover:text-red-400 hover:bg-black transition-all cursor-pointer z-10"
                    >
                      {" "}
                      <Heart
                        className={`h-3.5 w-3.5 ${isW ? "fill-red-500 text-red-500" : ""}`}
                      />{" "}
                    </button>{" "}
                  </div>{" "}
                  <div className="p-4 lg:p-5 flex flex-col flex-grow">
                    {" "}
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight hover:text-accent line-clamp-1">
                      <Link href={`/shop/${p.slug}`}>{p.title}</Link>
                    </h3>{" "}
                    <div className="mt-3 flex justify-between items-center mt-auto">
                      {" "}
                      <span className="text-base font-bold text-slate-900">
                        ₹{p.discountPrice || p.basePrice}
                      </span>{" "}
                      <Link
                        href={`/shop/${p.slug}`}
                        className="text-[10px] font-semibold text-accent hover:underline"
                      >
                        View Model &rarr;
                      </Link>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>
              );
            })}{" "}
          </div>{" "}
        </section>
      )}{" "}
      <section className="py-8 min-h-[calc(100vh-100px)] flex flex-col justify-center border-t border-slate-200/60">
        {" "}
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-6">
          Customer Feedback
        </h2>{" "}
        {reviews.length === 0 ? (
          <p className="text-slate-400 text-sm italic">
            No reviews yet. Be the first to buy and review this custom model!
          </p>
        ) : (
          <div className="flex flex-col gap-4 lg:gap-5 max-w-3xl">
            {" "}
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="glass-panel border border-slate-200/60 rounded-xl p-5 flex flex-col gap-2"
              >
                {" "}
                <div className="flex justify-between items-center">
                  {" "}
                  <span className="font-bold text-slate-900 text-sm">
                    {rev.user?.name || "Verified Buyer"}
                  </span>{" "}
                  <div className="flex gap-0.5 text-yellow-400">
                    {" "}
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star
                        key={idx}
                        className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                      />
                    ))}{" "}
                  </div>{" "}
                </div>{" "}
                <p className="text-xs text-slate-600 font-light leading-relaxed">
                  {rev.comment}
                </p>{" "}
                <span className="text-[10px] text-slate-400">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>{" "}
              </div>
            ))}{" "}
          </div>
        )}{" "}
      </section>{" "}
    </div>
  );
}



