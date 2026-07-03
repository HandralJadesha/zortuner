"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "../../store/cartStore.js";
import { useAuthStore } from "../../store/authStore.js";
import { api } from "../../lib/api.js";
import {
  MapPin,
  ShieldCheck,
  ShoppingBag,
  CreditCard,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
export default function CheckoutPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const { items, priceDetails, couponCode, clearCart } =
    useCartStore(); /* Redirect */
  /* Redirect if empty cart */ useEffect(() => {
    if (items.length === 0 && activeStep !== "success") {
      router.push("/cart");
    }
  }, [items, router]); /* Checkout states */
  const [activeStep, setActiveStep] =
    useState("address"); /* address | payment | success */
  const [loading, setLoading] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [error, setError] = useState(null);
  const [editingAddressId, setEditingAddressId] =
    useState(null); /* Shipping input */
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState(""); /* Placed Order details */
  const [placedOrder, setPlacedOrder] = useState(null);
  const [mockRazorpayId, setMockRazorpayId] =
    useState(""); /* Autofill address */
  /* Autofill address if user has saved addresses */ useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const def =
        user.addresses.find((a) => a.isDefault) || user.addresses?.[0];
      setTimeout(() => {
        setStreet(def.street || "");
        setCity(def.city || "");
        setState(def.state || "");
        setPostalCode(def.postalCode || "");
      }, 0);
    }
  }, [user]);
  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (street && city && state && postalCode) {
      setActiveStep("payment");
    }
  };
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!street || !city || !state || !postalCode) {
      setError("Please fill all address fields before saving.");
      return;
    }
    setSavingAddress(true);
    setError(null);
    try {
      if (editingAddressId) {
        const res = await api.put(`/auth/address/${editingAddressId}`, {
          street,
          city,
          state,
          postalCode,
          country: "India",
          isDefault: false,
        });
        if (res.data.success) {
          updateUser({ addresses: res.data.addresses });
          setError(null);
          alert("Address updated successfully!");
          setEditingAddressId(null);
        }
      } else {
        const res = await api.post("/auth/address", {
          street,
          city,
          state,
          postalCode,
          country: "India",
          isDefault: false,
        });
        if (res.data.success) {
          updateUser({ addresses: res.data.addresses });
          setError(null);
          if (res.data.message === "Address already exists") {
            alert("This address is already in your profile.");
          } else {
            alert("Address saved to your profile!");
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save address");
    } finally {
      setSavingAddress(false);
    }
  };
  const handleDeleteAddress = async (addressId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this address?"))
      return;
    try {
      const res = await api.delete(`/auth/address/${addressId}`);
      if (res.data.success) {
        updateUser({ addresses: res.data.addresses });
        if (editingAddressId === addressId) {
          setEditingAddressId(null);
          setStreet("");
          setCity("");
          setState("");
          setPostalCode("");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete address");
    }
  };
  const handleEditAddress = (addr, e) => {
    e.stopPropagation();
    setEditingAddressId(addr._id);
    setStreet(addr.street);
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
  };
  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      /* 1. Submit order configuration to API */
      const orderItems = items.map((item) => ({
        product: item.product._id,
        title: item.product.title,
        quantity: item.quantity,
        price:
          item.product.discountPrice ||
          item.product.basePrice ||
          item.product.price ||
          0,
        selectedMaterial: item.selectedMaterial,
        selectedColor: item.selectedColor,
        image: item.product.images?.[0] || "",
      }));
      const res = await api.post("/orders", {
        orderItems,
        shippingAddress: { street, city, state, postalCode, country: "India" },
        paymentMethod: "Razorpay",
        couponCode: couponCode || undefined,
      });
      if (res.data.success) {
        setPlacedOrder(res.data.order);
        setMockRazorpayId(res.data.order.razorpayOrderId);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to place order. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  const handleVerifyPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      /* Send validation payload */
      const res = await api.post("/orders/verify", {
        orderId: placedOrder._id,
        razorpayOrderId: mockRazorpayId,
        razorpayPaymentId: `pay_mock_${Math.random().toString(36).substring(2, 11)}`,
        razorpaySignature: "mock_signature" /* bypassed by server */,
        /* bypassed by server if keys aren't configured */
      });
      if (res.data.success) {
        clearCart();
        setActiveStep("success");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Payment verification failed.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 relative">
      {" "}
      <div className="absolute top-[10%] left-10 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />{" "}
      {/* Steps indicator bar */}{" "}
      {activeStep !== "success" && (
        <div className="flex justify-center items-center gap-2 mb-6 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {" "}
          <span
            className={
              activeStep === "address"
                ? "text-primary font-bold"
                : "text-slate-500"
            }
          >
            {" "}
            1. Shipping Address{" "}
          </span>{" "}
          <ChevronRight className="h-3.5 w-3.5 text-slate-600" />{" "}
          <span
            className={
              activeStep === "payment"
                ? "text-primary font-bold"
                : "text-slate-500"
            }
          >
            {" "}
            2. Secure Payment{" "}
          </span>{" "}
        </div>
      )}{" "}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-xs text-center font-medium max-w-md mx-auto mb-6">
          {" "}
          {error}{" "}
        </div>
      )}{" "}
      {/* 1. SHIPPING ADDRESS STEP */}{" "}
      {(activeStep === "address" || activeStep === "payment") && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {" "}
          <div className="lg:col-span-7">
            {activeStep === "address" && (
              <div className="glass-panel border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
                {" "}
                <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-4 flex items-center gap-1.5">
                  {" "}
                  <MapPin className="h-5 w-5 text-primary" />{" "}
                  <span>Shipping Address</span>{" "}
                </h2>{" "}
                {user?.addresses?.length > 0 && (
                  <div className="flex flex-col gap-4 mt-2 mb-2">
                    {" "}
                    <h3 className="text-sm font-bold text-slate-700">
                      Select a Saved Address:
                    </h3>{" "}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {" "}
                      {user.addresses.map((addr, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setStreet(addr.street);
                            setCity(addr.city);
                            setState(addr.state);
                            setPostalCode(addr.postalCode);
                            setActiveStep("payment");
                          }}
                          className="glass-panel border border-slate-200 hover:border-primary hover:shadow-lg rounded-xl p-4 flex flex-col gap-2 cursor-pointer transition-all group"
                        >
                          {" "}
                          <div className="flex justify-between items-center">
                            {" "}
                            <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                              {" "}
                              {addr.isDefault
                                ? "Default Address"
                                : `Address ${idx + 1}`}{" "}
                              <div className="flex gap-1 ml-2">
                                {" "}
                                <button
                                  type="button"
                                  onClick={(e) => handleEditAddress(addr, e)}
                                  className="text-xs text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors"
                                >
                                  {" "}
                                  Edit{" "}
                                </button>{" "}
                                <button
                                  type="button"
                                  onClick={(e) =>
                                    handleDeleteAddress(addr._id, e)
                                  }
                                  className="text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded transition-colors"
                                >
                                  {" "}
                                  Delete{" "}
                                </button>{" "}
                              </div>{" "}
                            </span>{" "}
                            <span className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-colors border border-primary hover:bg-transparent hover:text-primary transition-all duration-300">
                              {" "}
                              Use This{" "}
                            </span>{" "}
                          </div>{" "}
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            {" "}
                            {addr.street}
                            <br /> {addr.city}, {addr.state} -{" "}
                            {addr.postalCode}{" "}
                          </p>{" "}
                        </div>
                      ))}{" "}
                    </div>{" "}
                    <div className="flex items-center gap-4 my-1">
                      {" "}
                      <div className="flex-1 border-t border-slate-200" />{" "}
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Or enter a new one
                      </span>{" "}
                      <div className="flex-1 border-t border-slate-200" />{" "}
                    </div>{" "}
                  </div>
                )}{" "}
                <form
                  onSubmit={handleAddressSubmit}
                  className="flex flex-col gap-4"
                >
                  {" "}
                  <div className="flex flex-col gap-1.5">
                    {" "}
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Street Address
                    </label>{" "}
                    <input
                      type="text"
                      required
                      placeholder="Enter your street address"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="rounded-xl bg-white border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none placeholder-slate-400"
                    />{" "}
                  </div>{" "}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {" "}
                    <div className="flex flex-col gap-1.5">
                      {" "}
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        City
                      </label>{" "}
                      <input
                        type="text"
                        required
                        placeholder="Enter your city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="rounded-xl bg-white border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none placeholder-slate-400"
                      />{" "}
                    </div>{" "}
                    <div className="flex flex-col gap-1.5">
                      {" "}
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        State
                      </label>{" "}
                      <input
                        type="text"
                        required
                        placeholder="Enter your state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="rounded-xl bg-white border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none placeholder-slate-400"
                      />{" "}
                    </div>{" "}
                    <div className="flex flex-col gap-1.5">
                      {" "}
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        PIN Code
                      </label>{" "}
                      <input
                        type="text"
                        required
                        maxLength="10"
                        placeholder="e.g. 560001"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="rounded-xl bg-white border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none placeholder-slate-400"
                      />{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="flex flex-col sm:flex-row gap-3 mt-3">
                    {" "}
                    <button
                      type="button"
                      onClick={handleSaveAddress}
                      disabled={savingAddress}
                      className="flex-grow rounded-full bg-emerald-500 hover:bg-emerald-600 py-4 text-center text-white font-bold text-sm tracking-wider shadow-lg transition-all cursor-pointer"
                    >
                      {" "}
                      {savingAddress
                        ? "Saving..."
                        : editingAddressId
                          ? "Update Address"
                          : "Save Address"}{" "}
                    </button>{" "}
                    <button
                      type="submit"
                      className="flex-grow rounded-full bg-gradient-to-r from-primary to-secondary py-4 text-center text-white font-bold text-sm tracking-wider shadow-lg hover:opacity-95 transition-all cursor-pointer border border-primary hover:bg-none hover:bg-transparent hover:text-primary transition-all duration-300"
                    >
                      {" "}
                      Continue to Pricing & Payment{" "}
                    </button>{" "}
                  </div>{" "}
                </form>{" "}
              </div>
            )}
            {activeStep === "payment" && (
              <div className="glass-panel border border-slate-200 rounded-xl p-6 flex flex-col gap-4 relative z-10">
                <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span>Secure Razorpay Payment</span>
                </h2>
                <div className="flex flex-col gap-3.5 text-xs text-slate-600 bg-slate-50/50 rounded-lg p-6 border border-slate-200">
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-1">
                    Pricing Recap
                  </h3>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span>Items Total</span>
                    <span className="font-medium text-slate-800">
                      ₹{priceDetails.itemsPrice}
                    </span>
                  </div>
                  {priceDetails.couponDiscount > 0 && (
                    <div className="flex justify-between border-b border-slate-200 pb-2 text-emerald-600">
                      <span>Applied Coupon Discount</span>
                      <span>- ₹{priceDetails.couponDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span>Shipping Delivery</span>
                    <span className="font-medium text-slate-800">
                      {priceDetails.shippingPrice === 0
                        ? "FREE"
                        : `₹${priceDetails.shippingPrice}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST Tax Amount</span>
                    <span className="font-medium text-slate-800">
                      ₹{priceDetails.taxPrice}
                    </span>
                  </div>
                  <div className="mt-4 bg-white rounded-xl p-4 flex justify-between items-center text-sm font-bold border border-slate-100 shadow-sm">
                    <span className="text-slate-800">Amount Due</span>
                    <span className="text-lg font-extrabold text-primary">
                      ₹{priceDetails.totalPrice}
                    </span>
                  </div>
                </div>
                <div className="text-slate-600 text-xs leading-relaxed font-light mt-2">
                  <span className="font-bold text-slate-800 block mb-1">
                    Shipping details:
                  </span>
                  {street}, {city}, {state} - {postalCode}
                </div>
                {!placedOrder ? (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="rounded-full bg-gradient-to-r from-primary to-secondary py-4 text-center text-white font-bold text-sm tracking-wider shadow-lg hover:opacity-95 transition-all mt-4 cursor-pointer border border-primary hover:bg-none hover:bg-transparent hover:text-primary transition-all duration-300"
                  >
                    {loading ? "Creating Order..." : "Place Order & Pay"}
                  </button>
                ) : (
                  <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 text-center flex flex-col gap-3">
                      <span className="text-xs font-bold text-slate-300">
                        Razorpay Simulation Gateway
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Order ID: {mockRazorpayId}
                      </span>
                      <button
                        onClick={handleVerifyPayment}
                        disabled={loading}
                        className="rounded-full bg-primary py-3 text-xs font-bold text-white cursor-pointer mt-2 w-full border border-primary hover:bg-transparent hover:text-primary transition-all duration-300"
                      >
                        {loading
                          ? "Verifying payment..."
                          : "Simulate Success Payment"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Checkout item overview */}{" "}
          <div className="lg:col-span-5 glass-panel border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
            {" "}
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-4 flex items-center gap-1.5">
              {" "}
              <ShoppingBag className="h-4.5 w-4.5 text-accent" />{" "}
              <span>Checkout Items</span>{" "}
            </h2>{" "}
            <div className="flex flex-col gap-4 max-h-[35vh] overflow-y-auto pr-2">
              {" "}
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center gap-4 text-xs"
                >
                  {" "}
                  <span className="text-slate-700 font-medium truncate max-w-[180px]">
                    {item.product.title}
                  </span>{" "}
                  <span className="text-slate-500 font-semibold shrink-0">
                    x {item.quantity}
                  </span>{" "}
                  <span className="text-slate-900 font-bold shrink-0">
                    ₹
                    {(item.product.discountPrice ||
                      item.product.basePrice ||
                      item.product.price ||
                      0) * item.quantity}
                  </span>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {/* 3. SUCCESS CONFIRMATION STEP */}{" "}
      {activeStep === "success" && (
        <div className="max-w-md mx-auto text-center flex flex-col items-center gap-6 py-8 animate-in zoom-in-95 duration-500 relative z-10 glass-panel border border-slate-200 rounded-xl p-8">
          {" "}
          <div className="rounded-full bg-emerald-50 border border-emerald-200 p-6 text-emerald-600 animate-bounce">
            {" "}
            <CheckCircle2 className="h-16 w-16" />{" "}
          </div>{" "}
          <div>
            {" "}
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Order Placed Successfully!
            </h1>{" "}
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              {" "}
              Thank you for buying from Zortuner. Your 3D models are queued
              in our printing line. We sent tracking details to your email.{" "}
            </p>{" "}
          </div>{" "}
          <div className="flex flex-col sm:flex-row gap-3 mt-3 w-full">
            {" "}
            <Link
              href="/dashboard?tab=orders"
              className="flex-grow rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200 py-3.5 text-center text-sm font-bold text-slate-700 hover:text-slate-900 transition-all cursor-pointer"
            >
              {" "}
              Track Order{" "}
            </Link>{" "}
            <Link
              href="/shop"
              className="flex-grow rounded-full bg-gradient-to-r from-primary to-secondary py-3.5 text-center text-sm font-bold text-white tracking-wide cursor-pointer border border-primary hover:bg-none hover:bg-transparent hover:text-primary transition-all duration-300"
            >
              {" "}
              Continue Shopping{" "}
            </Link>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
}
