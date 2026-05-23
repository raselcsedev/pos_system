import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  customerId?: string;
  discount: number;
  taxRate: number;
  heldCarts: { id: string; items: CartItem[]; savedAt: string }[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    variantId?: string
  ) => void;
  setDiscount: (discount: number) => void;
  setTaxRate: (rate: number) => void;
  setCustomer: (id?: string) => void;
  clearCart: () => void;
  holdCart: () => string;
  resumeCart: (id: string) => void;
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      discount: 0,
      taxRate: 0,
      heldCarts: [],

      addItem: (item) => {
        set((state) => {
          const idx = state.items.findIndex(
            (i) =>
              i.productId === item.productId && i.variantId === item.variantId
          );
          if (idx >= 0) {
            const items = [...state.items];
            items[idx] = {
              ...items[idx],
              quantity: items[idx].quantity + item.quantity,
            };
            return { items };
          }
          return { items: [...state.items, item] };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(i.productId === productId && i.variantId === variantId)
          ),
        }));
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      setDiscount: (discount) => set({ discount }),
      setTaxRate: (taxRate) => set({ taxRate }),
      setCustomer: (customerId) => set({ customerId }),
      clearCart: () => set({ items: [], discount: 0, customerId: undefined }),

      holdCart: () => {
        const id = `hold-${Date.now()}`;
        const { items, heldCarts } = get();
        if (items.length === 0) return id;
        set({
          heldCarts: [
            ...heldCarts,
            { id, items: [...items], savedAt: new Date().toISOString() },
          ],
          items: [],
          discount: 0,
        });
        return id;
      },

      resumeCart: (id) => {
        const held = get().heldCarts.find((h) => h.id === id);
        if (!held) return;
        set({
          items: held.items,
          heldCarts: get().heldCarts.filter((h) => h.id !== id),
        });
      },

      getSubtotal: () => {
        const { items, discount } = get();
        const sub = items.reduce(
          (s, i) => s + i.price * i.quantity * (1 - i.discount / 100),
          0
        );
        return sub - discount;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        return subtotal + subtotal * (get().taxRate / 100);
      },
    }),
    { name: "pos-cart" }
  )
);
