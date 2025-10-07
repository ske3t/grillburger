import React, { useEffect, useMemo, useState } from "react";
import logo from "./assets/logo.jpg";
import {
  ShoppingCart, History, LogOut, Plus, Minus, Trash2, Repeat, Edit3, CheckCircle2,
  Search, User, Lock, ChevronRight, Home, UserRound, X, Info, Star, Snowflake, Sandwich
} from "lucide-react";

/**
 * Grillburger – Next Version (Mobile‑first + Desktop)
 * - Brand header with logo + title
 * - Category chips (Frozen featured), instant filtering
 * - Product details sheet (tap card for more info)
 * - Frequently Bought (learned from order history)
 * - Cart badge in bottom nav, safe-area padding on phones
 * - Desktop: right cart panel; Mobile: bottom cart drawer
 */

import { PRODUCTS } from "./data/PRODUCTS.generated";

const ALL_CATEGORIES = ["All","Fruit","Vegetables","Salads","Herbs","Exotics"];
// when filtering:
const filtered = PRODUCTS.filter(p =>
  (activeCategory === "All" || p.category === activeCategory) &&
  matchesSearch(p, query)
);

// ---------- Storage Helpers ----------
const LS_USERS = "ws_users_v1";
const LS_SESSION = "ws_session_v1";
const LS_ORDERS_PREFIX = "ws_orders_v1_";

const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i); return String(h >>> 0); };
const read = (k, f) => { try { return JSON.parse(localStorage.getItem(k) || f); } catch { return JSON.parse(f); } };
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

function readUsers() { return read(LS_USERS, "{}"); }
function writeUsers(obj) { write(LS_USERS, obj); }
function readSession() { return read(LS_SESSION, "null"); }
function writeSession(obj) { write(LS_SESSION, obj); }
function readOrders(username) { return read(LS_ORDERS_PREFIX + username, "[]"); }
function writeOrders(username, arr) { write(LS_ORDERS_PREFIX + username, arr); }

// ---------- Small UI ----------
function TextInput({ icon: Icon, ...props }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-3 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500">
      {Icon && <Icon className="h-5 w-5 text-zinc-400" />}
      <input className="w-full text-base outline-none placeholder:text-zinc-400" {...props} />
    </div>
  );
}
function Button({ children, className = "", variant = "primary", ...props }) {
  const base =
    variant === "ghost" ? "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50"
    : variant === "danger" ? "bg-red-600 text-white hover:bg-red-700"
    : variant === "flat" ? "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
    : "bg-indigo-600 text-white hover:bg-indigo-700";
  return (
    <button className={`rounded-xl px-4 py-3 text-base font-medium shadow-sm active:scale-[.99] ${base} ${className}`} {...props}>
      {children}
    </button>
  );
}
function Pill({ children, className = "" }) {
  return <span className={`rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 ${className}`}>{children}</span>;
}

// ---------- Auth ----------
function AuthPanel({ onAuthed }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setError("");
    const users = readUsers();
    if (mode === "signup") {
      if (!username || !password) return setError("Please fill all fields");
      if (users[username]) return setError("Username already exists");
      users[username] = { passwordHash: hash(password), createdAt: Date.now() };
      writeUsers(users); writeSession({ username }); onAuthed(username);
    } else {
      if (!users[username] || users[username].passwordHash !== hash(password)) return setError("Invalid username or password");
      writeSession({ username }); onAuthed(username);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-md gap-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-lg">
      <div className="flex items-center gap-3">
        <img src={logo} alt="Grillburger" className="h-9 w-auto rounded-md" />
        <h1 className="text-lg font-semibold">Grillburger</h1>
      </div>

      <div className="flex overflow-hidden rounded-xl bg-zinc-100 p-1">
        <button onClick={() => setMode("login")} className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${mode === "login" ? "bg-white shadow" : "text-zinc-600"}`}>Log in</button>
        <button onClick={() => setMode("signup")} className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${mode === "signup" ? "bg-white shadow" : "text-zinc-600"}`}>Sign up</button>
      </div>

      <form onSubmit={submit} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium">Username</span>
          <TextInput icon={User} placeholder="e.g. finlay" value={username} onChange={(e) => setUsername(e.target.value.trim())} />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium">Password</span>
          <TextInput icon={Lock} placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <Button type="submit" className="w-full">{mode === "login" ? "Log in" : "Create account"}</Button>
      </form>

      <p className="text-center text-xs text-zinc-500">Demo only • Data stored in your browser</p>
    </div>
  );
}

