import axios from "axios";
import productsData from "../data/products.json";
import categoriesData from "../data/categories.json";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("layerly_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const originalGet = api.get;
api.get = async function(url, config) {
  if (url.includes("/categories")) {
    return Promise.resolve({ data: { success: true, categories: categoriesData } });
  }

  if (url.includes("/reviews")) {
    return Promise.resolve({ data: { success: true, reviews: [] } });
  }
  
  if (url.includes("/products")) {
    if (url.includes("/products/")) {
      const slug = url.split("/products/")[1].split("?")[0];
      const product = productsData.find(p => p.slug === slug || p._id === slug);
      if (product) return Promise.resolve({ data: { success: true, product } });
      return Promise.reject({ response: { status: 404, data: { message: "Product not found" } } });
    }
    
    let filtered = [...productsData];
    if (url.includes('category=')) {
      const catMatch = url.match(/category=([^&]+)/);
      if (catMatch) filtered = filtered.filter(p => p.category === catMatch[1] || (p.category && p.category._id === catMatch[1]));
    }
    return Promise.resolve({ 
      data: { 
        success: true, 
        products: filtered, 
        total: filtered.length, 
        pages: 1 
      } 
    });
  }
  
  return originalGet.call(this, url, config);
};

export default api;
