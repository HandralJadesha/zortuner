"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useWishlistStore } from "../../store/wishlistStore.js";
import { useCartStore } from "../../store/cartStore.js";
export default function WishlistPage() {
  const router = useRouter();
  const { products, toggleWishlist, clearWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-8 text-center flex flex-col items-center gap-6">
        {" "}
        <div className="rounded-full bg-slate-100 border border-slate-200 p-6 text-slate-500">
          {" "}
          <Heart className="h-12 w-12" />{" "}
        </div>{" "}
        <h2 className="text-2xl font-bold text-slate-900">
          Your Wishlist is Empty
        </h2>{" "}
        <p className="text-slate-400">
          Save your favorite 3D designs here to buy them later or configure
          custom colors.
        </p>{" "}
        <Link
          href="/shop"
          className="rounded-full bg-primary px-8 py-3 text-sm font-bold text-white tracking-wide border border-primary hover:bg-transparent hover:text-primary transition-all duration-300"
        >
          {" "}
          Browse Catalog{" "}
        </Link>{" "}
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative">
      {" "}
      <div className="absolute top-[10%] left-10 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />{" "}
      <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
        {" "}
        <div>
          {" "}
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Saved Designs
          </h1>{" "}
          <p className="text-slate-400 text-sm mt-1">
            You have saved {products.length} models
          </p>{" "}
        </div>{" "}
        <button
          onClick={clearWishlist}
          className="text-xs text-red-400 hover:underline cursor-pointer"
        >
          {" "}
          Clear All{" "}
        </button>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {" "}
        {products.map((product) => {
          const price = product.discountPrice || product.basePrice;
          return (
            <div
              key={product._id}
              className="group relative flex flex-col rounded-lg overflow-hidden glass-panel border border-white/10 hover-glow transition-all"
            >
              {" "}
              <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                {" "}
                <Image
                  src={product.images?.[0]}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />{" "}
                {product.inventory <= 0 && (
                  <div className="absolute top-4 left-4 z-20">
                    {" "}
                    <span className="inline-flex items-center justify-center px-3 py-1.5 text-[10px] font-bold text-white uppercase tracking-wider bg-red-500 rounded-full shadow-lg shadow-red-500/30">
                      {" "}
                      Out of Stock{" "}
                    </span>{" "}
                  </div>
                )}{" "}
                <button
                  onClick={() => toggleWishlist(product)}
                  className="absolute top-4 right-4 rounded-full bg-black/60 p-2.5 text-slate-300 hover:text-red-400 hover:bg-black transition-all cursor-pointer z-10"
                >
                  {" "}
                  <Trash2 className="h-4.5 w-4.5" />{" "}
                </button>{" "}
              </div>{" "}
              <div className="p-6 flex flex-col flex-grow">
                {" "}
                <h3 className="text-base font-bold text-slate-900 tracking-tight hover:text-accent">
                  {" "}
                  <Link href={`/shop/${product.slug}`}>
                    {product.title}
                  </Link>{" "}
                </h3>{" "}
                <div className="mt-6 flex justify-between items-center gap-4 mt-auto">
                  {" "}
                  <span className="text-lg font-bold text-slate-900">
                    ₹{price}
                  </span>{" "}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const text = `Hi, I would like to order ${product.title}.`;
                        window.open(`https://wa.me/918884828247?text=${encodeURIComponent(text)}`, "_blank");
                      }}
                      className="flex-1 flex items-center justify-center rounded-full py-2 px-6 text-[10px] sm:text-xs font-bold transition-all bg-slate-900 text-orange-500 hover:bg-slate-800 hover:text-orange-400 cursor-pointer"
                    >
                      Buy
                    </button>{" "}
                </div>{" "}
              </div>{" "}
            </div>
          );
        })}{" "}
      </div>{" "}
    </div>
  );
}