// ---------- Product Card ----------
function ProductCard({ p, onAdd, onInfo }) {
  return (
    <div className="group grid rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold leading-tight">{p.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-600">
            <Pill>{p.pack}</Pill><Pill className={p.category === "Frozen" ? "bg-indigo-50 text-indigo-700" : ""}>{p.category}</Pill>
          </div>
          <div className="mt-2 text-xs text-zinc-500">ID: {p.id}</div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="rounded-xl bg-zinc-100 px-2 py-1 text-sm font-semibold">£{p.price.toFixed(2)}</div>
          <div className="flex items-center gap-2">
            <Button onClick={() => onAdd(p)} className="flex items-center gap-2 px-3 py-2 text-sm"><Plus className="h-4 w-4" /> Add</Button>
            <button title="Details" onClick={() => onInfo(p)} className="rounded-lg border border-zinc-200 p-2 hover:bg-zinc-50"><Info className="h-4 w-4 text-zinc-600"/></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Details Sheet ----------
function DetailsSheet({ open, onClose, product, onAdd }) {
  if (!open || !product) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white p-4 shadow-2xl" style={{paddingBottom: "max(1rem, env(safe-area-inset-bottom))"}}>
        <div className="mx-auto h-1.5 w-10 rounded-full bg-zinc-200 mb-3" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase text-zinc-500">{product.category}</div>
            <h3 className="mt-1 text-lg font-semibold">{product.name}</h3>
            <div className="mt-1 text-sm text-zinc-600">{product.desc || "—"}</div>
            <div className="mt-2 text-xs text-zinc-500">{product.pack}</div>
          </div>
          <button onClick={onClose} className="rounded-lg border border-zinc-200 p-2"><X className="h-4 w-4"/></button>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xl font-bold">£{product.price.toFixed(2)}</div>
          <Button onClick={() => { onAdd(product); onClose(); }} className="flex items-center gap-2"><Plus className="h-4 w-4"/> Add to order</Button>
        </div>
      </div>
    </div>
  );
}

// ---------- Cart Drawer (mobile) ----------
function CartDrawer({ open, onClose, items, setItems, onCheckout }) {
  const total = items.reduce((s, it) => s + it.price * it.qty, 0);
  const updateQty = (id, d) => setItems((prev) => prev.map((it) => it.id === id ? { ...it, qty: Math.max(1, it.qty + d) } : it).filter((it) => it.qty > 0));
  const removeItem = (id) => setItems((prev) => prev.filter((it) => it.id !== id));
  return (
    <div className={`fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`}>
      <div className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <div className={`absolute inset-x-0 bottom-0 rounded-t-2xl bg-white p-4 shadow-2xl transition-transform ${open ? "translate-y-0" : "translate-y-full"}`} style={{paddingBottom: "max(1rem, env(safe-area-inset-bottom))"}}>
        <div className="mx-auto h-1.5 w-10 rounded-full bg-zinc-200 mb-3" />
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your Cart</h3>
          <Pill>{items.length} items</Pill>
        </div>
        <div className="mt-3 max-h-[50vh] overflow-y-auto pr-1">
          {items.length === 0 ? (
            <div className="text-sm text-zinc-500">Your cart is empty.</div>
          ) : items.map((it) => (
            <div key={it.id} className="flex items-center justify-between gap-3 border-b border-zinc-100 py-3">
              <div className="min-w-0">
                <div className="truncate font-medium">{it.name}</div>
                <div className="text-xs text-zinc-500">{it.pack}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="flat" onClick={() => updateQty(it.id, -1)}><Minus className="h-4 w-4" /></Button>
                <div className="w-8 text-center font-semibold">{it.qty}</div>
                <Button variant="flat" onClick={() => updateQty(it.id, +1)}><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="w-20 text-right font-semibold">£{(it.price * it.qty).toFixed(2)}</div>
              <button className="rounded-lg border border-zinc-200 p-2" onClick={() => removeItem(it.id)}><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-zinc-600">Subtotal</div>
          <div className="text-xl font-bold">£{total.toFixed(2)}</div>
        </div>
        <Button disabled={!items.length} onClick={onCheckout} className="mt-3 w-full flex items-center justify-center gap-2">
          <CheckCircle2 className="h-5 w-5" /> Checkout
        </Button>
      </div>
    </div>
  );
}

// ---------- Desktop Cart Panel ----------
function CartPanel({ items, setItems, onCheckout }) {
  const total = items.reduce((s, it) => s + it.price * it.qty, 0);
  const updateQty = (id, d) => setItems((prev) => prev.map((it) => it.id === id ? { ...it, qty: Math.max(1, it.qty + d) } : it).filter((it) => it.qty > 0));
  const removeItem = (id) => setItems((prev) => prev.filter((it) => it.id !== id));
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
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 p-3">
              <div>
                <div className="font-medium">{it.name}</div>
                <div className="text-xs text-zinc-500">{it.pack}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="flat" onClick={() => updateQty(it.id, -1)}><Minus className="h-4 w-4" /></Button>
                <div className="w-8 text-center font-semibold">{it.qty}</div>
                <Button variant="flat" onClick={() => updateQty(it.id, +1)}><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="w-24 text-right font-semibold">£{(it.price * it.qty).toFixed(2)}</div>
              <Button variant="ghost" onClick={() => removeItem(it.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
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

// ---------- Orders ----------
function OrdersPanel({ username, onLoadToCart }) {
  const [orders, setOrders] = useState(() => readOrders(username));
  useEffect(() => { setOrders(readOrders(username)); }, [username]);
  const latest = orders[0];
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold flex items-center gap-2"><History className="h-5 w-5 text-indigo-600"/> Orders</h2>
        {latest && <Button onClick={() => onLoadToCart(latest.items)} className="flex items-center gap-2"><Repeat className="h-4 w-4"/> Re‑order</Button>}
      </div>
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-zinc-500">No orders yet. Place your first order from the store.</div>
      ) : (
        <div className="grid gap-3">
          {orders.map((o) => (
            <div key={o.id} className="grid gap-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Pill>#{o.id.slice(-6).toUpperCase()}</Pill>
                  <div className="text-sm text-zinc-600">{new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase text-zinc-500">Total</div>
                  <div className="text-base font-bold">£{o.total.toFixed(2)}</div>
                </div>
              </div>
              <div className="grid gap-1 text-sm text-zinc-700">
                {o.items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between">
                    <div className="truncate"><span className="font-medium">{it.qty}×</span> {it.name}</div>
                    <div>£{(it.price * it.qty).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button variant="flat" onClick={() => onLoadToCart(o.items)} className="flex items-center gap-2"><Repeat className="h-4 w-4"/> Re‑order</Button>
                <Button variant="ghost" onClick={() => onLoadToCart(o.items, true)} className="flex items-center gap-2"><Edit3 className="h-4 w-4"/> Modify</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Main App ----------
export default function App() {
  const [session, setSession] = useState(() => readSession());
  const [username, setUsername] = useState(() => session?.username || null);

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Frozen"); // Featured first
  const [cartItems, setCartItems] = useState([]);
  const [activeTab, setActiveTab] = useState("store"); // store | orders | account
  const [toast, setToast] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [detailsFor, setDetailsFor] = useState(null);

  useEffect(() => { if (session?.username) setUsername(session.username); }, [session]);

  // Learn Frequently Bought from orders
  const frequent = useMemo(() => {
    if (!username) return [];
    const orders = readOrders(username);
    const tally = {};
    for (const o of orders) for (const it of o.items) tally[it.id] = (tally[it.id] || 0) + it.qty;
    const ids = Object.entries(tally).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([id])=>id);
    return PRODUCTS.filter(p => ids.includes(p.id));
  }, [username, activeTab]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return PRODUCTS.filter((p) => (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) &&
      (!activeCategory || p.category === activeCategory));
  }, [query, activeCategory]);

  const addToCart = (p) => {
    setCartItems((prev) => {
      const found = prev.find((x) => x.id === p.id);
      if (found) return prev.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x));
      return [...prev, { ...p, qty: 1 }];
    });
    setCartOpen(true);
  };

  const checkout = () => {
    if (!username || !cartItems.length) return;
    const total = cartItems.reduce((s, it) => s + it.price * it.qty, 0);
    const newOrder = { id: Math.random().toString(36).slice(2), createdAt: Date.now(), items: cartItems.map(({ id, name, pack, price, qty }) => ({ id, name, pack, price, qty })), total };
    const existing = readOrders(username);
    writeOrders(username, [newOrder, ...existing]);
    setCartItems([]);
    setActiveTab("orders");
    setCartOpen(false);
    setToast({ type: "success", message: `Order placed • #${newOrder.id.slice(-6).toUpperCase()} (£${total.toFixed(2)})` });
  };

  const loadOrderToCart = (items, focusCheckout = false) => {
    setCartItems(items.map((it) => ({ ...it })));
    if (focusCheckout) setActiveTab("store");
    setCartOpen(true);
    setToast({ type: "info", message: "Order loaded into cart" });
  };

  const logout = () => { writeSession(null); setSession(null); setUsername(null); };

  if (!username) {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-3 py-6">
        <AuthPanel onAuthed={(u) => { setSession({ username: u }); }} />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-indigo-50 via-white to-sky-50 pb-[calc(76px+env(safe-area-inset-bottom))] md:pb-0">
      {/* Brand Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Grillburger" className="h-8 w-8 rounded-md" />
            <div className="text-lg font-semibold tracking-tight">Grillburger</div>
            <Pill className="ml-2 hidden sm:inline bg-indigo-50 text-indigo-700">Frozen & Fresh Wholesale</Pill>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <div className="text-xs text-zinc-600">Signed in as <span className="font-medium">{username}</span></div>
            <Button variant="ghost" onClick={logout} className="flex items-center gap-2"><LogOut className="h-4 w-4"/> Log out</Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto grid max-w-5xl gap-4 px-3 py-4 md:grid-cols-3 md:gap-6 md:px-4 md:py-6">
        {/* Left: Store / Orders / Account */}
        <section className="md:col-span-2">
          {activeTab === "store" && (
            <div className="grid gap-3">
              {/* Search + Chips */}
              <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm md:p-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-zinc-400" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" className="w-full outline-none placeholder:text-zinc-400" />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {ALL_CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm border ${activeCategory === cat ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-zinc-700 border-zinc-300"}`}>
                      {cat === "Frozen" ? <span className="inline-flex items-center gap-1"><Snowflake className="h-4 w-4"/> {cat}</span> : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequently Bought */}
              {frequent.length > 0 && (
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold"><Star className="h-4 w-4 text-amber-500"/> Frequently bought</div>
                    <Pill>{frequent.length} items</Pill>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {frequent.map((p) => (<ProductCard key={p.id} p={p} onAdd={addToCart} onInfo={setDetailsFor} />))}
                  </div>
                </div>
              )}

              {/* Product Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {filtered.map((p) => (<ProductCard key={p.id} p={p} onAdd={addToCart} onInfo={setDetailsFor} />))}
              </div>
            </div>
          )}

          {activeTab === "orders" && (<OrdersPanel username={username} onLoadToCart={loadOrderToCart} />)}

          {activeTab === "account" && (
            <div className="grid gap-4">
              <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <h2 className="text-base font-semibold">Account</h2>
                <div className="text-sm text-zinc-600">Username: <span className="font-medium text-zinc-800">{username}</span></div>
                <div className="text-sm text-zinc-600">Member since: <span className="font-medium text-zinc-800">{new Date(readUsers()[username]?.createdAt || Date.now()).toLocaleDateString()}</span></div>
                <div className="text-sm text-zinc-500">This is a demo account stored in your browser.</div>
              </div>
            </div>
          )}
        </section>

        {/* Right: Cart (desktop) */}
        <aside className="hidden md:block md:col-span-1">
          <div className="sticky top-20">
            <CartPanel items={cartItems} setItems={setCartItems} onCheckout={checkout} />
          </div>
        </aside>
      </main>

      {/* Mobile Cart Button + Drawer */}
      <button
        onClick={() => setCartOpen(true)}
        className="md:hidden fixed right-4 bottom-[calc(80px+env(safe-area-inset-bottom))] z-30 rounded-full bg-indigo-600 px-4 py-3 text-white shadow-lg active:scale-95 flex items-center gap-2"
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="font-semibold">Cart</span>
        {cartItems.length > 0 && <span className="ml-1 rounded-full bg-emerald-600 px-2 py-0.5 text-sm text-white">{cartItems.length}</span>}
      </button>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cartItems} setItems={setCartItems} onCheckout={checkout} />
      <DetailsSheet open={!!detailsFor} onClose={() => setDetailsFor(null)} product={detailsFor} onAdd={addToCart} />

      {/* Bottom Nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-zinc-200 bg-white/95 py-2 backdrop-blur md:hidden" style={{paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))"}}>
        <button onClick={() => setActiveTab("store")} className={`flex flex-col items-center gap-1 ${activeTab === "store" ? "text-indigo-600" : "text-zinc-600"}`}>
          <Home className="h-5 w-5"/><span className="text-xs font-medium">Store</span>
        </button>
        <button onClick={() => setActiveTab("orders")} className={`flex flex-col items-center gap-1 ${activeTab === "orders" ? "text-indigo-600" : "text-zinc-600"}`}>
          <History className="h-5 w-5"/><span className="text-xs font-medium">Orders</span>
        </button>
        <button onClick={() => setActiveTab("account")} className={`flex flex-col items-center gap-1 ${activeTab === "account" ? "text-indigo-600" : "text-zinc-600"}`}>
          <UserRound className="h-5 w-5"/><span className="text-xs font-medium">Account</span>
        </button>
      </nav>

      {/* Toast */}
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(90px+env(safe-area-inset-bottom))] z-50 flex justify-center px-4 md:bottom-4">
          <div className={`pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-2 shadow-lg ${toast.type === "success" ? "bg-emerald-600 text-white" : toast.type === "info" ? "bg-indigo-600 text-white" : "bg-zinc-800 text-white"}`}>
            {toast.type === "success" ? <CheckCircle2 className="h-4 w-4"/> : null}
            <span className="text-sm">{toast.message}</span>
            <button className="ml-2 rounded-lg bg-white/20 px-2 py-1 text-xs" onClick={() => setToast(null)}>Dismiss</button>
          </div>
        </div>
      )}

      <footer className="hidden md:block mx-auto max-w-5xl px-4 pb-10 pt-4 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} Grillburger • Demo UI
      </footer>
    </div>
  );
}
