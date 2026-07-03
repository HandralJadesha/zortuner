"use client";
import React from "react";
import Link from "next/link";
import { ShoppingBag, Eye } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useCartStore } from "../store/cartStore.js";
import { api } from "../lib/api.js";
import { useAuthStore } from "../store/authStore.js";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
export default function ProductShowcase() {
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("All");
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    api
      .get("/products?limit=100")
      .then((res) => {
        if (res.data.success) {
          /* Filter to only featured or new arrivals for the showcase */
          const showcase = res.data.products.filter(
            (p) => p.isFeatured || p.isNewArrival || p.isBestseller,
          );
          setProducts(showcase);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products for showcase:", err);
        setLoading(false);
      });
  }, []);
  const CATEGORIES = [
    "All",
    ...new Set(products.map((p) => p.category?.name).filter(Boolean)),
  ];
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      category === "All" || product.category?.name === category;
    return matchesSearch && matchesCategory;
  });
  return (
    <section
      id="featured"
      className="pt-4 pb-4 md:pt-4 md:pb-8 w-full mx-0 px-4 sm:px-6 lg:px-8 relative z-10 bg-container m-0 flex flex-col justify-center border-b border-slate-200 overflow-hidden"
    >
      {/* Luxury Background Ornaments */}
      <div className="absolute top-[20%] left-[-5%] h-[500px] w-[500px] rounded-full bg-slate-800/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] h-[700px] w-[700px] rounded-full bg-orange-500/10 blur-[150px] pointer-events-none" />
      <div className="text-center w-full max-w-5xl mx-auto mb-10 px-4 relative z-20">
        {" "}
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {" "}
          Product Showcase{" "}
        </h2>{" "}
        <p className="mt-2 text-slate-600 font-light text-base">
          {" "}
          Explore our most popular ready-to-buy 3D printed creations.{" "}
        </p>{" "}
      </div>{" "}
      <div className="max-w-4xl mx-auto mb-6 px-4 relative z-20 flex flex-col sm:flex-row gap-4 justify-center items-center">
        {" "}
        <div className="flex flex-row items-center gap-3 w-full sm:w-auto">
          {" "}
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
            Search
          </label>{" "}
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full bg-white border border-slate-300 px-5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full sm:w-64 shadow-sm"
          />{" "}
        </div>{" "}
        <div className="flex flex-row items-center gap-3 w-full sm:w-auto">
          {" "}
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
            Collection
          </label>{" "}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-full bg-white border border-slate-300 px-5 py-2.5 text-sm text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full sm:w-48 shadow-sm cursor-pointer"
          >
            {" "}
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Collections" : cat}
              </option>
            ))}{" "}
          </select>{" "}
        </div>{" "}
      </div>{" "}
      <div className="relative w-full max-w-6xl py-4 z-20 mx-auto px-4 lg:px-12">
        {" "}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white glass-panel rounded-lg max-w-lg mx-auto border border-slate-200">
            {" "}
            <p className="text-slate-500 text-lg font-medium">
              No product is found.
            </p>{" "}
            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="mt-4 rounded-full bg-orange-500 hover:bg-orange-300 px-6 py-2 text-sm text-slate-900 font-bold cursor-pointer transition-all duration-300"
            >
              {" "}
              Clear Filters{" "}
            </button>{" "}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            whileInView={{ opacity: 1 }} 
            viewport={{ once: true }} 
            transition={{ staggerChildren: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-2 sm:px-4 max-h-[800px] overflow-y-auto pb-4 custom-scrollbar"
          >
            {" "}
            {filteredProducts.map((product, idx) => {
              const isNew = product.createdAt && new Date() - new Date(product.createdAt) < 2 * 24 * 60 * 60 * 1000;
              return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                key={idx}
                className="w-full glass-panel rounded-xl overflow-hidden group relative hover-glow bg-white"
              >
                {" "}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-50">
                  {" "}
                  <img
                    src={
                      product.images?.[0] ||
                      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80"
                    }
                    alt={product.title}
                    className="w-full h-full object-cover object-center transition-all duration-700 group-hover:opacity-80"
                  />{" "}
                  <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] pointer-events-none" />{" "}
                  <div className="absolute top-4 left-4 z-20 flex flex-col items-start gap-2">
                    {product.inventory <= 0 && (
                      <span className="inline-flex items-center justify-center px-3 py-1.5 text-[10px] font-bold text-white uppercase tracking-wider bg-red-500 rounded-full shadow-red-500/30">
                        Out of Stock
                      </span>
                    )}
                    {isNew && (
                      <span className="inline-flex items-center justify-center px-3 py-1.5 text-[10px] font-bold text-white uppercase tracking-wider bg-indigo-500 rounded-full shadow-indigo-500/30">
                        New Edition
                      </span>
                    )}
                  </div>{" "}
                </div>{" "}
                <div className="p-3 flex flex-col flex-grow gap-2 relative bg-white border-t border-slate-100">
                  {" "}
                  <div className="flex flex-col gap-0.5">
                    {" "}
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {product.title}
                    </h3>{" "}
                    <p className="text-primary font-bold text-base">
                      ₹{product.discountPrice || product.basePrice}
                    </p>{" "}
                  </div>{" "}
                  <div className="flex items-center gap-2 mt-auto">
                    {" "}
                    <Link
                      href={`/shop/${product.slug}`}
                      className="flex-1 text-center py-2 text-[10px] sm:text-xs font-bold rounded-full bg-orange-500 text-slate-900 hover:bg-orange-300 transition-all"
                    >
                      {" "}
                      View{" "}
                    </Link>{" "}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const text = `Hi, I would like to order ${product.title}.`;
                          window.open(`https://wa.me/918884828247?text=${encodeURIComponent(text)}`, "_blank");
                        }}
                        className="flex-1 flex items-center justify-center rounded-full py-2 text-[10px] sm:text-xs font-bold transition-all bg-slate-900 text-orange-500 hover:bg-slate-800 hover:text-orange-400 cursor-pointer"
                      >
                        Buy
                      </button>{" "}
                  </div>{" "}
                </div>{" "}
              </motion.div>
            );
            })}{" "}
          </motion.div>
        )}{" "}
      </div>{" "}
    </section>
  );
}
