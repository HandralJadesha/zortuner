import { create } from "zustand";

const getCartKey = () => {
  if (typeof window === "undefined") return "layerly_cart";
  const userStr = localStorage.getItem("layerly_user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return `layerly_cart_${user.id || user._id}`;
    } catch (e) {}
  }
  return "layerly_cart";
};

const calculateTotals = (items, couponType, couponVal) => {
  const itemsPrice = items.reduce((sum, item) => {
    const price =
      item.product.discountPrice ||
      item.product.basePrice ||
      item.product.price ||
      0;
    return sum + price * item.quantity;
  }, 0);

  let couponDiscount = 0;
  if (couponType === "percentage") {
    couponDiscount = (itemsPrice * couponVal) / 100;
  } else if (couponType === "flat") {
    couponDiscount = couponVal;
  }

  const shippingPrice = itemsPrice > 1000 || itemsPrice === 0 ? 0 : 99;
  const taxableAmount = Math.max(0, itemsPrice - couponDiscount);
  const taxPrice =
    Math.round((taxableAmount - taxableAmount / 1.18) * 100) / 100;
  const totalPrice = Math.max(
    0,
    Math.round((taxableAmount + shippingPrice) * 100) / 100,
  );

  return {
    itemsPrice,
    shippingPrice,
    taxPrice: Math.max(0, taxPrice),
    couponDiscount,
    totalPrice,
  };
};

export const useCartStore = create((set, get) => ({
  items: [],
  couponCode: null,
  discountType: null,
  discountValue: 0,
  priceDetails: {
    itemsPrice: 0,
    shippingPrice: 0,
    taxPrice: 0,
    couponDiscount: 0,
    totalPrice: 0,
  },

  addToCart: (product, quantity, material, color) => {
    set((state) => {
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.product._id === product._id &&
          item.selectedMaterial === material &&
          item.selectedColor === color,
      );

      let newItems = [...state.items];
      if (existingItemIndex > -1) {
        newItems[existingItemIndex].quantity += quantity;
      } else {
        const id = `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        newItems.push({
          id,
          product,
          quantity,
          selectedMaterial: material,
          selectedColor: color,
        });
      }

      localStorage.setItem(getCartKey(), JSON.stringify(newItems));
      const totals = calculateTotals(
        newItems,
        state.discountType,
        state.discountValue,
      );
      return { items: newItems, priceDetails: totals };
    });
  },

  removeFromCart: (id) => {
    set((state) => {
      const newItems = state.items.filter((item) => item.id !== id);
      localStorage.setItem(getCartKey(), JSON.stringify(newItems));
      const totals = calculateTotals(
        newItems,
        state.discountType,
        state.discountValue,
      );
      return { items: newItems, priceDetails: totals };
    });
  },

  updateQuantity: (id, quantity) => {
    set((state) => {
      const newItems = state.items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item,
      );
      localStorage.setItem(getCartKey(), JSON.stringify(newItems));
      const totals = calculateTotals(
        newItems,
        state.discountType,
        state.discountValue,
      );
      return { items: newItems, priceDetails: totals };
    });
  },

  updateColor: (id, color) => {
    set((state) => {
      const newItems = state.items.map((item) =>
        item.id === id ? { ...item, selectedColor: color } : item,
      );
      localStorage.setItem(getCartKey(), JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  applyCoupon: (code, type, value) => {
    set((state) => {
      const totals = calculateTotals(state.items, type, value);
      return {
        couponCode: code,
        discountType: type,
        discountValue: value,
        priceDetails: totals,
      };
    });
  },

  removeCoupon: () => {
    set((state) => {
      const totals = calculateTotals(state.items, null, 0);
      return {
        couponCode: null,
        discountType: null,
        discountValue: 0,
        priceDetails: totals,
      };
    });
  },

  clearCart: () => {
    localStorage.removeItem(getCartKey());
    set({
      items: [],
      couponCode: null,
      discountType: null,
      discountValue: 0,
      priceDetails: {
        itemsPrice: 0,
        shippingPrice: 0,
        taxPrice: 0,
        couponDiscount: 0,
        totalPrice: 0,
      },
    });
  },

  initializeCart: () => {
    if (typeof window === "undefined") return;
    try {
      const cartKey = getCartKey();
      const cartStr = localStorage.getItem(cartKey);
      if (cartStr) {
        const items = JSON.parse(cartStr);
        const totals = calculateTotals(
          items,
          get().discountType,
          get().discountValue,
        );
        set({ items, priceDetails: totals });
      } else {
        set({
          items: [],
          priceDetails: {
            itemsPrice: 0,
            shippingPrice: 0,
            taxPrice: 0,
            couponDiscount: 0,
            totalPrice: 0,
          },
        });
      }
    } catch (error) {
      console.error("Failed to load cart from local storage:", error);
    }
  },
}));
export default useCartStore;
