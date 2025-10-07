import React, { useEffect, useMemo, useState } from "react";
import { ShoppingCart, History, LogOut, User, Plus, Minus, CheckCircle2, ChevronRight } from "lucide-react";
import { PRODUCTS } from "./data/PRODUCTS.correct.generated";
import logo from "./assets/logo.jpg"; // ← make sure your file name matches

// ---------- UI Components ----------
function Button({ children, variant = "primary", className = "", ...props }) {
  const base =
    variant === "ghost"
      ? "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
      : variant === "flat"
      ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
      : "bg-indigo-600 text-white hover:bg-indigo-700";
  return (
    <button
      className={`rounded-2xl px-4 py-2 font-medium shadow-sm transition ${base} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Pill({ children, className = "" }) {
  return (
    <span className={`rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 ${className}`}>
      {children}
    </span>
  );
}

// ---------- Store Card ----------
function ProductCard({ product, onAdd }) {
  return (
    <div className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div>
        <h3 className="font-semibold text-gray-800 leading-tight">{product.name}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
          {product.pack && <Pill>{product.pack}</Pill>}
          {product.size && <Pill>{product.size}</Pill>}
          <Pill>{product.category}</Pill>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-gray-500">ID: {product.id}</div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-gray-100 px-2 py-1 text-sm font-semibold">
            £{product.price.toFixed(2)}
          </div>
          <Button onClick={() => onAdd(product)} className="flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------- Cart ----------
function Cart({ items, setItems, onCheckout }) {
  const total = items.reduce((sum, it) => sum + it.price * it.qty, 0);

  const updateQty = (id, delta) => {
    setItems((prev) =>
      prev
        .map((it) =>
          it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it
        )
        .filter((it) => it.qty > 0)
    );
  };

  const updateSplit = (id, splitValue) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              splitValue,
              price:
                splitValue === "half"
                  ? it.basePrice / 2
                  : splitValue === "quarter"
                  ? it.basePrice / 4
                  : it.basePrice,
            }
          : it
      )
    );
  };

  return (
    <div className="grid gap-3 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Your Cart</h3>
        <Pill>{items.length} items</Pill>
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-gray-500">Your cart is empty.</div>
      ) : (
        items.map((it) => (
          <div
            key={it.id}
            className="flex flex-col gap-2 rounded-2xl border border-gray-100 p-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">{it.name}</div>
                <div className="text-xs text-gray-500">{it.pack}</div>
              </div>
              <div className="text-right font-semibold text-gray-800">
                £{(it.price * it.qty).toFixed(2)}
              </div>
            </div>
            {it.split && (
              <select
                value={it.splitValue}
                onChange={(e) => updateSplit(it.id, e.target.value)}
                className="rounded-xl border border-gray-300 px-2 py-1 text-sm"
              >
                <option value="full">Full case</option>
                <option value="half">Half case</option>
                <option value="quarter">Quarter case</option>
              </select>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="flat" onClick={() => updateQty(it.id, -1)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="w-8 text-center font-semibold">{it.qty}</div>
                <Button variant="flat" onClick={() => updateQty(it.id, 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
      <div className="mt-2 flex items-center justify-between">
        <div className="text-sm text-gray-600">Subtotal</div>
        <div className="text-lg font-bold">£{total.toFixed(2)}</div>
      </div>
      <Button
        disabled={!items.length}
        onClick={onCheckout}
        className="flex items-center justify-center gap-2"
      >
        <CheckCircle2 className="h-5 w-5" /> Checkout
      </Button>
    </div>
  );
}

// ---------- App ----------
export default function App() {
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All");

  const categories = useMemo(() => {
    const cats = [...new Set(PRODUCTS.map((p) => p.category).filter(Boolean))];
    return ["All", ...cats.sort()];
  }, []);

  const filtered = useMemo(() => {
    let list = PRODUCTS;
    if (activeCat !== "All") list = list.filter((p) => p.category === activeCat);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [query, activeCat]);

  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((x) => x.id === product.id);
      if (found)
        return prev.map((x) =>
          x.id === product.id ? { ...x, qty: x.qty + 1 } : x
        );
      return [
        ...prev,
        {
          ...product,
          qty: 1,
          basePrice: product.price,
          splitValue: "full",
        },
      ];
    });
  };

  const checkout = () => {
    alert("Checkout complete (demo only).");
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Grillburger" className="h-6 w-6 rounded-full" />
            <h1 className="text-lg font-semibold text-gray-800">Grillburger</h1>
          </div>
          <Button variant="ghost" onClick={() => alert("Logging out...")}>
            <LogOut className="h-4 w-4 mr-1" /> Log out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl grid gap-6 p-4 md:grid-cols-3">
        <section className="md:col-span-2 space-y-4">
          <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full rounded-2xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCat(cat)}
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      activeCat === cat
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={addToCart} />
            ))}
          </div>
        </section>

        <aside className="md:col-span-1">
          <Cart items={cart} setItems={setCart} onCheckout={checkout} />
        </aside>
      </main>
    </div>
  );
}
