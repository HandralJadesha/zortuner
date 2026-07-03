import { create } from "zustand";

const getWishlistKey = () => {
  if (typeof window === "undefined") return "layerly_wishlist";
  const userStr = localStorage.getItem("layerly_user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return `layerly_wishlist_${user.id || user._id}`;
    } catch (e) {}
  }
  return "layerly_wishlist";
};

export const useWishlistStore = create((set, get) => ({
  products: [],

  toggleWishlist: (product) => {
    set((state) => {
      const exists = state.products.some((p) => p._id === product._id);
      let newProducts;
      if (exists) {
        newProducts = state.products.filter((p) => p._id !== product._id);
      } else {
        newProducts = [...state.products, product];
      }
      localStorage.setItem(getWishlistKey(), JSON.stringify(newProducts));
      return { products: newProducts };
    });
  },

  clearWishlist: () => {
    localStorage.removeItem(getWishlistKey());
    set({ products: [] });
  },

  initializeWishlist: () => {
    if (typeof window === "undefined") return;
    try {
      const wishlistKey = getWishlistKey();
      const wishlistStr = localStorage.getItem(wishlistKey);
      if (wishlistStr) {
        set({ products: JSON.parse(wishlistStr) });
      } else {
        set({ products: [] });
      }
    } catch (error) {
      console.error("Failed to load wishlist from local storage:", error);
    }
  },

  isInWishlist: (id) => {
    return get().products.some((p) => p._id === id);
  },
}));
export default useWishlistStore;
