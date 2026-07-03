import { create } from "zustand";
import { useCartStore } from "./cartStore.js";
import { useWishlistStore } from "./wishlistStore.js";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: (user, token) => {
    localStorage.setItem("layerly_token", token);
    localStorage.setItem("layerly_user", JSON.stringify(user));
    set({ user, token, isAuthenticated: true, isLoading: false });
    setTimeout(() => {
      useCartStore.getState().initializeCart();
      useWishlistStore.getState().initializeWishlist();
    }, 0);
  },
  logout: () => {
    localStorage.removeItem("layerly_token");
    localStorage.removeItem("layerly_user");
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    setTimeout(() => {
      useCartStore.getState().initializeCart();
      useWishlistStore.getState().initializeWishlist();
    }, 0);
  },
  updateUser: (updatedFields) => {
    set((state) => {
      if (!state.user) return {};
      const updatedUser = { ...state.user, ...updatedFields };
      localStorage.setItem("layerly_user", JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },
  initialize: () => {
    if (typeof window === "undefined") return;
    try {
      const token = localStorage.getItem("layerly_token");
      const userStr = localStorage.getItem("layerly_user");
      if (token && userStr) {
        set({
          user: JSON.parse(userStr),
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Failed to load session from storage:", error);
      set({ isLoading: false });
    }
  },
}));
export default useAuthStore;
