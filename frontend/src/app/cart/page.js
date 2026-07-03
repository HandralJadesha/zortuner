"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Trash2,
  Tag,
  Percent,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useCartStore } from "../../store/cartStore.js";
import { api } from "../../lib/api.js";

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

export default function CartPage() {
  const {
    items,
    priceDetails,
    updateQuantity,
    updateColor,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    couponCode,
  } = useCartStore();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await api.post("/coupons/validate", { code: couponInput });
      if (res.data.success) {
        const { code, discountType, discountValue } = res.data.coupon;
        applyCoupon(code, discountType, discountValue);
        setCouponInput("");
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || "Invalid coupon code");
    } finally {
      setCouponLoading(false);
    }
  };
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-8 text-center flex flex-col items-center gap-6">
        {" "}
        <div className="rounded-full bg-slate-100 border border-slate-200 p-6 text-slate-500">
          {" "}
          <ShoppingBag className="h-12 w-12" />{" "}
        </div>{" "}
        <h2 className="text-2xl font-bold text-slate-900">
          Your Shopping Cart is Empty
        </h2>{" "}
        <p className="text-slate-400">
          Add some premium 3D printed objects or upload a custom design to get
          started.
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative h-[calc(100vh-80px)] flex flex-col">
      {" "}
      <div className="absolute top-[10%] right-10 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />{" "}
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-8 shrink-0">
        Shopping Cart
      </h1>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1 min-h-0 overflow-hidden">
        {" "}
        {/* Cart items list */}{" "}
        <div className="lg:col-span-8 flex flex-col gap-4 h-full overflow-y-auto pr-2 custom-scrollbar">
          {" "}
          {items.map((item) => {
            const price =
              item.product.discountPrice ||
              item.product.basePrice ||
              item.product.price ||
              0;
            return (
              <div
                key={item.id}
                className="glass-panel border border-slate-200 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                {" "}
                <div className="flex items-center gap-4">
                  {" "}
                  <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    {" "}
                    <Image
                      src={item.product.images?.[0]}
                      alt=""
                      fill
                      className="object-cover"
                    />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h3 className="font-bold text-slate-800 text-base hover:text-accent">
                      {" "}
                      <Link href={`/shop/${item.product.slug}`}>
                        {item.product.title}
                      </Link>{" "}
                    </h3>{" "}
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                      {" "}
                      <span className="bg-slate-100 text-slate-600 rounded px-2 py-1 font-semibold">
                        {item.selectedMaterial}
                      </span>{" "}
                      {item.product.colors && item.product.colors.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          {item.product.colors.map((col) => {
                            const colorCode = getColorCode(col);
                            const isGradient = colorCode.includes('gradient');
                            return (
                              <button
                                key={col}
                                onClick={() => updateColor(item.id, col)}
                                title={col}
                                className={`flex items-center justify-center w-6 h-6 rounded-md bg-white border transition-all cursor-pointer ${
                                  item.selectedColor === col 
                                    ? "border-slate-900 shadow-sm ring-1 ring-slate-900/20" 
                                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                }`}
                              >
                                <span 
                                  className="w-3.5 h-3.5 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)] border border-slate-200/60" 
                                  style={isGradient ? { background: colorCode } : { backgroundColor: colorCode }}
                                />
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 rounded px-2 py-1 font-semibold">
                          {item.selectedColor}
                        </span>
                      )}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto border-t border-slate-200 sm:border-none pt-4 sm:pt-0">
                  {" "}
                  {/* Quantity selector */}{" "}
                  <div className="flex items-center bg-white border border-slate-300 rounded-full p-1 shadow-sm">
                    {" "}
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-7 w-7 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all cursor-pointer font-bold"
                    >
                      {" "}
                      -{" "}
                    </button>{" "}
                    <span className="px-3 text-xs font-semibold text-slate-800">
                      {item.quantity}
                    </span>{" "}
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-7 w-7 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all cursor-pointer font-bold"
                    >
                      {" "}
                      +{" "}
                    </button>{" "}
                  </div>{" "}
                  {/* Price */}{" "}
                  <div className="text-right">
                    {" "}
                    <span className="block text-lg font-bold text-slate-900">
                      ₹{price * item.quantity}
                    </span>{" "}
                    <span className="text-[10px] text-slate-500">
                      ₹{price} each
                    </span>{" "}
                  </div>{" "}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-red-500 p-2 rounded transition-all cursor-pointer"
                  >
                    {" "}
                    <Trash2 className="h-4 w-4" />{" "}
                  </button>{" "}
                </div>{" "}
              </div>
            );
          })}{" "}
        </div>{" "}
        {/* Cart totals panel */}{" "}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-2 pb-10">
          {" "}
          <div className="glass-panel border border-slate-200 rounded-lg p-5 flex flex-col gap-4">
            {" "}
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-3">
              Order Summary
            </h2>{" "}
            {/* Coupons form */}{" "}
            {!couponCode ? (
              <form
                onSubmit={handleApplyCoupon}
                className="flex flex-col gap-2"
              >
                {" "}
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Promo Coupon
                </span>{" "}
                <div className="flex gap-2">
                  {" "}
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-grow rounded-xl bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 uppercase outline-none placeholder-slate-400"
                  />{" "}
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="rounded-xl bg-primary px-3 text-[10px] font-bold text-white cursor-pointer shadow-md shadow-primary/20 border border-primary hover:bg-transparent hover:text-primary transition-all duration-300"
                  >
                    {" "}
                    Apply{" "}
                  </button>{" "}
                </div>{" "}
                {couponError && (
                  <p className="text-red-500 text-[10px] mt-1">{couponError}</p>
                )}{" "}
              </form>
            ) : (
              <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
                {" "}
                <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold">
                  {" "}
                  <Tag className="h-3 w-3" />{" "}
                  <span>Coupon {couponCode} Applied</span>{" "}
                </div>{" "}
                <button
                  onClick={removeCoupon}
                  className="text-[10px] text-red-500 hover:underline cursor-pointer"
                >
                  {" "}
                  Remove{" "}
                </button>{" "}
              </div>
            )}{" "}
            <hr className="border-slate-200" />{" "}
            <div className="flex flex-col gap-2.5 text-xs text-slate-600">
              {" "}
              <div className="flex justify-between">
                {" "}
                <span>Items Subtotal</span>{" "}
                <span className="font-semibold text-slate-800">
                  ₹{priceDetails.itemsPrice}
                </span>{" "}
              </div>{" "}
              {priceDetails.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  {" "}
                  <span className="flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    Coupon Discount
                  </span>{" "}
                  <span>- ₹{priceDetails.couponDiscount}</span>{" "}
                </div>
              )}{" "}
              <div className="flex justify-between">
                {" "}
                <span>Shipping Fees</span>{" "}
                <span className="font-semibold text-slate-800">
                  {" "}
                  {priceDetails.shippingPrice === 0
                    ? "FREE"
                    : `₹${priceDetails.shippingPrice}`}{" "}
                </span>{" "}
              </div>{" "}
              <div className="flex justify-between">
                {" "}
                <span>GST (18% inclusive)</span>{" "}
                <span className="font-semibold text-slate-800">
                  ₹{priceDetails.taxPrice}
                </span>{" "}
              </div>{" "}
              <div className="mt-2 bg-white border border-slate-100 shadow-sm rounded-xl p-3 flex justify-between items-center text-sm font-bold">
                {" "}
                <span className="text-slate-800">Total</span>{" "}
                <span className="text-lg font-extrabold text-primary">
                  ₹{priceDetails.totalPrice}
                </span>{" "}
              </div>{" "}
            </div>{" "}
            <Link
              href="/checkout"
              className="w-full rounded-full bg-gradient-to-r from-primary to-secondary py-3 text-center text-white font-bold text-sm tracking-wider shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-2 border border-primary hover:bg-none hover:bg-transparent hover:text-primary transition-all duration-300"
            >
              {" "}
              <span>Proceed to Checkout</span>{" "}
              <ArrowRight className="h-4 w-4" />{" "}
            </Link>{" "}
          </div>{" "}
          <div className="flex items-center gap-2.5 justify-center text-xs text-slate-500">
            {" "}
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />{" "}
            <span>Secure 256-bit SSL checkout protection.</span>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
