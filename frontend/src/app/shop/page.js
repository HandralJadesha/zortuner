"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Heart,
  SlidersHorizontal,
  Search,
  RotateCcw,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { api } from "../../lib/api.js";
import { useWishlistStore } from "../../store/wishlistStore.js";
import { useCartStore } from "../../store/cartStore.js";
import { useAuthStore } from "../../store/authStore.js";
const MATERIALS = ["PLA"];
const COLORS = ["White", "Black", "Grey", "Red", "Blue", "Gold", "Silver"];
const CATEGORIES = [
  { name: "Home Decor", slug: "home-decor" },
  { name: "Anime Figures", slug: "anime-figures" },
  { name: "Gaming Accessories", slug: "gaming-accessories" },
  { name: "Desk Accessories", slug: "desk-accessories" },
  { name: "Lamps & Lighting", slug: "lamps-lighting" },
  { name: "Personalized Gifts", slug: "personalized-gifts" },
];
function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [appliedSearch, setAppliedSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [minRating, setMinRating] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [pagesCount, setPagesCount] = useState(1);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    setSearchInput(searchParams.get("search") || "");
    setAppliedSearch(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "");
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (appliedSearch) params.append("search", appliedSearch);
      if (selectedCategory) params.append("category", selectedCategory);
      if (priceMin) params.append("priceMin", priceMin);
      if (priceMax) params.append("priceMax", priceMax);
      if (selectedMaterials.length > 0)
        params.append("materials", selectedMaterials.join(","));
      if (selectedColors.length > 0)
        params.append("colors", selectedColors.join(","));
      if (minRating) params.append("rating", minRating);
      if (sort) params.append("sort", sort);
      params.append("page", page.toString());
      params.append("limit", "8");
      if (searchParams.get("featured") === "true")
        params.append("featured", "true");
      if (searchParams.get("bestseller") === "true")
        params.append("bestseller", "true");
      if (searchParams.get("newArrival") === "true")
        params.append("newArrival", "true");
      const res = await api.get(`/products?${params.toString()}`);
      if (res.data.success) {
        setProducts(res.data.products);
        setTotalProducts(res.data.total);
        setPagesCount(res.data.pages);
      }
    } catch (error) {
      console.error("Failed to load products from API:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setTimeout(() => fetchProducts(), 0);
  }, [
    appliedSearch,
    selectedCategory,
    selectedMaterials,
    selectedColors,
    minRating,
    sort,
    page,
  ]);
  const handleMaterialToggle = (material) => {
    setSelectedMaterials((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material],
    );
    setPage(1);
  };
  const handleColorToggle = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
    setPage(1);
  };
  const resetFilters = () => {
    setSearchInput("");
    setAppliedSearch("");
    setSelectedCategory("");
    setPriceMin("");
    setPriceMax("");
    setSelectedMaterials([]);
    setSelectedColors([]);
    setMinRating("");
    setSort("newest");
    setPage(1);
    router.push("/shop");
  };
  const submitPriceFilter = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };
  return (
    <div className="flex flex-col gap-6">
      {" "}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        {" "}
        <div>
          {" "}
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Product Catalog
          </h1>{" "}
          <p className="text-slate-400 text-sm mt-1">
            Found {totalProducts} premium items
          </p>{" "}
        </div>{" "}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {" "}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setAppliedSearch(searchInput);
            }}
            className="relative flex-grow md:flex-grow-0 max-w-xs"
          >
            {" "}
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchInput}
              onChange={(e) => {
                const val = e.target.value;
                setSearchInput(val);
                if (val.trim() === "") {
                  setAppliedSearch("");
                  setPage(1);
                  router.push("/shop");
                }
              }}
              className="w-full rounded-full bg-slate-50 border border-slate-200 px-4 py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none"
            />{" "}
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />{" "}
          </form>{" "}
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="rounded-full bg-slate-50 border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-primary"
          >
            {" "}
            <option value="newest">Sort by: Newest</option>{" "}
            <option value="priceAsc">Price: Low to High</option>{" "}
            <option value="priceDesc">Price: High to Low</option>{" "}
            <option value="rating">Rating</option>{" "}
            <option value="popularity">Popularity</option>{" "}
          </select>{" "}
          <button
            onClick={resetFilters}
            className="rounded-full bg-slate-100 border border-slate-200 p-2 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
            title="Reset Filters"
          >
            {" "}
            <RotateCcw className="h-4 w-4" />{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-light">
        {" "}
        <aside className="lg:col-span-3 flex flex-col gap-6 glass-panel rounded-lg border border-slate-200 p-6 h-fit">
          {" "}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
            {" "}
            <SlidersHorizontal className="h-4 w-4 text-accent" />{" "}
            <h2 className="font-bold text-slate-900 uppercase tracking-wider text-sm">
              Filters
            </h2>{" "}
          </div>{" "}
          <div className="flex flex-col gap-2">
            {" "}
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Category
            </h3>{" "}
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => {
                  setSelectedCategory(
                    selectedCategory === cat.slug ? "" : cat.slug,
                  );
                  setPage(1);
                }}
                className={`text-left text-sm py-1.5 px-3 rounded-lg transition-all ${selectedCategory === cat.slug ? "bg-primary/10 text-primary font-semibold" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
              >
                {" "}
                {cat.name}{" "}
              </button>
            ))}{" "}
          </div>{" "}
          <hr className="border-slate-200" />{" "}
          <div className="flex flex-col gap-2">
            {" "}
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Price Range (₹)
            </h3>{" "}
            <form
              onSubmit={submitPriceFilter}
              className="flex gap-2 items-center"
            >
              {" "}
              <input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-full rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-sm text-slate-800 placeholder-slate-400 outline-none"
              />{" "}
              <span className="text-slate-500 text-xs">to</span>{" "}
              <input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-full rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-sm text-slate-800 placeholder-slate-400 outline-none"
              />{" "}
              <button
                type="submit"
                className="rounded-lg bg-primary px-3 py-1.5 text-xs text-white cursor-pointer font-bold border border-primary hover:bg-transparent hover:text-primary transition-all duration-300"
              >
                {" "}
                Go{" "}
              </button>{" "}
            </form>{" "}
          </div>{" "}
          <hr className="border-slate-200" />{" "}
          <div className="flex flex-col gap-2">
            {" "}
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Filament Colors
            </h3>{" "}
            {COLORS.map((col) => (
              <label
                key={col}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 cursor-pointer select-none"
              >
                {" "}
                <input
                  type="checkbox"
                  checked={selectedColors.includes(col)}
                  onChange={() => handleColorToggle(col)}
                  className="accent-primary h-4 w-4 rounded border-slate-300 bg-white"
                />{" "}
                <span>{col}</span>{" "}
              </label>
            ))}{" "}
          </div>{" "}
        </aside>{" "}
        <div className="lg:col-span-9 flex flex-col gap-8 font-normal">
          {" "}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {" "}
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="glass-panel rounded-lg h-96 animate-pulse flex flex-col overflow-hidden"
                >
                  {" "}
                  <div className="bg-slate-100 aspect-square w-full" />{" "}
                  <div className="p-6 flex flex-col gap-3">
                    {" "}
                    <div className="h-5 bg-slate-200 rounded w-2/3" />{" "}
                    <div className="h-4 bg-slate-200 rounded w-1/3 mt-2" />{" "}
                    <div className="h-8 bg-slate-200 rounded w-full mt-auto" />{" "}
                  </div>{" "}
                </div>
              ))}{" "}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 glass-panel rounded-lg border border-slate-100 max-w-lg mx-auto w-full">
              {" "}
              <p className="text-slate-400 text-lg">
                No products match your filter parameters.
              </p>{" "}
              <button
                onClick={resetFilters}
                className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm text-white font-bold cursor-pointer border border-primary hover:bg-transparent hover:text-primary transition-all duration-300"
              >
                {" "}
                Reset Catalog{" "}
              </button>{" "}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {" "}
              {products.map((product) => {
                const isWish = isInWishlist(product._id);
                const isNew = product.createdAt && new Date() - new Date(product.createdAt) < 2 * 24 * 60 * 60 * 1000;
                return (
                  <div
                    key={product._id}
                    className="group relative flex flex-col rounded-lg overflow-hidden glass-panel border border-slate-200 shadow-lg hover:shadow-[0_15px_30px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 bg-white"
                  >
                    {" "}
                    <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                      {" "}
                      <Link
                        href={`/shop/${product.slug}`}
                      >
                        {" "}
                        <Image
                          src={
                            product.images?.[0] ||
                            "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80"
                          }
                          alt={product.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                        />{" "}
                      </Link>{" "}
                      <div className="absolute top-4 left-4 z-20 flex flex-col items-start gap-2">
                        {product.inventory <= 0 && (
                          <span className="inline-flex items-center justify-center px-3 py-1.5 text-[10px] font-bold text-white uppercase tracking-wider bg-red-500 rounded-full shadow-lg shadow-red-500/30">
                            Out of Stock
                          </span>
                        )}
                        {isNew && (
                          <span className="inline-flex items-center justify-center px-3 py-1.5 text-[10px] font-bold text-white uppercase tracking-wider bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/30">
                            New Edition
                          </span>
                        )}
                      </div>{" "}
                      <button
                        onClick={() => toggleWishlist(product)}
                        className="absolute top-4 right-4 rounded-full bg-slate-700 p-2.5 text-slate-300 hover:text-primary hover:bg-slate-600 transition-all cursor-pointer z-10 backdrop-blur"
                      >
                        {" "}
                        <Heart
                          className={`h-4.5 w-4.5 ${isWish ? "fill-red-500 text-red-500" : ""}`}
                        />{" "}
                      </button>{" "}
                    </div>{" "}
                    <div className="p-4 flex flex-col flex-grow gap-2">
                      {" "}
                      <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">
                        {" "}
                        {product.category?.name || "Category"}{" "}
                      </span>{" "}
                      <h3 className="text-base font-bold text-slate-900 tracking-tight mt-1 hover:text-accent cursor-pointer transition-colors">
                        {" "}
                        <Link
                          href={`/shop/${product.slug}`}
                        >
                          {product.title}
                        </Link>{" "}
                      </h3>{" "}
                      <div className="flex items-center gap-1 text-yellow-400 text-[10px] sm:text-xs mt-auto">
                        {" "}
                        <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-yellow-400 text-yellow-400" />{" "}
                        <span>{product.averageRating || "4.5"}</span>{" "}
                        <span className="text-slate-500 ml-1">
                          ({product.numReviews || "0"} reviews)
                        </span>{" "}
                      </div>{" "}
                      <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col gap-2">
                        {" "}
                        <span className="text-base sm:text-lg font-extrabold text-slate-900">
                          {" "}
                          ₹
                          {product.discountPrice ||
                            product.basePrice ||
                            product.price}{" "}
                          {product.discountPrice && (
                            <span className="ml-2 text-[10px] text-slate-500 line-through">
                              ₹{product.basePrice || product.price}
                            </span>
                          )}{" "}
                        </span>{" "}
                        <div className="flex items-center gap-2 mt-1">
                          {" "}
                          <Link
                            href={`/shop/${product.slug}`}
                            className="flex-1 text-center py-2 text-[10px] sm:text-xs font-bold rounded-full border border-[#EBE5FF] bg-[#EBE5FF] text-primary hover:bg-[#DCCBFF] transition-all"
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
                        </div>
                      </div>{" "}
                    </div>{" "}
                  </div>
                );
              })}{" "}
            </div>
          )}{" "}
          {pagesCount > 1 && (
            <div className="flex justify-center gap-2 mt-auto pt-8 border-t border-slate-200">
              {" "}
              {Array.from({ length: pagesCount }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPage(idx + 1)}
                  className={`h-9 w-9 rounded-lg border text-sm font-medium transition-all cursor-pointer flex items-center justify-center ${page === idx + 1 ? "bg-primary border-primary text-white font-bold" : "bg-white border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}
                >
                  {" "}
                  {idx + 1}{" "}
                </button>
              ))}{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
export default function ShopPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 relative mt-8 mb-12 bg-container rounded-lg border border-slate-200 shadow-[0_15px_40px_rgba(0,0,0,0.12)]">
      {" "}
      <div className="absolute top-[20%] left-1/4 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />{" "}
      <Suspense
        fallback={
          <div className="glass-panel border border-white/10 rounded-lg p-16 flex justify-center py-8 text-slate-400 text-sm">
            {" "}
            Loading catalog collections...{" "}
          </div>
        }
      >
        {" "}
        <ShopContent />{" "}
      </Suspense>{" "}
    </div>
  );
}
