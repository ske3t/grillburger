import React, { useState, useMemo } from "react";
import {
  ShoppingCart, History, LogOut, Plus, Minus, Trash2, CheckCircle2,
  Search, User, Lock
} from "lucide-react";
import { PRODUCTS } from "./data/PRODUCTS.generated";

// ---------- UI helpers ----------
const CATEGORIES = ["All", "Fruit", "Vegetables", "Salads", "Herbs", "Exotics"];
const portionOptions = [
  { key: "full", label: "Full case", factor: 1 },
  { key: "half", label: "Half case", factor: 0.5 },
  { key: "quarter", label: "Quarter case", factor: 0.25 },
];
const portionLabel = (key) => portionOptions.find((o) => o.key === key)?.label || "Full case";
const portionFactor = (key) => portionOptions.find((o) => o.key === key)?.factor ?? 1;

const Button = ({ children, variant = "primary", className = "", ...props }) => {
  const base =
    variant === "ghost"
      ? "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50"
      : variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700"
      : variant === "flat"
      ? "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
      : "bg-indigo-600 text-white hover:bg-indigo-700";
  return (
    <button
      className={`rounded-xl px-4 py-3 text-sm font-medium shadow-sm ${base} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
const Pill = ({ children }) => (
  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
    {children}
  </span>
);

// ---------- Auth ----------
function AuthPanel({ onAuthed }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setError("");
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    if (mode === "signup") {
      if (!username || !password) return setError("Please fill all fields");
      if (users[username]) return setError("Username already exists");
      users[username] = { password, createdAt: Date.now() };
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("session", JSON.stringify({ username }));
      onAuthed(username);
    } else {
      if (!users[username] || users[username].password !== password)
        return setError("Invalid username or password");
      localStorage.setItem("session", JSON.stringify({ username }));
      onAuthed(username);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-md gap-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">Grillburger</h1>
      </div>
      <div className="flex overflow-hidden rounded-xl bg-zinc-100 p-1">
        <button
          onClick={() => setMode("login")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
            mode === "login" ? "bg-white shadow" : "text-zinc-600"
          }`}
        >
          Log in
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
            mode === "signup" ? "bg-white shadow" : "text-zinc-600"
          }`}
        >
          Sign up
        </button>
      </div>
      <form onSubmit={submit} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium">Username</span>
          <div className="flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-3 py-2 shadow-sm">
            <User className="h-4 w-4 text-zinc-400" />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. finlay"
              className="w-full outline-none"
            />
          </div>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium">Password</span>
          <div className="flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-3 py-2 shadow-sm">
            <Lock className="h-4 w-4 text-zinc-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full outline-none"
            />
          </div>
        </label>
        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
        <Button type="submit" className="w-full">
          {mode === "login" ? "Log in" : "Create account"}
        </Button>
      </form>
      <p className="text-center text-xs text-zinc-500">
        Demo only • Data stored in your browser
      </p>
    </div>
  );
}

// ---------- Product Card ----------
function ProductCard({ p, onAdd }) {
  const [portion, setPortion] = useState("full");
  const effectivePrice = (p.price || 0) * portionFactor(portion);

  return (
    <div className="group grid rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold leading-tight">{p.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-600">
            {p.size && <Pill>{p.size}</Pill>}
            {p.pack && <Pill>{p.pack}</Pill>}
            <Pill>{p.category}</Pill>
            {p.split && <Pill>Split available</Pill>}
          </div>
        </div>
        <div className="text-right">
          <div className="rounded-xl bg-zinc-100 px-2 py-1 text-sm font-semibold">
            £{effectivePrice.toFixed(2)}
          </div>
        </div>
      </div>

      {p.split && (
        <div className="mt-3">
          <label className="text-xs text-zinc-600">Select portion</label>
          <select
            value={portion}
            onChange={(e) => setPortion(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            {portionOptions.map((opt) => (
              <option value={opt.key} key={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-zinc-500">ID: {p.id}</div>
        <Button onClick={() => onAdd(p, portion)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
    </div>
  );
}

// ---------- Cart ----------
function Cart({ items, setItems, onCheckout }) {
  const total = items.reduce(
    (s, it) => s + it.price * portionFactor(it.portion) * it.qty,
    0
  );
  const updateQty = (id, portion, delta) =>
    setItems((prev) =>
      prev
        .map((it) =>
          it.id === id && it.portion === portion
            ? { ...it, qty: Math.max(1, it.qty + delta) }
            : it
        )
        .filter((it) => it.qty > 0)
    );
  const removeItem = (id, portion) =>
    setItems((prev) => prev.filter((it) => !(it.id === id && it.portion === portion)));

  return (
    <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Your Cart</h3>
        <Pill>{items.length} items</Pill>
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-zinc-500">Your cart is empty.</div>
      ) : (
        <div className="grid gap-3">
          {items.map((it) => {
            const line = it.price * portionFactor(it.portion) * it.qty;
            return (
              <div
                key={it.id + it.portion}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 p-3"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{it.name}</div>
                  <div className="text-xs text-zinc-500">
                    {it.pack ? `${it.pack} • ` : ""}
                    {portionLabel(it.portion)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="flat" onClick={() => updateQty(it.id, it.portion, -1)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="w-8 text-center font-semibold">{it.qty}</div>
                  <Button variant="flat" onClick={() => updateQty(it.id, it.portion, +1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="w-24 text-right font-semibold">£{line.toFixed(2)}</div>
                <Button variant="ghost" onClick={() => removeItem(it.id, it.portion)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-2 flex items-center justify-between">
        <div className="text-sm text-zinc-600">Subtotal</div>
        <div className="text-lg font-bold">£{total.toFixed(2)}</div>
      </div>
      <Button disabled={!items.length} onClick={onCheckout} className="flex items-center justify-center gap-2">
        <CheckCircle2 className="h-5 w-5" /> Checkout
      </Button>
    </div>
  );
}

// ---------- Main ----------
export default function App() {
  const [session, setSession] = useState(() =>
    JSON.parse(localStorage.getItem("session") || "null")
  );
  const username = session?.username || null;
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, portion = "full") =>
    setCartItems((prev) => {
      const idx = prev.findIndex((x) => x.id === product.id && x.portion === portion);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...prev, { ...product, portion, qty: 1 }];
    });

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return PRODUCTS.filter((p) => {
      const catOk = activeCategory === "All" || p.category === activeCategory;
      const qOk =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.pack || "").toLowerCase().includes(q) ||
        (p.size || "").toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [query, activeCategory]);

  const checkout = () => {
    if (!username || !cartItems.length) return;
    const total = cartItems.reduce(
      (s, it) => s + it.price * portionFactor(it.portion) * it.qty,
      0
    );
    const newOrder = {
      id: Math.random().toString(36).slice(2),
      createdAt: Date.now(),
      items: cartItems,
      total,
    };
    const key = "orders_" + username;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    localStorage.setItem(key, JSON.stringify([newOrder, ...existing]));
    setCartItems([]);
    alert(`Order placed • £${total.toFixed(2)}`);
  };

  if (!username) {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-4 py-10">
        <AuthPanel onAuthed={(u) => setSession({ username: u })} />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-lg">🥗 Grillburger</div>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              localStorage.removeItem("session");
              setSession(null);
            }}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-3">
        <section className="md:col-span-2">
          <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-3 py-2 shadow-sm">
              <Search className="h-4 w-4 text-zinc-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full outline-none"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm border ${
                    activeCategory === cat
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-zinc-700 border-zinc-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {filtered.map((p) => (
              <ProductCard key={p.id + String(p.split)} p={p} onAdd={addToCart} />
            ))}
          </div>
        </section>

        <aside className="md:col-span-1">
          <Cart items={cartItems} setItems={setCartItems} onCheckout={checkout} />
        </aside>
      </main>
    </div>
  );
}
