"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Package, User, MapPin, CreditCard, Calendar, ShoppingBag, Moon, Sun } from "lucide-react";
import { api } from "../../../../lib/api.js";
import { useAuthStore } from "../../../../store/authStore.js";
import { formatOrderNumber } from "../../../../lib/formatters.js";

const getStatusColor = (status) => {
  switch (status) {
    case "Pending":
    case "Pending Quote":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Paid":
    case "Quoted":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Processing":
    case "Approved":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "Printing":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "Shipped":
      return "bg-cyan-100 text-cyan-800 border-cyan-200";
    case "Delivered":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
};

const StatusDropdown = ({ value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-full border px-4 py-2 text-sm font-bold outline-none cursor-pointer transition-colors flex items-center justify-between gap-3 min-w-[140px] ${getStatusColor(value)}`}
      >
        <span>{value}</span>
        <svg className="h-4 w-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-48 origin-top sm:origin-top-right rounded-xl glass-panel bg-white shadow-2xl ring-1 ring-black/5 z-50 flex flex-col p-1.5 gap-1">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full text-left rounded-lg px-3 py-2 text-sm font-bold transition-all cursor-pointer hover:scale-[1.02] active:scale-95 ${getStatusColor(opt)}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminTheme, setAdminTheme] = useState("light");

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || user?.role !== "admin") {
        router.push("/login");
        return;
      }
      if (id) fetchOrderDetails();
    }
  }, [isLoading, isAuthenticated, user, router, id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order);
      } else {
        setError(res.data.message || "Failed to load order");
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching order details.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (newStatus) => {
    try {
      const res = await api.put(`/orders/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setOrder({ ...order, orderStatus: newStatus });
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex justify-center items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 font-medium">{error || "Order not found"}</p>
        <button onClick={() => router.push("/admin")} className="px-4 py-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors font-bold cursor-pointer">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className={`h-screen w-full flex flex-col bg-slate-50 overflow-hidden p-4 sm:p-6 gap-4 `}>
      
      {/* Header Actions */}
      <div className="flex justify-between items-center shrink-0">
        <button 
          onClick={() => router.push("/admin")}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>
        <button
          onClick={() => setAdminTheme(adminTheme === "light" ? "dark" : "light")}
          className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200 shadow-sm"
          title={`Switch to ${adminTheme === "light" ? "dark" : "light"} mode`}
        >
          {adminTheme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
      </div>

      {/* Order Header */}
      <div className="glass-panel border border-slate-200 rounded-lg p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6 shrink-0 bg-white">
        
        {/* Order ID & Date */}
        <div className="flex flex-col gap-1 min-w-[200px]">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-primary shrink-0" />
            <span className="truncate">#{formatOrderNumber(order._id, order.createdAt)}</span>
          </h1>
          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Customer Info (Moved to Header) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 lg:border-l lg:border-slate-100 lg:pl-6 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-sm">{order.user?.name}</span>
              <span className="text-xs text-slate-500">{order.user?.email}</span>
            </div>
          </div>
          <div className="hidden sm:block h-8 w-px bg-slate-200 mx-2"></div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><MapPin className="h-3 w-3" /> Shipping To</span>
            <span className="text-xs text-slate-700 font-medium truncate max-w-[250px]">
              {order.shippingAddress?.street}, {order.shippingAddress?.city}
            </span>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="flex flex-col items-start lg:items-end gap-1.5 min-w-[160px] lg:border-l lg:border-slate-100 lg:pl-6 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Status</span>
          <StatusDropdown
            value={order.orderStatus}
            options={["Pending", "Paid", "Processing", "Printing", "Shipped", "Delivered", "Cancelled"]}
            onChange={handleUpdateOrderStatus}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Main Details (Items) */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <div className="glass-panel border border-slate-200 rounded-lg p-4 sm:p-6 flex flex-col h-full bg-white">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 shrink-0">
              <ShoppingBag className="h-5 w-5 text-primary" /> Order Items
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex flex-col gap-4">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <img 
                      src={item.image || item.product?.images?.[0] || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=150&q=80"} 
                      alt={item.title || item.product?.title || "Product Image"} 
                      className="w-16 h-16 object-cover rounded-xl border border-slate-200 bg-slate-50 shrink-0"
                    />
                    <div className="flex flex-col flex-1 gap-0.5">
                      <h3 className="font-bold text-slate-900 text-sm">{item.title || item.product?.title}</h3>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">{item.selectedMaterial}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">{item.selectedColor}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">Size: {item.selectedSize}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 text-right shrink-0">
                      <span className="font-extrabold text-slate-900 text-sm">₹{item.price}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">Qty: {item.quantity}</span>
                      <span className="text-xs font-bold text-primary mt-0.5">₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar (Payment Details) */}
        <div className="flex flex-col gap-4 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
          {/* Payment & Summary */}
          <div className="glass-panel border border-slate-200 rounded-lg p-4 sm:p-5 flex flex-col shrink-0 bg-white h-full">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-primary" /> Payment Summary
            </h2>
            
            <div className="flex flex-col gap-2.5 text-xs border-b border-slate-100 pb-4 mb-4">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Subtotal ({order.orderItems?.length} items)</span>
                <span>₹{order.priceDetails?.itemsPrice}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Shipping</span>
                <span>₹{order.priceDetails?.shippingPrice}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Tax</span>
                <span>₹{order.priceDetails?.taxPrice}</span>
              </div>
              {order.priceDetails?.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                  <span>Discount</span>
                  <span>-₹{order.priceDetails?.discount}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-slate-900 text-sm">Total</span>
              <span className="font-extrabold text-primary text-xl">₹{order.priceDetails?.totalPrice}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3 mt-auto">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Status</span>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${order.isPaid ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-xs font-bold text-slate-800">{order.isPaid ? 'Paid' : 'Pending'}</span>
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200/60 pt-3 mt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Method</span>
                <span className="text-xs font-bold text-slate-800 uppercase">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200/60 pt-3 mt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</span>
                <span className="text-xs font-bold text-slate-800">{order.shippingAddress?.phone || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



