"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Barcode,
  Trash2,
  Pause,
  Play,
  CreditCard,
  Banknote,
  Printer,
  Plus,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/utils";
import { printThermalReceipt } from "@/lib/print-invoice";
import type { CartItem } from "@/types";

interface ProductResult {
  _id: string;
  name: string;
  sku: string;
  barcode?: string;
  sellingPrice: number;
  stock: number;
  images?: string[];
  taxRate?: number;
}

export function PosScreen() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const debouncedSearch = useDebounce(search);

  const {
    items,
    discount,
    taxRate,
    heldCarts,
    addItem,
    removeItem,
    updateQuantity,
    setDiscount,
    clearCart,
    holdCart,
    resumeCart,
    getSubtotal,
    getTotal,
  } = useCartStore();

  const fetchProducts = useCallback(async (q: string) => {
    if (!q) {
      setProducts([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (json.success) setProducts(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(debouncedSearch);
  }, [debouncedSearch, fetchProducts]);

  const addProductToCart = (product: ProductResult) => {
    if (product.stock <= 0) {
      toast.error("Out of stock");
      return;
    }
    const item: CartItem = {
      productId: product._id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      price: product.sellingPrice,
      quantity: 1,
      discount: 0,
      tax: product.taxRate ?? 0,
      image: product.images?.[0],
    };
    addItem(item);
    setSearch("");
    setProducts([]);
    toast.success(`Added ${product.name}`);
  };

  const handleBarcodeScan = async (barcode: string) => {
    const res = await fetch(`/api/products/barcode/${barcode}`);
    const json = await res.json();
    if (json.success && json.data) {
      addProductToCart(json.data);
    } else {
      toast.error("Product not found");
    }
  };

  useKeyboardShortcuts({
    "ctrl+f": () => document.getElementById("pos-search")?.focus(),
    "ctrl+h": () => holdCart(),
    f2: () => setPaymentMethod("cash"),
    f3: () => setPaymentMethod("card"),
  });

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    setCheckoutLoading(true);
    try {
      const total = getTotal();
      const res = await fetch("/api/sales/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          discount,
          taxRate,
          payments: [{ method: paymentMethod, amount: total }],
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      printThermalReceipt({
        storeName: "RetailPOS",
        invoiceNumber: json.data.invoiceNumber,
        date: new Date().toLocaleString(),
        cashier: "Cashier",
        items,
        subtotal: getSubtotal(),
        discount,
        tax: getSubtotal() * (taxRate / 100),
        total,
        payments: [{ method: paymentMethod, amount: total }],
      });

      clearCart();
      toast.success("Sale completed!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="grid h-[calc(100vh-8rem)] gap-4 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            id="pos-search"
            placeholder="Search products or scan barcode (Ctrl+F)"
            className="pl-10 pr-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && search.length >= 8) {
                handleBarcodeScan(search);
              }
            }}
            autoFocus
          />
          <Barcode className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        </div>

        <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
          {loading && (
            <p className="col-span-full text-center text-zinc-500">Searching...</p>
          )}
          {products.map((product) => (
            <button
              key={product._id}
              type="button"
              onClick={() => addProductToCart(product)}
              className="flex flex-col rounded-xl border border-zinc-200 bg-white p-3 text-left transition hover:border-emerald-500 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
            >
              <span className="line-clamp-2 text-sm font-medium">{product.name}</span>
              <span className="mt-1 text-lg font-bold text-emerald-600">
                {formatCurrency(product.sellingPrice)}
              </span>
              <Badge variant={product.stock <= 5 ? "warning" : "secondary"} className="mt-2 w-fit">
                Stock: {product.stock}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Cart ({items.length})</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => holdCart()} title="Hold (Ctrl+H)">
              <Pause className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={clearCart}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3 overflow-hidden">
          {heldCarts.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {heldCarts.map((h) => (
                <Button key={h.id} variant="outline" size="sm" onClick={() => resumeCart(h.id)}>
                  <Play className="mr-1 h-3 w-3" />
                  Resume
                </Button>
              ))}
            </div>
          )}

          <div className="flex-1 space-y-2 overflow-y-auto">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                className="flex items-center justify-between rounded-lg bg-zinc-50 p-2 dark:bg-zinc-900"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-zinc-500">
                    {formatCurrency(item.price)} each
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1, item.variantId)
                    }
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1, item.variantId)
                    }
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <p className="py-8 text-center text-sm text-zinc-500">Cart is empty</p>
            )}
          </div>

          <div className="space-y-2 border-t pt-3">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Discount"
                value={discount || ""}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                className="h-8"
              />
            </div>
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(getSubtotal())}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-emerald-600">{formatCurrency(getTotal())}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={paymentMethod === "cash" ? "default" : "outline"}
                onClick={() => setPaymentMethod("cash")}
              >
                <Banknote className="mr-2 h-4 w-4" />
                Cash
              </Button>
              <Button
                variant={paymentMethod === "card" ? "default" : "outline"}
                onClick={() => setPaymentMethod("card")}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Card
              </Button>
            </div>

            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              size="lg"
              onClick={handleCheckout}
              disabled={checkoutLoading || items.length === 0}
            >
              <Printer className="mr-2 h-4 w-4" />
              {checkoutLoading ? "Processing..." : "Pay & Print"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
