"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  BarChart3,
  ShoppingBag,
  Layers,
  MessageSquare,
  Plus,
  Save,
  UserCheck,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Tag,
  Edit2,
  FileText,
  Moon,
  Sun,
  Eye,
  EyeOff,
} from "lucide-react";
import { api } from "../../lib/api.js";
import { useAuthStore } from "../../store/authStore.js";
import { formatOrderNumber } from "../../lib/formatters.js";

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
        className={`rounded-full border px-3 py-1.5 text-xs font-bold outline-none cursor-pointer transition-colors flex items-center justify-between gap-2 min-w-[120px] ${getStatusColor(value)}`}
      >
        <span>{value}</span>
        <svg
          className="h-3 w-3 opacity-70"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 origin-top-right rounded-xl glass-panel bg-white shadow-2xl ring-1 ring-black/5 z-50 flex flex-col p-1.5 gap-1">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full text-left rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer hover:scale-[1.02] active:scale-95 ${getStatusColor(opt)}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, initialize, isLoading, login } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isLoading) {
      if (!isAuthenticated || user?.role !== "admin") {
        router.push("/login"); // This relies on middleware for `admin.domain.com/login` -> `/admin/login`
      }
    }
  }, [isClient, isLoading, isAuthenticated, user, router]);

  const [activeTab, setActiveTab] = useState("orders"); // 'orders' | 'custom' | 'tickets' | 'products'
  const [adminTheme, setAdminTheme] = useState("light");

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrdersCount: 0,
    totalCustomersCount: 0,
    activeCustomPrintsCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [analyticsPeriod, setAnalyticsPeriod] = useState("month");

  // Data lists
  const [orders, setOrders] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Coupon Edit / Create states
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [editCouponForm, setEditCouponForm] = useState({});
  const [newCouponForm, setNewCouponForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    expiryDate: "",
    usageLimit: 100,
  });

  useEffect(() => {
    initialize();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordRes, custRes, tickRes, coupRes, invRes, prodRes, usersRes] = await Promise.all([
        api.get(`/analytics/dashboard?period=${analyticsPeriod}`),
        api.get("/orders/admin"),
        api.get("/custom-orders/admin"),
        api.get("/support/tickets/admin"),
        api.get("/coupons").catch(() => ({ data: { success: false } })),
        api.get("/invoices/admin").catch(() => ({ data: { success: false } })),
        api.get("/products?limit=100&includeHidden=true").catch(() => ({ data: { success: false } })),
        api.get("/auth/users").catch(() => ({ data: { success: false } })),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setRecentOrders(statsRes.data.recentOrders || []);
        setLowStockAlerts(statsRes.data.lowStockAlerts || []);
        setSalesTrend(statsRes.data.salesTrend || []);
      }
      if (ordRes.data.success) setOrders(ordRes.data.orders);
      if (custRes.data.success) setCustomOrders(custRes.data.customOrders);
      if (tickRes.data.success)
        setTickets(ordRes.data.success ? tickRes.data.tickets : []);
      if (coupRes && coupRes.data.success) setCoupons(coupRes.data.coupons);
      if (invRes && invRes.data.success) setInvoices(invRes.data.invoices);
      if (prodRes && prodRes.data.success) setProducts(prodRes.data.products);
      if (usersRes && usersRes.data.success) setCustomers(usersRes.data.users);
    } catch (err) {
      console.error("Failed to load admin panel data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalyticsOnly = async (period) => {
    try {
      const statsRes = await api.get(`/analytics/dashboard?period=${period}`);
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setSalesTrend(statsRes.data.salesTrend || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      setTimeout(() => loadAnalyticsOnly(analyticsPeriod), 0);
    }
  }, [analyticsPeriod]);

  // Edit / Reply states
  const [quoteInputs, setQuoteInputs] = useState({});
  const [quoteStatusInputs, setQuoteStatusInputs] = useState({});
  const [customChatInputs, setCustomChatInputs] = useState({});

  const [ticketReplyInputs, setTicketReplyInputs] = useState({});
  const [ticketStatusInputs, setTicketStatusInputs] = useState({});

  // Product creation/edit form
  const [editingProductId, setEditingProductId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newStock, setNewStock] = useState("10");
  const [newWeight, setNewWeight] = useState("100");
  const [newLength, setNewLength] = useState("50");
  const [newWidth, setNewWidth] = useState("50");
  const [newHeight, setNewHeight] = useState("50");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  useEffect(() => {
    if (!isAuthenticated) {
      setTimeout(() => {
        setStats({
          totalRevenue: 0,
          totalOrdersCount: 0,
          totalCustomersCount: 0,
          activeCustomPrintsCount: 0,
        });
        setRecentOrders([]);
        setLowStockAlerts([]);
        setOrders([]);
        setCustomOrders([]);
        setTickets([]);
        setCoupons([]);
        setInvoices([]);
        setProducts([]);
        setCustomers([]);
      }, 0);
      router.push("/login");
      return;
    }
    if (user && user.role !== "admin") {
      router.push("/");
      return;
    }

    loadAdminData();
  }, [isAuthenticated, user, router]);

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status });
      if (res.data.success) {
        setOrders(
          orders.map((o) =>
            o._id === orderId ? { ...o, orderStatus: status } : o,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleSaveQuote = async (orderId) => {
    const quotePrice = quoteInputs[orderId];
    const status = quoteStatusInputs[orderId];
    const message = customChatInputs[orderId];

    if (!quotePrice && !status && !message) return;

    try {
      const res = await api.put(`/custom-orders/${orderId}/quote`, {
        adminQuotedPrice: quotePrice ? Number(quotePrice) : undefined,
        status: status || undefined,
        systemMessage: message || undefined,
      });

      if (res.data.success) {
        setCustomOrders(
          customOrders.map((c) =>
            c._id === orderId ? res.data.customOrder : c,
          ),
        );
        // clear inputs
        setCustomChatInputs({ ...customChatInputs, [orderId]: "" });
        alert("Custom design quote saved successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await api.delete(`/auth/users/${userId}`);
      if (res.data.success) {
        setCustomers(customers.filter(c => c._id !== userId));
        setStats(prev => ({ ...prev, totalCustomersCount: Math.max(0, prev.totalCustomersCount - 1) }));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleSendTicketReply = async (ticketId) => {
    const reply = ticketReplyInputs[ticketId];
    const status = ticketStatusInputs[ticketId];

    if (!reply && !status) return;

    try {
      const res = await api.post(`/support/tickets/${ticketId}/reply`, {
        message: reply || "Status updated by admin",
        status: status || undefined,
      });
      if (res.data.success) {
        setTickets(
          tickets.map((t) => (t._id === ticketId ? res.data.ticket : t)),
        );
        setTicketReplyInputs({ ...ticketReplyInputs, [ticketId]: "" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/coupons", newCouponForm);
      if (res.data.success) {
        setCoupons([...coupons, res.data.coupon]);
        setNewCouponForm({
          code: "",
          discountType: "percentage",
          discountValue: "",
          expiryDate: "",
          usageLimit: 100,
        });
        alert("Coupon created!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create coupon");
    }
  };

  const handleUpdateCoupon = async (id) => {
    try {
      const res = await api.put(`/coupons/${id}`, editCouponForm);
      if (res.data.success) {
        setCoupons(coupons.map((c) => (c._id === id ? res.data.coupon : c)));
        setEditingCouponId(null);
        alert("Coupon updated!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update coupon");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setFormError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result;
        const res = await api.post("/upload", {
          image: base64String,
          filename: file.name,
        });

        if (res.data.success) {
          setNewImageUrl(res.data.url);
        } else {
          setFormError("Upload failed: " + res.data.message);
        }
      } catch (err) {
        setFormError(
          "Upload failed: " + (err.response?.data?.message || err.message),
        );
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateProductSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Hardcode category logic for demo database references
    let categoriesList = [];
    try {
      const catRes = await api.get("/categories");
      categoriesList = catRes.data.categories;
    } catch (err) {
      console.log("Failed to fetch categories list");
    }

    const matchedCat =
      categoriesList.find(
        (c) => c.slug === newCategory || c.name === newCategory,
      ) || categoriesList[0];
    if (!matchedCat) {
      setFormError("No catalog categories found. Please run seed script.");
      return;
    }

    const payload = {
      title: newTitle,
      description: newDesc,
      basePrice: Number(newPrice),
      category: matchedCat._id,
      images: newImageUrl
        ? [newImageUrl]
        : [
            "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
          ],
      inventory: Number(newStock),
      weight: newWeight,
      dimensions: {
        length: newLength ? Number(newLength) : undefined,
        width: newWidth ? Number(newWidth) : undefined,
        height: newHeight ? Number(newHeight) : undefined,
      },
      isFeatured,
      isNewArrival,
      isBestseller,
      isHidden,
    };

    try {
      let res;
      if (editingProductId) {
        res = await api.put(`/products/${editingProductId}`, payload);
      } else {
        res = await api.post("/products", payload);
      }

      if (res.data.success) {
        setFormSuccess(
          editingProductId 
            ? "Product updated successfully in the catalog!" 
            : "Product created successfully and catalog updated!"
        );
        
        // Update local state without reloading
        if (editingProductId) {
          setProducts(products.map(p => p._id === editingProductId ? res.data.product : p));
        } else {
          setProducts([res.data.product, ...products]);
        }

        cancelProductEdit();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || `Failed to ${editingProductId ? 'update' : 'create'} product`);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this product?")) return;
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data.success) {
        setProducts(products.filter(p => p._id !== id));
        if (editingProductId === id) cancelProductEdit();
        alert("Product deleted successfully");
      }
    } catch (err) {
      alert("Failed to delete product: " + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleVisibility = async (id, currentHiddenStatus) => {
    try {
      const res = await api.put(`/products/${id}`, { isHidden: !currentHiddenStatus });
      if (res.data.success) {
        setProducts(products.map(p => p._id === id ? res.data.product : p));
      }
    } catch (err) {
      alert("Failed to update visibility: " + (err.response?.data?.message || err.message));
    }
  };

  const cancelProductEdit = () => {
    setEditingProductId(null);
    setNewTitle("");
    setNewPrice("");
    setNewDesc("");
    setNewImageUrl("");
    setNewCategory("");
    setNewStock("10");
    setNewWeight("100");
    setNewLength("50");
    setNewWidth("50");
    setNewHeight("50");
    setIsFeatured(false);
    setIsNewArrival(true);
    setIsBestseller(false);
    setIsHidden(false);
    setFormError(null);
    setTimeout(() => setFormSuccess(null), 3000);
  };

  if (!isClient || isLoading || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative min-h-[90vh] transition-colors duration-300 `}>
      <div className="absolute top-[10%] left-10 h-[300px] w-[300px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      {/* Header title */}
      <div className="flex justify-between items-center mb-10 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            <span>Zortuner Admin Panel</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Marketplace revenues & print management systems
          </p>
        </div>
        <button
          onClick={() => setAdminTheme(adminTheme === "light" ? "dark" : "light")}
          className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200 shadow-sm"
          title={`Switch to ${adminTheme === "light" ? "dark" : "light"} mode`}
        >
          {adminTheme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
      </div>

      {/* Key performance indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          {
            title: "Total Revenue",
            value: `₹${stats.totalRevenue}`,
            icon: <DollarSign className="h-5 w-5 text-emerald-400" />,
          },
          {
            title: "Store Orders",
            value: stats.totalOrdersCount,
            icon: <ShoppingBag className="h-5 w-5 text-primary" />,
          },
          {
            title: "Registered Customers",
            value: stats.totalCustomersCount,
            icon: <UserCheck className="h-5 w-5 text-accent" />,
            tab: "customers",
          },
          {
            title: "STL Custom Queue",
            value: stats.activeCustomPrintsCount,
            icon: <Layers className="h-5 w-5 text-indigo-400" />,
            tab: "custom",
          },
        ].map((kpi, idx) => (
          <div
            key={idx}
            className="glass-panel border border-slate-200 rounded-lg p-6 flex justify-between items-center"
          >
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                {kpi.title}
              </span>
              <span className="text-2xl font-black text-slate-900">
                {kpi.value}
              </span>
            </div>
            <div 
              className={`rounded-xl bg-slate-100 p-3 ${kpi.tab ? "cursor-pointer hover:bg-slate-200 transition-colors shadow-sm" : ""}`}
              onClick={() => kpi.tab && setActiveTab(kpi.tab)}
            >
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Grid body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 glass-panel border border-slate-200 rounded-lg p-4 flex flex-col gap-1.5">
          {[
            {
              id: "analytics",
              name: "Analytics",
              icon: <BarChart3 className="h-4 w-4" />,
            },
            {
              id: "customers",
              name: "Registered Customers",
              icon: <UserCheck className="h-4 w-4" />,
            },
            {
              id: "orders",
              name: "Order Logs",
              icon: <ShoppingBag className="h-4 w-4" />,
            },
            {
              id: "custom",
              name: "STL Submissions",
              icon: <Layers className="h-4 w-4" />,
            },
            {
              id: "invoices",
              name: "Invoices",
              icon: <FileText className="h-4 w-4" />,
            },
            {
              id: "tickets",
              name: "Support Channels",
              icon: <MessageSquare className="h-4 w-4" />,
            },
            {
              id: "products",
              name: "Catalogue Editor",
              icon: <Plus className="h-4 w-4" />,
            },
            {
              id: "coupons",
              name: "Coupons Manager",
              icon: <Tag className="h-4 w-4" />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 text-left text-sm py-2.5 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-primary/20 text-slate-900 font-semibold"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </aside>

        {/* Dashboard content */}
        <main className="lg:col-span-9 flex flex-col gap-6">
          {loading ? (
            <div className="glass-panel border border-slate-200 rounded-xl p-16 flex justify-center items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* --- ANALYTICS DASHBOARD TAB --- */}
              {activeTab === "analytics" && (
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Sales Analytics
                    </h2>
                    <div className="flex bg-slate-100 rounded-xl p-1 shadow-sm border border-slate-200">
                      {["day", "month", "year"].map((period) => (
                        <button
                          key={period}
                          onClick={() => setAnalyticsPeriod(period)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer ${
                            analyticsPeriod === period
                              ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="glass-panel border border-slate-200 rounded-lg p-6">
                    <h3 className="text-sm font-semibold text-slate-800 mb-6">
                      Orders & Revenue Trend
                    </h3>

                    {salesTrend.length === 0 ? (
                      <div className="flex justify-center items-center h-48 text-slate-400 text-sm">
                        No data available for this period.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-end gap-2 h-48 w-full border-b border-slate-200 pb-2">
                          {salesTrend.map((data, idx) => {
                            const maxCount = Math.max(
                              ...salesTrend.map((d) => d.count),
                              1,
                            );
                            const heightPercentage =
                              (data.count / maxCount) * 100;
                            return (
                              <div
                                key={idx}
                                className="flex flex-col justify-end items-center flex-1 group"
                              >
                                <div className="relative w-full flex justify-center">
                                  {/* Tooltip */}
                                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap pointer-events-none z-10 flex flex-col items-center">
                                    <span>Orders: {data.count}</span>
                                    <span className="text-emerald-400 font-bold">
                                      ₹{data.revenue}
                                    </span>
                                  </div>
                                  {/* Bar */}
                                  <div
                                    className="w-full max-w-[40px] bg-primary/80 group-hover:bg-primary rounded-t-sm transition-all"
                                    style={{
                                      height: `${heightPercentage}%`,
                                      minHeight: "4px",
                                    }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex gap-2 w-full text-[10px] text-slate-500 font-medium">
                          {salesTrend.map((data, idx) => {
                            let label = "";
                            if (analyticsPeriod === "day") {
                              label = `${data._id.day}/${data._id.month}`;
                            } else if (analyticsPeriod === "month") {
                              const date = new Date(
                                data._id.year,
                                data._id.month - 1,
                              );
                              label = date.toLocaleString("default", {
                                month: "short",
                              });
                            } else {
                              label = data._id.year;
                            }
                            return (
                              <div
                                key={idx}
                                className="flex-1 text-center truncate"
                              >
                                {label}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- ORDER LOGS TAB --- */}
              {activeTab === "orders" && (
                <div className="flex flex-col gap-4">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Order Logs
                  </h2>
                  {orders.length === 0 ? (
                    <p className="text-slate-500 text-sm">No orders found.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {orders.map((order) => (
                        <div
                          key={order._id}
                          onClick={() => router.push(`/admin/orders/${order._id}`)}
                          className="glass-panel border border-slate-200 rounded-lg p-5 flex flex-col gap-4 cursor-pointer hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group bg-white"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Order
                              </span>
                              <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                                #{formatOrderNumber(order._id, order.createdAt)}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] sm:text-xs font-bold rounded-full px-2 py-1 ${getStatusColor(order.orderStatus)}`}
                            >
                              {order.orderStatus}
                            </span>
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              Customer
                            </span>
                            <span className="text-sm text-slate-700 font-medium truncate">
                              {order.user?.name || "Unknown User"}
                            </span>
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              Date
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-end">
                            <span className="text-xs text-slate-500 font-semibold">
                              {order.orderItems?.length || 0} items
                            </span>
                            <span className="text-base font-extrabold text-slate-900">
                              ₹{order.priceDetails?.totalPrice}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* --- CUSTOMERS TAB --- */}
              {activeTab === "customers" && (
                <div className="flex flex-col gap-4">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Registered Customers
                  </h2>
                  {customers.length === 0 ? (
                    <p className="text-slate-500 text-sm">No customers found.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {customers.map((customer) => (
                        <div
                          key={customer._id}
                          className="glass-panel border border-slate-200 rounded-lg p-5 flex flex-col gap-3"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 text-base">{customer.name}</span>
                              <span className="text-xs text-slate-500">{customer.email}</span>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-semibold border border-slate-200">
                                Joined {new Date(customer.createdAt).toLocaleDateString()}
                              </span>
                              <button
                                onClick={() => handleDeleteUser(customer._id)}
                                className="text-[10px] bg-red-500/10 text-red-600 hover:bg-red-500/20 px-2 py-1 rounded-md font-semibold border border-red-500/20 transition-colors"
                              >
                                Remove User
                              </button>
                            </div>
                          </div>
                          
                          {customer.contact && (
                            <div className="text-xs text-slate-600 flex items-center gap-2 border-t border-slate-100 pt-3">
                              <span className="font-semibold text-slate-800">Contact:</span> {customer.contact}
                            </div>
                          )}

                          {customer.addresses && customer.addresses.length > 0 && (
                            <div className="flex flex-col gap-1 mt-1 text-xs text-slate-500">
                              <span className="font-semibold text-slate-800 border-t border-slate-100 pt-2">Saved Addresses:</span>
                              {customer.addresses.map((addr, idx) => (
                                <span key={addr._id || idx} className="block truncate">
                                  • {addr.street}, {addr.city}, {addr.state} {addr.postalCode}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* --- INVOICES TAB --- */}
              {activeTab === "invoices" && (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Invoice Management
                    </h2>
                    <button
                      onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8," 
                          + "Invoice Number,Order ID,Customer Name,Customer Email,Total Amount,Status,Date\n"
                          + invoices.map(inv => 
                            `${inv.invoiceNumber},${inv.order?._id},"${inv.user?.name}","${inv.user?.email}",${inv.orderTotal},${inv.paymentStatus},${new Date(inv.generatedDate).toLocaleDateString()}`
                          ).join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "invoices.csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-xs font-bold text-white shadow cursor-pointer"
                    >
                      Export CSV
                    </button>
                  </div>
                  {invoices.length === 0 ? (
                    <p className="text-slate-500 text-sm">No invoices found.</p>
                  ) : (
                    invoices.map((invoice) => (
                      <div
                        key={invoice._id}
                        className="glass-panel border border-slate-200 rounded-lg p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                      >
                        <div className="flex flex-col gap-1.5">
                          <span className="font-bold text-slate-900 text-sm">{invoice.invoiceNumber}</span>
                          <span className="text-xs text-slate-500">
                            Order #{formatOrderNumber(invoice.order?._id, invoice.createdAt)} • {invoice.user?.name} ({invoice.user?.email})
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                          <span className="font-bold text-slate-900">₹{invoice.orderTotal}</span>
                          <span className="text-xs rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 font-bold">
                            {invoice.paymentStatus}
                          </span>
                          <button
                            onClick={async () => {
                              try {
                                const response = await api.get(`/invoices/${invoice._id}/download`, { responseType: 'blob' });
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', `Invoice_${invoice.invoiceNumber}.pdf`);
                                document.body.appendChild(link);
                                link.click();
                                link.parentNode.removeChild(link);
                              } catch(e) {
                                console.error('Download failed', e);
                                alert('Failed to download invoice');
                              }
                            }}
                            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer ${adminTheme === "dark" ? "bg-purple-500/20 text-purple-300 hover:bg-purple-500 hover:text-white" : "text-primary bg-primary/10 hover:bg-primary hover:text-white"}`}
                          >
                            Download
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const res = await api.post(`/invoices/${invoice._id}/resend`);
                                if (res.data.success) {
                                  alert('Invoice email resent successfully');
                                }
                              } catch(e) {
                                console.error('Failed to resend email', e);
                                alert('Failed to resend email');
                              }
                            }}
                            className="text-xs text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                          >
                            Resend Email
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* --- STL SUBMISSIONS TAB --- */}
              {activeTab === "custom" && (
                <div className="flex flex-col gap-4">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    STL Submissions Reviews
                  </h2>
                  {customOrders.length === 0 ? (
                    <p className="text-slate-500 text-sm">
                      No custom prints submitted.
                    </p>
                  ) : (
                    customOrders.map((order) => (
                      <div
                        key={order._id}
                        className="glass-panel border border-slate-200 rounded-lg p-6 flex flex-col gap-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] text-slate-500 block">
                              Submitted by: {order.user?.name} (
                              {order.user?.email})
                            </span>
                            <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                              {order.fileName}
                            </span>
                            <span className="text-[10px] text-slate-500 block mt-1">
                              Dimensions: {order.dimensions?.length}x
                              {order.dimensions?.width}x
                              {order.dimensions?.height}mm • Volume:{" "}
                              {order.volume}cm³
                            </span>
                          </div>

                          <a
                            href={order.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={order.fileName}
                            className="rounded-full bg-slate-100 border border-slate-200 px-4 py-1.5 text-[10px] text-slate-700 hover:text-slate-900 cursor-pointer"
                          >
                            Download File
                          </a>
                        </div>

                        {/* Chat transcript history details */}
                        {order.chatHistory && order.chatHistory.length > 0 && (
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col gap-2 max-h-32 overflow-y-auto">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block border-b border-slate-200 pb-1">
                              Discussion History
                            </span>
                            {order.chatHistory.map((chat, idx) => (
                              <div key={idx} className="text-xs">
                                <span
                                  className={
                                    chat.sender === "admin"
                                      ? "text-primary font-bold"
                                      : "text-accent font-bold"
                                  }
                                >
                                  {chat.sender === "admin"
                                    ? "Admin: "
                                    : "User: "}
                                </span>
                                <span className="text-slate-700">
                                  {chat.message}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Pricing update controls */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 border-t border-slate-200 pt-4 mt-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-500 font-bold uppercase">
                              Quoted Price (₹)
                            </label>
                            <input
                              type="number"
                              placeholder={
                                order.adminQuotedPrice || order.estimatedPrice
                              }
                              value={quoteInputs[order._id] || ""}
                              onChange={(e) =>
                                setQuoteInputs({
                                  ...quoteInputs,
                                  [order._id]: e.target.value,
                                })
                              }
                              className="rounded-lg bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-500 font-bold uppercase">
                              Update Status
                            </label>
                            <StatusDropdown
                              value={
                                quoteStatusInputs[order._id] || order.status
                              }
                              options={[
                                "Pending Quote",
                                "Quoted",
                                "Approved",
                                "Printing",
                                "Shipped",
                                "Delivered",
                                "Cancelled",
                              ]}
                              onChange={(val) =>
                                setQuoteStatusInputs({
                                  ...quoteStatusInputs,
                                  [order._id]: val,
                                })
                              }
                            />
                          </div>

                          <div className="flex flex-col gap-1 sm:col-span-2">
                            <label className="text-[10px] text-slate-500 font-bold uppercase">
                              Reply / Note Message
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Send note to user..."
                                value={customChatInputs[order._id] || ""}
                                onChange={(e) =>
                                  setCustomChatInputs({
                                    ...customChatInputs,
                                    [order._id]: e.target.value,
                                  })
                                }
                                className="flex-grow rounded-lg bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none"
                              />
                              <button
                                onClick={() => handleSaveQuote(order._id)}
                                className="rounded-lg bg-primary px-3 py-1.5 text-white flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs shadow-sm hover:opacity-90"
                              >
                                <Save className="h-4 w-4" /> Save
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* --- SUPPORT TICKETS TAB --- */}
              {activeTab === "tickets" && (
                <div className="flex flex-col gap-4">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Customer Support Channels
                  </h2>
                  {tickets.length === 0 ? (
                    <p className="text-slate-500 text-sm">
                      No support tickets.
                    </p>
                  ) : (
                    tickets.map((ticket) => (
                      <div
                        key={ticket._id}
                        className="glass-panel border border-slate-200 rounded-lg p-6 flex flex-col gap-4"
                      >
                        <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                          <div>
                            <span className="text-[10px] text-slate-500 block">
                              User: {ticket.user?.name || ticket.guestName} ({ticket.user?.email || ticket.guestEmail}) {!ticket.user && <span className="font-bold text-accent"> [Guest]</span>}
                            </span>
                            <span className="font-bold text-slate-900 text-sm block mt-0.5">
                              {ticket.subject}
                            </span>
                          </div>
                          <span
                            className={`text-xs rounded-full border px-3 py-1 font-bold ${ticket.status === "Resolved" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : ticket.status === "In Progress" ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}`}
                          >
                            {ticket.status}
                          </span>
                        </div>

                        {/* Conversation log list */}
                        <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-2">
                          {ticket.messages.map((m, i) => (
                            <div
                              key={i}
                              className="text-xs leading-relaxed text-slate-500"
                            >
                              <span
                                className={
                                  m.sender === "admin"
                                    ? "text-primary font-bold"
                                    : "text-accent font-bold"
                                }
                              >
                                {m.sender === "admin" ? "You: " : "Customer: "}
                              </span>
                              <span>{m.message}</span>
                            </div>
                          ))}
                        </div>

                        {/* Reply inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-200 pt-4 mt-2">
                          <StatusDropdown
                            value={
                              ticketStatusInputs[ticket._id] || ticket.status
                            }
                            options={["Open", "In Progress", "Resolved"]}
                            onChange={(val) =>
                              setTicketStatusInputs({
                                ...ticketStatusInputs,
                                [ticket._id]: val,
                              })
                            }
                          />

                          <div className="flex gap-2 sm:col-span-2">
                            <input
                              type="text"
                              placeholder="Write reply..."
                              value={ticketReplyInputs[ticket._id] || ""}
                              onChange={(e) =>
                                setTicketReplyInputs({
                                  ...ticketReplyInputs,
                                  [ticket._id]: e.target.value,
                                })
                              }
                              className="flex-grow rounded-lg bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none"
                            />
                            <button
                              onClick={() => handleSendTicketReply(ticket._id)}
                              className="rounded-lg bg-primary px-4 text-xs font-semibold text-white cursor-pointer hover:bg-primary/90 transition-colors shadow-sm"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* --- COUPONS TAB --- */}
              {activeTab === "coupons" && (
                <div className="flex flex-col gap-6">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Coupons Manager
                  </h2>

                  {/* Create Coupon Form */}
                  <form
                    onSubmit={handleCreateCoupon}
                    className="glass-panel border border-slate-200 rounded-lg p-6 flex flex-col gap-4 bg-white/50"
                  >
                    <h3 className="text-sm font-bold text-slate-800">
                      Create New Coupon
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      <input
                        type="text"
                        placeholder="CODE"
                        required
                        value={newCouponForm.code}
                        onChange={(e) =>
                          setNewCouponForm({
                            ...newCouponForm,
                            code: e.target.value,
                          })
                        }
                        className="rounded-xl bg-white border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none uppercase"
                      />
                      <select
                        value={newCouponForm.discountType}
                        onChange={(e) =>
                          setNewCouponForm({
                            ...newCouponForm,
                            discountType: e.target.value,
                          })
                        }
                        className="rounded-xl bg-white border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none"
                      >
                        <option value="percentage">Percentage %</option>
                        <option value="flat">Flat Amount ₹</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Value"
                        required
                        value={newCouponForm.discountValue}
                        onChange={(e) =>
                          setNewCouponForm({
                            ...newCouponForm,
                            discountValue: e.target.value,
                          })
                        }
                        className="rounded-xl bg-white border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none"
                      />
                      <input
                        type="date"
                        required
                        value={newCouponForm.expiryDate}
                        onChange={(e) =>
                          setNewCouponForm({
                            ...newCouponForm,
                            expiryDate: e.target.value,
                          })
                        }
                        className="rounded-xl bg-white border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Usage Limit"
                        value={newCouponForm.usageLimit}
                        onChange={(e) =>
                          setNewCouponForm({
                            ...newCouponForm,
                            usageLimit: e.target.value,
                          })
                        }
                        className="rounded-xl bg-white border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-lg bg-primary text-white font-bold py-2 text-xs cursor-pointer w-fit px-6 shadow-sm"
                    >
                      Create Coupon
                    </button>
                  </form>

                  {/* List Coupons */}
                  <div className="flex flex-col gap-3">
                    {coupons.map((coupon) => (
                      <div
                        key={coupon._id}
                        className="glass-panel border border-slate-200 rounded-xl p-4 flex flex-col gap-3"
                      >
                        {editingCouponId === coupon._id ? (
                          <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                              <input
                                type="text"
                                value={editCouponForm.code}
                                onChange={(e) =>
                                  setEditCouponForm({
                                    ...editCouponForm,
                                    code: e.target.value,
                                  })
                                }
                                className="rounded-lg border px-2 py-1.5 text-xs uppercase outline-none"
                              />
                              <select
                                value={editCouponForm.discountType}
                                onChange={(e) =>
                                  setEditCouponForm({
                                    ...editCouponForm,
                                    discountType: e.target.value,
                                  })
                                }
                                className="rounded-lg border px-2 py-1.5 text-xs outline-none"
                              >
                                <option value="percentage">Percentage %</option>
                                <option value="flat">Flat Amount ₹</option>
                              </select>
                              <input
                                type="number"
                                value={editCouponForm.discountValue}
                                onChange={(e) =>
                                  setEditCouponForm({
                                    ...editCouponForm,
                                    discountValue: e.target.value,
                                  })
                                }
                                className="rounded-lg border px-2 py-1.5 text-xs outline-none"
                              />
                              <input
                                type="date"
                                value={editCouponForm.expiryDate}
                                onChange={(e) =>
                                  setEditCouponForm({
                                    ...editCouponForm,
                                    expiryDate: e.target.value,
                                  })
                                }
                                className="rounded-lg border px-2 py-1.5 text-xs outline-none"
                              />
                              <input
                                type="number"
                                value={editCouponForm.usageLimit}
                                onChange={(e) =>
                                  setEditCouponForm({
                                    ...editCouponForm,
                                    usageLimit: e.target.value,
                                  })
                                }
                                className="rounded-lg border px-2 py-1.5 text-xs outline-none"
                              />
                              <select
                                value={editCouponForm.active}
                                onChange={(e) =>
                                  setEditCouponForm({
                                    ...editCouponForm,
                                    active: e.target.value === "true",
                                  })
                                }
                                className="rounded-lg border px-2 py-1.5 text-xs outline-none"
                              >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateCoupon(coupon._id)}
                                className="bg-primary text-slate-900 px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                              >
                                Save Changes
                              </button>
                              <button
                                onClick={() => setEditingCouponId(null)}
                                className="bg-slate-200 text-slate-600 px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
                              <span className="font-mono font-bold text-lg text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                                {coupon.code}
                              </span>
                              <div className="flex flex-col text-xs text-slate-500">
                                <span className="font-semibold text-slate-800">
                                  {coupon.discountType === "percentage"
                                    ? `${coupon.discountValue}% OFF`
                                    : `₹${coupon.discountValue} OFF`}
                                </span>
                                <span>
                                  Expires:{" "}
                                  {new Date(
                                    coupon.expiryDate,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex flex-col text-xs text-slate-500 sm:border-l border-slate-200 sm:pl-4">
                                <span>
                                  Used: {coupon.usageCount} /{" "}
                                  {coupon.usageLimit}
                                </span>
                                <span
                                  className={
                                    coupon.active
                                      ? "text-emerald-500 font-bold"
                                      : "text-red-500 font-bold"
                                  }
                                >
                                  {coupon.active ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setEditingCouponId(coupon._id);
                                setEditCouponForm({
                                  code: coupon.code,
                                  discountType: coupon.discountType,
                                  discountValue: coupon.discountValue,
                                  expiryDate: new Date(coupon.expiryDate)
                                    .toISOString()
                                    .split("T")[0],
                                  usageLimit: coupon.usageLimit,
                                  active: coupon.active,
                                });
                              }}
                              className="text-slate-500 hover:text-primary bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl cursor-pointer transition-colors shadow-sm border border-slate-200"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- CATALOG EDIT TAB --- */}
              {activeTab === "products" && (
                <div className="flex flex-col gap-6">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    {editingProductId ? "Catalogue Editor (Update Design)" : "Catalogue Editor (Add Design Product)"}
                  </h2>

                  <form
                    onSubmit={handleCreateProductSubmit}
                    className="glass-panel border border-slate-200 rounded-lg p-4 flex flex-col gap-2"
                  >
                    {formError && (
                      <p className="text-red-400 text-xs text-center">
                        {formError}
                      </p>
                    )}
                    {formSuccess && (
                      <p className="text-emerald-400 text-xs text-center">
                        {formSuccess}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Design Title
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Aura Geometric Vase"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="rounded-xl bg-white border border-slate-300 px-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Retail Base Price (₹)
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="890"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          className="rounded-xl bg-white border border-slate-300 px-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Design Description
                      </label>
                      <textarea
                        required
                        rows={1}
                        placeholder="Describe the 3D model properties..."
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        className="rounded-xl bg-white border border-slate-300 px-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Category Select
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="rounded-xl bg-white border border-slate-300 px-4 py-1.5 text-xs text-slate-800 outline-none"
                        >
                          <option value="Home Decor">Home Decor</option>
                          <option value="Anime Figures">Anime Figures</option>
                          <option value="Gaming Accessories">
                            Gaming Accessories
                          </option>
                          <option value="Desk Accessories">
                            Desk Accessories
                          </option>
                          <option value="Lamps & Lighting">
                            Lamps & Lighting
                          </option>
                          <option value="Personalized Gifts">
                            Personalized Gifts
                          </option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Stock Inventory
                        </label>
                        <input
                          type="number"
                          value={newStock}
                          onChange={(e) => setNewStock(e.target.value)}
                          className="rounded-xl bg-white border border-slate-300 px-4 py-1.5 text-xs text-slate-800 outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Weight (g)
                        </label>
                        <input
                          type="text"
                          value={newWeight}
                          onChange={(e) => setNewWeight(e.target.value)}
                          className="rounded-xl bg-white border border-slate-300 px-4 py-1.5 text-xs text-slate-800 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 border-t border-slate-200 pt-2 mt-1">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Length (mm)
                        </label>
                        <input
                          type="number"
                          value={newLength}
                          onChange={(e) => setNewLength(e.target.value)}
                          className="rounded-xl bg-white border border-slate-300 px-4 py-1.5 text-xs text-slate-800 outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Width (mm)
                        </label>
                        <input
                          type="number"
                          value={newWidth}
                          onChange={(e) => setNewWidth(e.target.value)}
                          className="rounded-xl bg-white border border-slate-300 px-4 py-1.5 text-xs text-slate-800 outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Height (mm)
                        </label>
                        <input
                          type="number"
                          value={newHeight}
                          onChange={(e) => setNewHeight(e.target.value)}
                          className="rounded-xl bg-white border border-slate-300 px-4 py-1.5 text-xs text-slate-800 outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 sm:col-span-3">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Image (Upload or URL)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. https://images.unsplash.com/photo-..."
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            className="flex-grow rounded-xl bg-white border border-slate-300 px-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none"
                          />
                          <label
                            className={`cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-1.5 rounded-xl text-xs font-bold transition-colors border border-slate-300 whitespace-nowrap flex items-center justify-center ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {isUploading ? "Uploading..." : "Choose File"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                              disabled={isUploading}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:col-span-3 glass-panel p-2 rounded-xl border border-slate-200 mt-1">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Showcase Visibility
                        </label>
                        <div className="flex flex-wrap gap-3">
                          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isNewArrival}
                              onChange={(e) =>
                                setIsNewArrival(e.target.checked)
                              }
                              className="accent-primary h-4 w-4 rounded border-slate-300"
                            />
                            <span>New Arrival</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isFeatured}
                              onChange={(e) => setIsFeatured(e.target.checked)}
                              className="accent-primary h-4 w-4 rounded border-slate-300"
                            />
                            <span>Featured Product</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isBestseller}
                              onChange={(e) =>
                                setIsBestseller(e.target.checked)
                              }
                              className="accent-primary h-4 w-4 rounded border-slate-300"
                            />
                            <span>Bestseller</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isHidden}
                              onChange={(e) => setIsHidden(e.target.checked)}
                              className="accent-primary h-4 w-4 rounded border-slate-300"
                            />
                            <span>Hide from Users</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-slate-100">
                      {editingProductId && (
                        <button
                          type="button"
                          onClick={cancelProductEdit}
                          className="px-6 py-2 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-sm rounded-lg border border-slate-200 transition-all shadow-sm"
                        >
                          Cancel
                        </button>
                      )}
                      
                      <button
                        type="submit"
                        className={`px-8 py-2 text-white font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
                          editingProductId 
                            ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200" 
                            : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                        }`}
                      >
                        <Save className="h-4 w-4" />
                        {editingProductId ? "Update Catalog" : "Publish to Catalog"}
                      </button>
                    </div>
                  </form>

                  {/* MANAGE CATALOG SECTION */}
                  <div className="mt-8 flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">
                      Manage Existing Catalog
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {products.map((product) => (
                        <div key={product._id} className={`glass-panel border border-slate-200 rounded-lg p-3 flex gap-4 items-center relative overflow-hidden group ${product.isHidden ? "opacity-60 bg-slate-50" : ""}`}>
                          <img 
                            src={product.images?.[0] || 'https://via.placeholder.com/64'} 
                            alt={product.title}
                            className="w-16 h-16 object-cover rounded-lg bg-slate-100 shrink-0"
                          />
                          <div className="flex flex-col flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 truncate">{product.title}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-semibold text-emerald-600">₹{product.basePrice}</span>
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">Stock: {product.inventory}</span>
                            </div>
                          </div>

                          <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-1 rounded-lg shadow-sm border border-slate-100">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProductId(product._id);
                                setNewTitle(product.title);
                                setNewPrice(product.basePrice);
                                setNewDesc(product.description);
                                setNewImageUrl(product.images?.[0] || "");
                                setNewCategory(product.category?.slug || product.category?.name || "Home Decor");
                                setNewStock(product.inventory);
                                setNewWeight(product.weight || 100);
                                setNewLength(product.dimensions?.length || 50);
                                setNewWidth(product.dimensions?.width || 50);
                                setNewHeight(product.dimensions?.height || 50);
                                setIsFeatured(product.isFeatured || false);
                                setIsNewArrival(product.isNewArrival || false);
                                setIsBestseller(product.isBestseller || false);
                                setIsHidden(product.isHidden || false);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleVisibility(product._id, product.isHidden)}
                              className={`p-1.5 rounded-md transition-colors ${product.isHidden ? "text-slate-500 hover:bg-slate-200" : "text-emerald-600 hover:bg-emerald-100"}`}
                              title={product.isHidden ? "Unhide Product" : "Hide Product"}
                            >
                              {product.isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product._id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {products.length === 0 && !loading && (
                        <div className="col-span-full py-8 text-center text-slate-500 text-sm">
                          No products found in the catalog.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
