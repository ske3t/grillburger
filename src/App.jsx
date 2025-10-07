import React, { useMemo, useState, useEffect } from "react";
import {
  ShoppingCart, History, User, LogOut, Plus, Minus, Trash2, CheckCircle2,
  Search, PackageCheck, ChevronRight
} from "lucide-react";
import { PRODUCTS } from "./data/PRODUCTS.generated.js";
import logo from "./assets/logo.jpg";

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */
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
      className={`rounded-xl px-4 py-3 text-sm font-medium shadow-sm transition ${base} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Pill = ({ children, className = "" }) => (
  <span className={`rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 ${className}`}>
    {children}
  </span>
);

/* -------------------------------------------------------
   Auth
------------------------------------------------------- */
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
      <div className="flex items-center gap-3">
        <img src={logo} alt="Grillburger" className="h-8 w-8 rounded-md" />
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
          <input
            className="rounded-2xl border border-zinc-300 bg-white px-3 py-2 shadow-sm outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. finlay"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            className="rounded-2xl border border-zinc-300 bg-white px-3 py-2 shadow-sm outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>
        {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <Button type="submit" className="w-full">
          {mode === "login" ? "Log in" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-xs text-zinc-500">Demo only • Data stored in your browser</p>
    </div>
  );
}

/* -------------------------------------------------------
   Product Card
------------------------------------------------------- */
function ProductCard({ p, onAdd }) {
  const [portion, setPortion] = useState("full");

  const isSplit =
    String(p.split).toLowerCase() === "true" ||
    String(p.split).toLowerCase() === "y" ||
    String(p.split).toLowerCase() === "yes";

  const showPrice = (p.price || 0) * portionFactor(portion);

  return (
    <div className="group grid rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold leading-tight">{p.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-600">
            {p.size && <Pill>{p.size}</Pill>}
            {p.pack && <Pill>{p.pack}</Pill>}
            {(p.category || "") && <Pill>{p.category}</Pill>}
            {isSplit && <Pill>Split available</Pill>}
          </div>
        </div>
        <div className="rounded-xl bg-zinc-100 px-2 py-1 text-sm font-semibold">
          £{showPrice.toFixed(2)}
        </div>
      </div>

      {isSplit && (
        <div className="mt-3">
          <label className="text-xs text-zinc-600">Select portion</label>
          <select
            value={portion}
            onChange={(e) => setPortion(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            {portionOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-zinc-500">Code: {p.ProductCode}</div>
        <Button onClick={() => onAdd(p, portion, isSplit)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   Cart Component
------------------------------------------------------- */
function Cart({ items, setItems, onCheckout }) {
  const total = items.reduce(
    (s, it) => s + (it.basePrice || it.price) * portionFactor(it.portion) * it.qty,
    0
  );

  const updateQty = (idx, delta) =>
    setItems((prev) => {
      const copy = [...prev];
      const it = copy[idx];
      const next = Math.max(1, it.qty + delta);
      copy[idx] = { ...it, qty: next };
      return copy;
    });

  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

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
          {items.map((it, idx) => {
            const line = (it.basePrice || it.price) * portionFactor(it.portion) * it.qty;
            return (
                  <div
                 key={`${it.id}__${it.portion}`}
                 className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-zinc-100 p-3"
                 >
                 <div className="min-w-0 max-w-full">
                  <div className="font-medium truncate">{it.name}</div>
                  <div className="text-xs text-zinc-500">
                    {it.pack ? `${it.pack} • ` : ""}{portionLabel(it.portion)}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="flat" onClick={() => updateQty(idx, -1)}><Minus className="h-4 w-4" /></Button>
                  <div className="w-8 text-center font-semibold">{it.qty}</div>
                  <Button variant="flat" onClick={() => updateQty(idx, +1)}><Plus className="h-4 w-4" /></Button>
                </div>

                +   <div className="flex items-center justify-end gap-2 sm:ml-2">
            <div className="w-24 text-right font-semibold shrink-0">£{line.toFixed(2)}</div>
            <Button variant="ghost" onClick={() => removeItem(idx)} className="shrink-0">
            <Trash2 className="h-4 w-4" />
            </Button>
             </div>
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
      <div className="text-xs text-zinc-500 mt-1">Split pricing applied where available.</div>
    </div>
  );
}

/* -------------------------------------------------------
   Orders + Success Screen
------------------------------------------------------- */
function OrdersPanel({ username }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const key = "orders_" + username;
    setOrders(JSON.parse(localStorage.getItem(key) || "[]"));
  }, [username]);

  if (!orders.length) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-zinc-500">
        No orders yet. Place your first order from the store.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {orders.map((o) => (
        <div key={o.id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pill>#{o.id.slice(-6).toUpperCase()}</Pill>
              <div className="text-sm text-zinc-600">{new Date(o.createdAt).toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase text-zinc-500">Total</div>
              <div className="text-lg font-bold">£{o.total.toFixed(2)}</div>
            </div>
          </div>
          <div className="mt-2 grid gap-1">
            {o.items.slice(0, 6).map((it, i) => (
              <div key={i} className="flex items-center justify-between text-sm text-zinc-700">
                <div className="truncate"><span className="font-medium">{it.qty}×</span> {it.name}</div>
                <div>£{((it.basePrice || it.price) * portionFactor(it.portion) * it.qty).toFixed(2)}</div>
              </div>
            ))}
            {o.items.length > 6 && (
              <div className="text-xs text-zinc-500">+{o.items.length - 6} more items…</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function OrderSuccess({ order, onBackToStore, onViewOrders }) {
  if (!order) return null;
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm text-center">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
      </div>
      <h2 className="text-xl font-semibold">Order placed!</h2>
      <p className="mt-1 text-sm text-zinc-600">Thanks — we’ve received your order.</p>

      <div className="mt-4 grid gap-2 rounded-2xl border border-zinc-200 p-3 text-left">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-600">Order #</span>
          <span className="font-semibold">#{order.id.slice(-6).toUpperCase()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-600">Placed</span>
          <span className="font-semibold">{new Date(order.createdAt).toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-600">Total</span>
          <span className="text-lg font-bold">£{order.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <Button variant="ghost" className="flex-1" onClick={onBackToStore}>Back to store</Button>
        <Button className="flex-1" onClick={onViewOrders}><History className="h-4 w-4 mr-1 inline" /> View orders</Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   Main App (Cart now full-page on mobile)
------------------------------------------------------- */
export default function App() {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem("session") || "null"));
  const username = session?.username || null;

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("store");
  const [cartItems, setCartItems] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);

  // Normalize products
  const NORMALIZED_PRODUCTS = useMemo(
    () =>
      PRODUCTS.map((p, i) => ({
        ...p,
        id: p.ProductCode || `product-${i}`,
        name: p.Description || p.name || "Unnamed",
        category: p.category || p.SgrpName || "",
        price: typeof p.Price1 === "number" ? p.Price1 : Number(p.Price1 || p.price || 0),
      })),
    []
  );

  const CATEGORIES = useMemo(() => {
    const set = new Set(NORMALIZED_PRODUCTS.map((p) => (p.category || "").trim()).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [NORMALIZED_PRODUCTS]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return NORMALIZED_PRODUCTS.filter((p) => {
      const cat = (p.category || "").trim();
      const catOk = activeCategory === "All" || cat === activeCategory;
      const qOk =
        !q ||
        (p.name || "").toLowerCase().includes(q) ||
        cat.toLowerCase().includes(q) ||
        (p.pack || "").toLowerCase().includes(q) ||
        (p.size || "").toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [query, activeCategory, NORMALIZED_PRODUCTS]);

  const addToCart = (product, portion = "full", isSplit = false) =>
    setCartItems((prev) => {
      const key = `${product.id}__${portion}`;
      const idx = prev.findIndex((x) => `${x.id}__${x.portion}` === key);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...prev, { ...product, portion, qty: 1, isSplit, basePrice: product.price }];
    });

  const placeOrder = () => {
    if (!username || !cartItems.length) return;
    const total = cartItems.reduce(
      (s, it) => s + (it.basePrice || it.price) * portionFactor(it.portion) * it.qty,
      0
    );
    const order = {
      id: Math.random().toString(36).slice(2),
      createdAt: Date.now(),
      items: cartItems,
      total,
    };
    const key = "orders_" + username;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    localStorage.setItem(key, JSON.stringify([order, ...existing]));
    setCartItems([]);
    setLastOrder(order);
    setActiveTab("success");
  };

  const logout = () => {
    localStorage.removeItem("session");
    setSession(null);
  };

  if (!username) {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-4 py-10">
        <AuthPanel onAuthed={(u) => setSession({ username: u })} />
      </div>
    );
  }

  /* ------------------------------
     Page Views
  ------------------------------ */
  const StoreView = (
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
          <ProductCard key={`${p.id}`} p={p} onAdd={addToCart} />
        ))}
      </div>
    </section>
  );

  const CartView = (
    <section className="md:col-span-2">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-indigo-600" />
          Your Cart
        </h2>
        <Button variant="ghost" className="shrink-0" onClick={() => setActiveTab("store")}>
          ← Continue shopping
        </Button>
      </div>
      <div className="mx-auto max-w-lg">
        <Cart items={cartItems} setItems={setCartItems} onCheckout={placeOrder} />
      </div>
    </section>
  );

  const OrdersView = (
    <section className="md:col-span-2">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <History className="h-5 w-5 text-indigo-600" /> Orders
        </h2>
      </div>
      <OrdersPanel username={username} />
    </section>
  );

  const AccountView = (
    <section className="md:col-span-2">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Account</h2>
        <div className="mt-2 text-sm text-zinc-600">
          Username: <span className="font-medium text-zinc-800">{username}</span>
        </div>
        <div className="text-sm text-zinc-500">Demo account stored in your browser.</div>
      </div>
    </section>
  );

  const SuccessView = (
    <section className="md:col-span-2">
      <OrderSuccess
        order={lastOrder}
        onBackToStore={() => setActiveTab("store")}
        onViewOrders={() => setActiveTab("orders")}
      />
    </section>
  );

  const CartSidebar = (
    <aside className="md:col-span-1 hidden md:block">
      <Cart items={cartItems} setItems={setCartItems} onCheckout={placeOrder} />
    </aside>
  );

  const cartQty = cartItems.reduce((s, it) => s + it.qty, 0);
  const BottomNav = (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-3xl grid-cols-4 px-2 py-2">
        <button
          onClick={() => setActiveTab("store")}
          className={`flex flex-col items-center gap-1 rounded-xl px-2 py-1 text-xs ${
            activeTab === "store" ? "text-indigo-600" : "text-zinc-700"
          }`}
        >
          <ShoppingCart className="h-5 w-5" />
          Store
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex flex-col items-center gap-1 rounded-xl px-2 py-1 text-xs ${
            activeTab === "orders" ? "text-indigo-600" : "text-zinc-700"
          }`}
        >
          <History className="h-5 w-5" />
          Orders
        </button>
        <button
          onClick={() => setActiveTab("account")}
          className={`flex flex-col items-center gap-1 rounded-xl px-2 py-1 text-xs ${
            activeTab === "account" ? "text-indigo-600" : "text-zinc-700"
          }`}
        >
          <User className="h-5 w-5" />
          Account
        </button>
        <button
          onClick={() => setActiveTab("cart")}
          className={`relative flex flex-col items-center gap-1 rounded-xl px-2 py-1 text-xs ${
            activeTab === "cart" ? "text-indigo-600" : "text-zinc-700"
          }`}
        >
          <PackageCheck className="h-5 w-5" />
          Cart
          {cartQty > 0 && (
            <span className="absolute -top-1 right-3 rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {cartQty}
            </span>
          )}
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-dvh bg-gradient-to-br from-indigo-50 via-white to-sky-50 pb-16 md:pb-0 overflow-x-hidden">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Grillburger" className="h-6 w-6 rounded-md" />
            <div className="font-semibold text-lg">Grillburger</div>
          </div>
          <Button variant="ghost" onClick={logout} className="hidden md:flex items-center gap-2">
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-3">
        {activeTab === "store" && StoreView}
        {activeTab === "cart" && CartView}
        {activeTab === "orders" && OrdersView}
        {activeTab === "account" && AccountView}
        {activeTab === "success" && SuccessView}
        {activeTab !== "success" && activeTab !== "cart" && CartSidebar}
      </main>

      {BottomNav}
    </div>
  );
}

