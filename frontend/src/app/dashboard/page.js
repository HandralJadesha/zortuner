"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  ShoppingBag,
  Layers,
  MessageSquare,
  Plus,
  Send,
  Clipboard,
  BadgeAlert,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react";
import { api } from "../../lib/api.js";
import { useAuthStore } from "../../store/authStore.js";
import { formatOrderNumber } from "../../lib/formatters.js";
export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, initialize, isLoading } =
    useAuthStore(); /* Tab switching */
  const [activeTab, setActiveTab] =
    useState("orders"); /* orders | custom | tickets | profile */
  /* Loaded collections */
  const [orders, setOrders] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true); /* Modal / detail states */
  const [activeCustomChatId, setActiveCustomChatId] = useState(null);
  const [customChatMessages, setCustomChatMessages] = useState([]);
  const [customChatInput, setCustomChatInput] = useState("");
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [ticketReplyInput, setTicketReplyInput] =
    useState(""); /* Support ticket form */
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketMessage, setNewTicketMessage] = useState("");
  const [ticketFormOpen, setTicketFormOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null); /* Address edit state */
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editStreet, setEditStreet] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editPostalCode, setEditPostalCode] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  const { updateUser } = useAuthStore();
  const handleEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setEditStreet(addr.street);
    setEditCity(addr.city);
    setEditState(addr.state);
    setEditPostalCode(addr.postalCode);
  };
  const handleUpdateAddress = async (addressId) => {
    try {
      const res = await api.put(`/auth/address/${addressId}`, {
        street: editStreet,
        city: editCity,
        state: editState,
        postalCode: editPostalCode,
        country: "India",
      });
      if (res.data.success) {
        updateUser({ addresses: res.data.addresses });
        setEditingAddressId(null);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update address");
    }
  };
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?"))
      return;
    try {
      const res = await api.delete(`/auth/address/${addressId}`);
      if (res.data.success) {
        updateUser({ addresses: res.data.addresses });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete address");
    }
  };
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

  const getEstimatedDelivery = (status, createdAt) => {
    if (status === "Delivered") return "Delivered";
    if (status === "Cancelled") return "Cancelled";
    
    const orderDate = new Date(createdAt);
    const estDeliveryDate = new Date(orderDate.setDate(orderDate.getDate() + 7));
    const today = new Date();
    
    const diffTime = estDeliveryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Delivery delayed";
    if (diffDays === 0) return "Arriving today";
    return `Est. delivery in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };
  useEffect(() => {
    initialize();
  }, []);
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setTimeout(() => {
        setOrders([]);
        setCustomOrders([]);
        setTickets([]);
        setNotifications([]);
      }, 0);
      router.push("/login?redirect=dashboard");
      return;
    }
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [ordRes, custRes, tickRes, notRes, invRes] = await Promise.all([
          api.get("/orders/my"),
          api.get("/custom-orders/my"),
          api.get("/support/tickets/my"),
          api.get("/notifications"),
          api.get("/invoices/my")
        ]);
        if (ordRes.data.success) setOrders(ordRes.data.orders);
        if (custRes.data.success) setCustomOrders(custRes.data.customOrders);
        if (tickRes.data.success)
          setTickets(ordRes.data.success ? tickRes.data.tickets : []);
        if (notRes.data.success) setNotifications(notRes.data.notifications);
        if (invRes && invRes.data.success) setInvoices(invRes.data.invoices);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [isAuthenticated, isLoading, router, user?._id]);
  const openCustomChat = async (orderId) => {
    setActiveCustomChatId(orderId);
    try {
      const res = await api.get(`/custom-orders/${orderId}`);
      if (res.data.success) {
        setCustomChatMessages(res.data.customOrder.chatHistory);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleSendCustomMessage = async (e) => {
    e.preventDefault();
    if (!customChatInput.trim()) return;
    try {
      const res = await api.post(`/custom-orders/${activeCustomChatId}/chat`, {
        message: customChatInput,
      });
      if (res.data.success) {
        setCustomChatMessages(res.data.chatHistory);
        setCustomChatInput(""); /* Update custom orders list */
        const updatedRes = await api.get("/custom-orders/my");
        if (updatedRes.data.success)
          setCustomOrders(updatedRes.data.customOrders);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const openTicketChat = async (ticketId) => {
    setActiveTicketId(ticketId);
    try {
      const res = await api.get(`/support/tickets/${ticketId}`);
      if (res.data.success) {
        setTicketMessages(res.data.ticket.messages);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleSendTicketReply = async (e) => {
    e.preventDefault();
    if (!ticketReplyInput.trim()) return;
    try {
      const res = await api.post(`/support/tickets/${activeTicketId}/reply`, {
        message: ticketReplyInput,
      });
      if (res.data.success) {
        setTicketMessages(res.data.ticket.messages);
        setTicketReplyInput(""); /* Refresh ticket lists */
        const updated = await api.get("/support/tickets/my");
        if (updated.data.success) setTickets(updated.data.tickets);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const res = await api.post("/support/tickets", {
        subject: newTicketSubject,
        message: newTicketMessage,
      });
      if (res.data.success) {
        setTickets([res.data.ticket, ...tickets]);
        setNewTicketSubject("");
        setNewTicketMessage("");
        setTicketFormOpen(false);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to open ticket");
    }
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
      case "Approved":
        return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case "Cancelled":
        return <BadgeAlert className="h-4 w-4 text-red-400" />;
      case "Printing":
      case "Processing":
        return <Clock className="h-4 w-4 text-primary animate-pulse" />;
      case "Pending":
      case "Pending Quote":
      default:
        return <Clock className="h-4 w-4 text-slate-500" />;
    }
  };
  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative min-h-[80vh]">
      {" "}
      <div className="absolute top-[15%] right-1/4 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />{" "}
      {/* Main Grid Layout */}{" "}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {" "}
        {/* Left Side: Tabs buttons */}{" "}
        <aside className="lg:col-span-3 flex flex-col gap-2">
          {" "}
          <div className="glass-panel border border-primary/10 rounded-lg p-6 flex flex-col gap-4">
            {" "}
            <div className="flex items-center gap-3 border-b border-primary/10 pb-4">
              {" "}
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-lg">
                {" "}
                {user?.name?.[0]}{" "}
              </div>{" "}
              <div>
                {" "}
                <h2 className="font-bold text-slate-900 text-sm truncate max-w-[150px]">
                  {user?.name}
                </h2>{" "}
                <span className="text-[10px] text-slate-500">
                  {user?.email}
                </span>{" "}
              </div>{" "}
            </div>{" "}
            <div className="flex flex-col gap-1.5">
              {" "}
              {[
                {
                  id: "orders",
                  name: "My Orders",
                  icon: <ShoppingBag className="h-4 w-4" />,
                },
                {
                  id: "invoices",
                  name: "Invoices",
                  icon: <FileText className="h-4 w-4" />,
                },
                {
                  id: "custom",
                  name: "Custom Prints",
                  icon: <Layers className="h-4 w-4" />,
                },
                {
                  id: "tickets",
                  name: "Support Tickets",
                  icon: <MessageSquare className="h-4 w-4" />,
                },
                {
                  id: "profile",
                  name: "Saved Addresses",
                  icon: <User className="h-4 w-4" />,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setActiveCustomChatId(null);
                    setActiveTicketId(null);
                    setTicketFormOpen(false);
                  }}
                  className={`flex items-center gap-2.5 text-left text-sm py-2 px-3 rounded-xl transition-all cursor-pointer ${activeTab === tab.id ? "bg-primary text-white font-semibold" : "text-slate-700 hover:bg-primary/5 hover:text-primary"}`}
                >
                  {" "}
                  {tab.icon} <span>{tab.name}</span>{" "}
                </button>
              ))}{" "}
            </div>{" "}
          </div>{" "}
        </aside>{" "}
        {/* Right Side: Tab details */}{" "}
        <main className="lg:col-span-9 flex flex-col gap-6">
          {" "}
          {loading ? (
            <div className="glass-panel border border-primary/10 rounded-xl p-16 flex justify-center items-center">
              {" "}
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>{" "}
            </div>
          ) : (
            <>
              {" "}
              {/* --- ORDERS TAB --- */}{" "}
              {activeTab === "orders" && (
                <div className="flex flex-col gap-4">
                  {" "}
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Order History
                  </h2>{" "}
                  {orders.length === 0 ? (
                    <div className="text-center py-8 glass-panel rounded-xl border border-primary/10">
                      {" "}
                      <p className="text-slate-400 text-sm">
                        You haven't placed any catalog orders yet.
                      </p>{" "}
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div
                        key={order._id}
                        className="glass-panel border border-primary/10 rounded-lg p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
                      >
                        {" "}
                        <div className="flex flex-col gap-1.5">
                          {" "}
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            {" "}
                            <span>Order #{formatOrderNumber(order._id, order.createdAt)}</span>{" "}
                            <span>•</span>{" "}
                            <span>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>{" "}
                          </div>{" "}
                          <h3 className="font-bold text-slate-900 text-sm truncate max-w-xs">
                            {" "}
                            {order.orderItems
                              .map((i) => i.title)
                              .join(", ")}{" "}
                          </h3>{" "}
                          <span className="text-[10px] text-slate-400">
                            {order.orderItems.length} items
                          </span>{" "}
                        </div>{" "}
                        <div className="flex items-center gap-6 shrink-0 justify-between sm:justify-end w-full sm:w-auto border-t border-primary/10 sm:border-none pt-4 sm:pt-0">
                          {" "}
                          <span className="text-base font-extrabold text-slate-900">
                            ₹{order.priceDetails.totalPrice}
                          </span>{" "}
                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={`flex items-center gap-1.5 text-xs rounded-full border px-3 py-1 font-bold ${getStatusColor(order.orderStatus)}`}
                            >
                              {" "}
                              {getStatusIcon(order.orderStatus)}{" "}
                              <span>{order.orderStatus}</span>{" "}
                            </span>{" "}
                            {order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled" && (
                              <span className="text-[10px] text-slate-500 font-medium">
                                {getEstimatedDelivery(order.orderStatus, order.createdAt)}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            {order.isPaid && (
                              <button
                                onClick={async () => {
                                  try {
                                    const response = await api.get(`/orders/${order._id}/receipt`, { responseType: 'blob' });
                                    const url = window.URL.createObjectURL(new Blob([response.data]));
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', `Receipt_${order._id}.pdf`);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.parentNode.removeChild(link);
                                  } catch(e) {
                                    console.error('Download failed', e);
                                    alert('Failed to download receipt');
                                  }
                                }}
                                className="rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1 text-[10px] font-bold hover:bg-primary hover:text-white transition-all cursor-pointer w-full text-center"
                              >
                                Download Receipt
                                </button>
                              )}
                            </div>
                        </div>{" "}
                      </div>
                    ))
                  )}{" "}
                </div>
              )}{" "}
              {/* --- INVOICES TAB --- */}
              {activeTab === "invoices" && (
                <div className="flex flex-col gap-4">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    My Invoices
                  </h2>
                  {invoices.length === 0 ? (
                    <div className="text-center py-8 glass-panel rounded-xl border border-primary/10">
                      <p className="text-slate-400 text-sm">
                        You don't have any invoices yet.
                      </p>
                    </div>
                  ) : (
                    invoices.map((invoice) => (
                      <div
                        key={invoice._id}
                        className="glass-panel border border-primary/10 rounded-lg p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
                      >
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <span>{invoice.invoiceNumber}</span>
                            <span>•</span>
                            <span>
                              {new Date(invoice.generatedDate).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-900 text-sm">
                            Order #{formatOrderNumber(invoice.order?._id, invoice.createdAt)}
                          </h3>
                        </div>
                        <div className="flex items-center gap-6 shrink-0">
                          <span className="text-base font-extrabold text-slate-900">
                            ₹{invoice.orderTotal}
                          </span>
                          <span className="text-xs rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 font-bold">
                            {invoice.paymentStatus}
                          </span>
                          {invoice.order?.orderStatus !== "Delivered" ? (
                            <button
                              disabled
                              className="rounded-full bg-slate-100 text-slate-400 border border-slate-200 px-4 py-2 text-[10px] sm:text-xs font-bold cursor-not-allowed"
                              title="Invoice will be available for download once the order is delivered"
                            >
                              Available on Delivery
                            </button>
                          ) : (
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
                              className="rounded-full bg-primary/10 text-primary border border-primary/20 px-4 py-2 text-xs font-bold hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer"
                            >
                              Download PDF
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
              {/* --- CUSTOM PRINTS TAB --- */}{" "}
              {activeTab === "custom" && (
                <div className="flex flex-col gap-6">
                  {" "}
                  <div className="flex justify-between items-center">
                    {" "}
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Custom 3D Submissions
                    </h2>{" "}
                    <button
                      onClick={() => router.push("/custom-print")}
                      className="rounded-full bg-gradient-to-r from-primary to-secondary px-5 py-2 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow border border-primary hover:bg-none hover:bg-transparent hover:text-primary transition-all duration-300"
                    >
                      {" "}
                      <Plus className="h-4 w-4" /> <span>Upload STL</span>{" "}
                    </button>{" "}
                  </div>{" "}
                  {customOrders.length === 0 ? (
                    <div className="text-center py-8 glass-panel rounded-xl border border-primary/10">
                      {" "}
                      <p className="text-slate-400 text-sm">
                        No custom prints submitted yet.
                      </p>{" "}
                    </div>
                  ) : !activeCustomChatId ? (
                    <div className="flex flex-col gap-4">
                      {" "}
                      {customOrders.map((order) => (
                        <div
                          key={order._id}
                          className="glass-panel border border-primary/10 rounded-lg p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
                        >
                          {" "}
                          <div className="flex flex-col gap-1.5">
                            {" "}
                            <span className="text-xs text-slate-500 font-semibold">
                              {order.fileName}
                            </span>{" "}
                            <div className="flex gap-2 text-[10px] text-slate-500 mt-1">
                              {" "}
                              <span className="bg-slate-100 text-slate-600 rounded px-2 py-0.5">
                                {order.selectedMaterial}
                              </span>{" "}
                              <span className="bg-slate-100 text-slate-600 rounded px-2 py-0.5">
                                {order.selectedFinish}
                              </span>{" "}
                              <span className="bg-slate-100 text-slate-600 rounded px-2 py-0.5">
                                {order.volume} cm³
                              </span>{" "}
                            </div>{" "}
                          </div>{" "}
                          <div className="flex items-center gap-6 shrink-0 justify-between sm:justify-end w-full sm:w-auto border-t border-primary/10 sm:border-none pt-4 sm:pt-0">
                            {" "}
                            <div className="text-right">
                              {" "}
                              <span className="block text-sm font-bold text-slate-500">
                                Quote Price
                              </span>{" "}
                              <span className="text-base font-extrabold text-slate-900">
                                {" "}
                                {order.adminQuotedPrice
                                  ? `₹${order.adminQuotedPrice}`
                                  : `₹${order.estimatedPrice} (Est)`}{" "}
                              </span>{" "}
                            </div>{" "}
                            <span
                              className={`flex items-center gap-1.5 text-xs rounded-full border px-3 py-1 font-bold ${getStatusColor(order.status)}`}
                            >
                              {" "}
                              {getStatusIcon(order.status)}{" "}
                              <span>{order.status}</span>{" "}
                            </span>{" "}
                            <button
                              onClick={() => openCustomChat(order._id)}
                              className="rounded-full bg-slate-100 border border-slate-200 p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 cursor-pointer"
                              title="Chat regarding quote"
                            >
                              {" "}
                              <MessageSquare className="h-4.5 w-4.5" />{" "}
                            </button>{" "}
                          </div>{" "}
                        </div>
                      ))}{" "}
                    </div> /* QUOTE DISCUSS CHAT BOX */
                  ) : (
                    <div className="glass-panel border border-primary/10 rounded-xl p-6 flex flex-col h-[500px]">
                      {" "}
                      <div className="flex justify-between items-center border-b border-primary/10 pb-4 mb-4">
                        {" "}
                        <div>
                          {" "}
                          <h3 className="font-bold text-slate-900 text-sm">
                            Discussions & Prints Verify
                          </h3>{" "}
                          <span className="text-[10px] text-slate-400">
                            Discuss parameters with admin
                          </span>{" "}
                        </div>{" "}
                        <button
                          onClick={() => setActiveCustomChatId(null)}
                          className="text-[10px] sm:text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-sm"
                        >
                          {" "}
                          Back to Submissions{" "}
                        </button>{" "}
                      </div>{" "}
                      {/* Chat transcript */}{" "}
                      <div className="flex-grow overflow-y-auto pr-2 flex flex-col gap-4 scrollbar">
                        {" "}
                        {customChatMessages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex flex-col max-w-[70%] rounded-lg px-4 py-2 text-xs leading-relaxed ${msg.sender === "user" ? "bg-primary text-white ml-auto" : "bg-slate-100 border border-slate-200 text-slate-800"}`}
                          >
                            {" "}
                            <span className="font-semibold block text-[10px] opacity-80 mb-0.5">
                              {" "}
                              {msg.sender === "user"
                                ? "You"
                                : "Zortuner Admin"}{" "}
                            </span>{" "}
                            <span>{msg.message}</span>{" "}
                          </div>
                        ))}{" "}
                      </div>{" "}
                      {/* Message form */}{" "}
                      <form
                        onSubmit={handleSendCustomMessage}
                        className="flex gap-2 mt-4 border-t border-primary/10 pt-4"
                      >
                        {" "}
                        <input
                          type="text"
                          required
                          placeholder="Type your message..."
                          value={customChatInput}
                          onChange={(e) => setCustomChatInput(e.target.value)}
                          className="flex-grow rounded-full bg-white border border-slate-300 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none"
                        />{" "}
                        <button
                          type="submit"
                          className="rounded-full bg-primary p-3 text-white cursor-pointer border border-primary hover:bg-transparent hover:text-primary transition-all duration-300"
                        >
                          {" "}
                          <Send className="h-4 w-4" />{" "}
                        </button>{" "}
                      </form>{" "}
                    </div>
                  )}{" "}
                </div>
              )}{" "}
              {/* --- SUPPORT TICKETS TAB --- */}{" "}
              {activeTab === "tickets" && (
                <div className="flex flex-col gap-6">
                  {" "}
                  <div className="flex justify-between items-center">
                    {" "}
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Support Tickets
                    </h2>{" "}
                    {!ticketFormOpen && (
                      <button
                        onClick={() => setTicketFormOpen(true)}
                        className="rounded-full bg-gradient-to-r from-primary to-secondary px-5 py-2 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow border border-primary hover:bg-none hover:bg-transparent hover:text-primary transition-all duration-300"
                      >
                        {" "}
                        <Plus className="h-4 w-4" />{" "}
                        <span>New Ticket</span>{" "}
                      </button>
                    )}{" "}
                  </div>{" "}
                  {ticketFormOpen /* OPEN TICKET FORM */ ? (
                    <form
                      onSubmit={handleCreateTicket}
                      className="glass-panel border border-primary/10 rounded-lg p-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300"
                    >
                      {" "}
                      <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                        {" "}
                        <span className="font-bold text-slate-900 text-sm">
                          Raise support query
                        </span>{" "}
                        <button
                          type="button"
                          onClick={() => setTicketFormOpen(false)}
                          className="text-[10px] sm:text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-sm"
                        >
                          {" "}
                          Cancel{" "}
                        </button>{" "}
                      </div>{" "}
                      {errorMsg && (
                        <p className="text-red-400 text-xs text-center">
                          {errorMsg}
                        </p>
                      )}{" "}
                      <div className="flex flex-col gap-1.5">
                        {" "}
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Subject Title
                        </label>{" "}
                        <input
                          type="text"
                          required
                          placeholder="e.g. Bounding box calibration / shipping time issue"
                          value={newTicketSubject}
                          onChange={(e) => setNewTicketSubject(e.target.value)}
                          className="rounded-xl bg-white border border-slate-300 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none"
                        />{" "}
                      </div>{" "}
                      <div className="flex flex-col gap-1.5">
                        {" "}
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Detailed Query Message
                        </label>{" "}
                        <textarea
                          required
                          rows={4}
                          placeholder="Describe the issue in detail..."
                          value={newTicketMessage}
                          onChange={(e) => setNewTicketMessage(e.target.value)}
                          className="rounded-xl bg-white border border-slate-300 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none resize-none"
                        />{" "}
                      </div>{" "}
                      <button
                        type="submit"
                        className="rounded-full bg-primary py-3 font-bold text-xs text-white cursor-pointer mt-2 border border-primary hover:bg-transparent hover:text-primary transition-all duration-300"
                      >
                        {" "}
                        Submit Ticket{" "}
                      </button>{" "}
                    </form>
                  ) : !activeTicketId ? (
                    <div className="flex flex-col gap-4">
                      {" "}
                      {tickets.length === 0 ? (
                        <div className="text-center py-8 glass-panel rounded-xl border border-primary/10">
                          {" "}
                          <p className="text-slate-400 text-sm">
                            No support tickets raised yet.
                          </p>{" "}
                        </div>
                      ) : (
                        tickets.map((ticket) => (
                          <div
                            key={ticket._id}
                            className="glass-panel border border-primary/10 rounded-lg p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
                          >
                            {" "}
                            <div className="flex flex-col gap-1.5">
                              {" "}
                              <span className="text-xs text-slate-500 font-medium">
                                Ticket #{ticket._id.substring(18)}
                              </span>{" "}
                              <h3 className="font-bold text-slate-900 text-sm">
                                {ticket.subject}
                              </h3>{" "}
                            </div>{" "}
                            <div className="flex items-center gap-6 shrink-0">
                              {" "}
                              <span className={`text-[10px] sm:text-xs font-bold rounded-full px-3 py-1.5 ${ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'bg-emerald-500/10 text-emerald-500' : ticket.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500' : 'bg-yellow-500/10 text-yellow-600'}`}>
                                {" "}
                                {ticket.status}{" "}
                              </span>{" "}
                              <button
                                onClick={() => openTicketChat(ticket._id)}
                                className="rounded-full bg-slate-100 border border-slate-200 p-2.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                              >
                                {" "}
                                <MessageSquare className="h-4.5 w-4.5" />{" "}
                              </button>{" "}
                            </div>{" "}
                          </div>
                        ))
                      )}{" "}
                    </div> /* SUPPORT CHAT TRANSCRIPT */
                  ) : (
                    <div className="glass-panel border border-primary/10 rounded-xl p-6 flex flex-col h-[500px]">
                      {" "}
                      <div className="flex justify-between items-center border-b border-primary/10 pb-4 mb-4">
                        {" "}
                        <div>
                          {" "}
                          <h3 className="font-bold text-slate-900 text-sm">
                            Support chat tickets
                          </h3>{" "}
                          <span className="text-[10px] text-slate-400">
                            Active conversation log
                          </span>{" "}
                        </div>{" "}
                        <button
                          onClick={() => setActiveTicketId(null)}
                          className="text-[10px] sm:text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-sm"
                        >
                          {" "}
                          Back to Tickets{" "}
                        </button>{" "}
                      </div>{" "}
                      <div className="flex-grow overflow-y-auto pr-2 flex flex-col gap-4 scrollbar">
                        {" "}
                        {ticketMessages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex flex-col max-w-[70%] rounded-lg px-4 py-2 text-xs leading-relaxed ${msg.sender === "user" ? "bg-primary text-white ml-auto" : "bg-slate-100 border border-slate-200 text-slate-800"}`}
                          >
                            {" "}
                            <span className="font-semibold block text-[10px] opacity-80 mb-0.5">
                              {" "}
                              {msg.sender === "user"
                                ? "You"
                                : "Zortuner Support"}{" "}
                            </span>{" "}
                            <span>{msg.message}</span>{" "}
                          </div>
                        ))}{" "}
                      </div>{" "}
                      <form
                        onSubmit={handleSendTicketReply}
                        className="flex gap-2 mt-4 border-t border-primary/10 pt-4"
                      >
                        {" "}
                        <input
                          type="text"
                          required
                          placeholder="Type reply message..."
                          value={ticketReplyInput}
                          onChange={(e) => setTicketReplyInput(e.target.value)}
                          className="flex-grow rounded-full bg-white border border-slate-300 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none"
                        />{" "}
                        <button
                          type="submit"
                          className="rounded-full bg-primary p-3 text-white cursor-pointer border border-primary hover:bg-transparent hover:text-primary transition-all duration-300"
                        >
                          {" "}
                          <Send className="h-4 w-4" />{" "}
                        </button>{" "}
                      </form>{" "}
                    </div>
                  )}{" "}
                </div>
              )}{" "}
              {/* --- SAVED ADDRESSES TAB --- */}{" "}
              {activeTab === "profile" && (
                <div className="flex flex-col gap-4">
                  {" "}
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Saved Addresses
                  </h2>{" "}
                  {user?.addresses && user.addresses.length > 0 ? (
                    user.addresses.map((addr, idx) => (
                      <div
                        key={idx}
                        className="glass-panel border border-primary/10 rounded-lg p-6 flex flex-col gap-4 relative"
                      >
                        {" "}
                        {editingAddressId === addr._id ? (
                          <div className="flex flex-col gap-3">
                            {" "}
                            <input
                              type="text"
                              value={editStreet}
                              onChange={(e) => setEditStreet(e.target.value)}
                              className="rounded-xl bg-white border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none"
                              placeholder="Street Address"
                            />{" "}
                            <div className="grid grid-cols-3 gap-3">
                              {" "}
                              <input
                                type="text"
                                value={editCity}
                                onChange={(e) => setEditCity(e.target.value)}
                                className="rounded-xl bg-white border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none"
                                placeholder="City"
                              />{" "}
                              <input
                                type="text"
                                value={editState}
                                onChange={(e) => setEditState(e.target.value)}
                                className="rounded-xl bg-white border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none"
                                placeholder="State"
                              />{" "}
                              <input
                                type="text"
                                value={editPostalCode}
                                onChange={(e) =>
                                  setEditPostalCode(e.target.value)
                                }
                                className="rounded-xl bg-white border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none"
                                placeholder="PIN Code"
                              />{" "}
                            </div>{" "}
                            <div className="flex gap-2 justify-end mt-2">
                              {" "}
                              <button
                                onClick={() => setEditingAddressId(null)}
                                className="text-xs bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full font-bold"
                              >
                                Cancel
                              </button>{" "}
                              <button
                                onClick={() => handleUpdateAddress(addr._id)}
                                className="text-xs bg-primary text-white px-4 py-2 rounded-full font-bold border border-primary hover:bg-transparent hover:text-primary transition-all duration-300"
                              >
                                Save
                              </button>{" "}
                            </div>{" "}
                          </div>
                        ) : (
                          <div className="flex gap-4 items-start w-full">
                            {" "}
                            <div className="rounded-xl bg-primary/10 p-3 text-primary shrink-0">
                              {" "}
                              <Clipboard className="h-5 w-5" />{" "}
                            </div>{" "}
                            <div className="flex-grow">
                              {" "}
                              <div className="flex justify-between items-center w-full">
                                {" "}
                                <div className="flex items-center gap-2">
                                  {" "}
                                  <h3 className="font-bold text-slate-900 text-sm">
                                    Delivery Address
                                  </h3>{" "}
                                  {addr.isDefault && (
                                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full px-2 py-0.5 text-[9px] font-bold">
                                      {" "}
                                      Default{" "}
                                    </span>
                                  )}{" "}
                                </div>{" "}
                                <div className="flex gap-2">
                                  {" "}
                                  <button
                                    onClick={() => handleEditAddress(addr)}
                                    className="text-xs text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors font-bold"
                                  >
                                    Edit
                                  </button>{" "}
                                  <button
                                    onClick={() =>
                                      handleDeleteAddress(addr._id)
                                    }
                                    className="text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors font-bold"
                                  >
                                    Delete
                                  </button>{" "}
                                </div>{" "}
                              </div>{" "}
                              <p className="text-slate-400 text-xs leading-relaxed mt-2 font-light max-w-md">
                                {" "}
                                {addr.street}, {addr.city}, {addr.state} -{" "}
                                {addr.postalCode}, {addr.country}{" "}
                              </p>{" "}
                            </div>{" "}
                          </div>
                        )}{" "}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 glass-panel rounded-xl border border-primary/10">
                      {" "}
                      <p className="text-slate-400 text-sm">
                        No delivery address saved yet.
                      </p>{" "}
                    </div>
                  )}{" "}
                </div>
              )}{" "}
            </>
          )}{" "}
        </main>{" "}
      </div>{" "}
    </div>
  );
}
