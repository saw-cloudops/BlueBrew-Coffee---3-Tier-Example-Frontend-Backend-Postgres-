import React, { useState, useEffect, useMemo } from 'react';
import { 
  Coffee, 
  ShoppingBag, 
  Menu as MenuIcon, 
  X, 
  Star, 
  MapPin, 
  Clock, 
  Instagram, 
  Twitter, 
  Facebook,
  Loader,
  Lock,
  User,
  CheckCircle,
  ClipboardList,
  DollarSign,
  LogOut
} from 'lucide-react';

/* --- TIER 2: BUSINESS LOGIC LAYER (API SERVICE) --- */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const apiService = {
  getProducts: async () => {
    const res = await fetch(`${API_URL}/api/products`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return await res.json();
  },
  
  submitOrder: async (cart, total) => {
    const res = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: "Web Customer",
        items: cart.map(i => ({ id: i.id, quantity: i.quantity })),
        total: total,
      }),
    });
    if (!res.ok) throw new Error("Failed to submit order");
    return await res.json();
  },

  getOrders: async () => {
    const res = await fetch(`${API_URL}/api/admin/orders`);
    if (!res.ok) throw new Error("Failed to fetch orders");
    return await res.json();
  },

  updateOrderStatus: async (orderId, newStatus) => {
    const res = await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) throw new Error("Failed to update order status");
    return await res.json();
  },

  loginAdmin: async (username, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error("Invalid credentials");
    return await res.json();
  },
};

/* --- TIER 1: PRESENTATION LAYER (FRONTEND) --- */

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }) => {
  const baseStyle = "px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20",
    secondary: "bg-white text-slate-900 hover:bg-slate-100 border border-slate-200",
    outline: "border-2 border-white/20 text-white hover:bg-white/10",
    ghost: "text-slate-600 hover:text-blue-600 hover:bg-blue-50",
    danger: "bg-red-500 hover:bg-red-600 text-white"
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const SectionHeading = ({ title, subtitle, centered = true, light = false }) => (
  <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
    <h3 className={`text-sm font-bold uppercase tracking-widest mb-2 ${light ? 'text-blue-400' : 'text-blue-600'}`}>
      {subtitle}
    </h3>
    <h2 className={`text-3xl md:text-4xl font-extrabold ${light ? 'text-white' : 'text-slate-900'}`}>
      {title}
    </h2>
    <div className={`h-1 w-20 bg-blue-600 mt-4 ${centered ? 'mx-auto' : ''}`} />
  </div>
);

const ProductCard = ({ product, onAdd }) => (
  <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 border border-slate-100 flex flex-col h-full">
    <div className={`h-48 ${product.imageColor} relative overflow-hidden`}>
      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <Coffee size={64} className="text-white" />
      </div>
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
        <Star size={12} className="text-blue-600 fill-blue-600" />
        {product.rating}
      </div>
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <span className="text-lg font-bold text-blue-600">${Number(product.price).toFixed(2)}</span>
      </div>
      <p className="text-slate-500 text-sm mb-6 flex-grow line-clamp-2">{product.description}</p>
      <Button 
        onClick={() => onAdd(product)} 
        variant="secondary" 
        className="w-full !py-2 text-sm group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900"
      >
        Add to Cart
      </Button>
    </div>
  </div>
);

const CartDrawer = ({ isOpen, onClose, cart, onRemove, onUpdateQty, onCheckout, isProcessing }) => {
  const total = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl transform transition-transform duration-300 flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag size={20} /> Your Order
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <Coffee size={48} className="opacity-20" />
              <p>Your cart is empty.</p>
              <Button onClick={onClose} variant="primary">Browse Menu</Button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4">
                <div className={`w-20 h-20 rounded-lg ${item.imageColor} flex-shrink-0`} />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-900">{item.name}</h4>
                    <span className="font-medium text-blue-600">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-slate-200 rounded-lg">
                      <button onClick={() => onUpdateQty(item.id, Math.max(0, item.quantity - 1))} className="px-3 py-1 hover:bg-slate-100 text-slate-600">-</button>
                      <span className="px-2 text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => onUpdateQty(item.id, item.quantity + 1)} className="px-3 py-1 hover:bg-slate-100 text-slate-600">+</button>
                    </div>
                    <button onClick={() => onRemove(item.id)} className="text-xs text-red-500 hover:text-red-600 underline">Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="p-6 bg-slate-50 border-t border-slate-100">
            <div className="flex justify-between items-center mb-4 text-slate-600">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-6 text-xl font-bold text-slate-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Button onClick={onCheckout} variant="primary" className="w-full" disabled={isProcessing}>
              {isProcessing ? <><Loader className="animate-spin" size={16} /> Processing...</> : 'Checkout Now'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const Navbar = ({ cartCount, onOpenCart, onAdminClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-4' : 'bg-slate-900 py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2 z-50">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Coffee className="text-white" size={24} />
          </div>
          <span className={`text-2xl font-black tracking-tighter ${isScrolled ? 'text-slate-900' : 'text-white'}`}>
            BLUE<span className="text-blue-600">BREW</span>
          </span>
        </div>
        <div className={`hidden md:flex items-center gap-8 font-medium ${isScrolled ? 'text-slate-600' : 'text-white/90'}`}>
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-blue-500 transition-colors">Home</a>
          <a href="#menu" className="hover:text-blue-500 transition-colors">Menu</a>
        </div>
        <div className="flex items-center gap-4 z-50">
          <button onClick={onAdminClick} className={`p-2 rounded-full hover:bg-blue-500/10 transition-colors ${isScrolled ? 'text-slate-600' : 'text-white'}`} title="Staff Login">
            <Lock size={20} />
          </button>
          <button onClick={onOpenCart} className={`relative p-2 rounded-full transition-colors ${isScrolled ? 'text-slate-900 hover:bg-slate-100' : 'text-white hover:bg-white/20'}`}>
            <ShoppingBag size={24} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

const Hero = () => (
  <section id="home" className="relative min-h-[85vh] flex items-center pt-32 bg-slate-900 overflow-hidden">
    <div className="absolute top-0 right-0 w-2/3 h-full bg-blue-600/10 skew-x-12 transform translate-x-20" />
    <div className="container mx-auto px-6 relative z-10 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 font-medium text-sm mb-6">
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        Order Online
      </div>
      <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
        Premium Coffee <br />
        <span className="text-blue-600">Simplified.</span>
      </h1>
      <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
        Order your favorites from your device and skip the line.
      </p>
      <div className="flex justify-center">
        <Button variant="primary" onClick={() => document.getElementById('menu').scrollIntoView({ behavior: 'smooth' })}>
          View Menu
        </Button>
      </div>
    </div>
  </section>
);

const MenuSection = ({ products, loading, onAdd }) => (
  <section id="menu" className="py-24 bg-slate-50">
    <div className="container mx-auto px-6">
      <SectionHeading title="Order Now" subtitle="The Menu" />
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin text-blue-600" size={48} />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(product => (
            <ProductCard key={product.id} product={product} onAdd={onAdd} />
          ))}
        </div>
      )}
    </div>
  </section>
);

const LoginScreen = ({ onLogin, error, loading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-blue-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Staff Portal</h2>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(username, password); }} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
          <Button variant="primary" className="w-full" type="submit" disabled={loading}>
            {loading ? <Loader className="animate-spin" size={20} /> : 'Sign In'}
          </Button>
        </form>
        <div className="mt-6 text-center">
           <p className="text-xs text-slate-400">Hint: use admin / admin</p>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    const data = await apiService.getOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    await apiService.updateOrderStatus(orderId, newStatus);
    fetchOrders();
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    revenue: orders.reduce((acc, curr) => acc + Number(curr.total), 0)
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white px-6 py-4 shadow-md flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Coffee className="text-white" size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight">Admin<span className="text-blue-400">Portal</span></span>
        </div>
        <button onClick={onLogout} className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors">
          <LogOut size={20} />
        </button>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-600 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase">Total Revenue</p>
              <h3 className="text-2xl font-bold text-slate-900">${Number(stats.revenue).toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><DollarSign size={24} /></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-amber-500 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase">Pending Orders</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.pending}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-full"><Clock size={24} /></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase">Total Orders</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full"><ClipboardList size={24} /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800">Recent Orders</h3>
            <Button variant="ghost" onClick={fetchOrders} className="!py-1 !px-3 text-sm">Refresh</Button>
          </div>
          {loading && orders.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Loading orders...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Order ID</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Items</th>
                    <th className="px-6 py-4 font-medium">Total</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-600">#{order.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{order.customerName}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex gap-1">
                            <span className="font-bold text-slate-800">{item.quantity}x</span> {item.name}
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">${Number(order.total).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status === 'Completed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {order.status !== 'Completed' && (
                          <button 
                            onClick={() => handleStatusChange(order.id, 'Completed')}
                            className="text-blue-600 hover:text-blue-800 text-xs font-bold border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                          >
                            Mark Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState('customer');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoadingProducts(true);
      const data = await apiService.getProducts();
      setProducts(data);
      setLoadingProducts(false);
    };
    loadData();
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  
  const updateQuantity = (id, newQty) => {
    if (newQty === 0) return removeFromCart(id);
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
  };

  const handleCheckout = async () => {
    setOrderProcessing(true);
    const total = cart.reduce((a,b) => a + Number(b.price) * b.quantity, 0);
    await apiService.submitOrder(cart, total);
    setOrderProcessing(false);
    setCart([]);
    setIsCartOpen(false);
    alert("Order placed successfully! Use the Lock icon to switch to Admin view to see it.");
  };

  const handleLogin = async (username, password) => {
    setAuthLoading(true);
    setLoginError('');
    try {
      await apiService.loginAdmin(username, password);
      setCurrentView('admin');
    } catch (err) {
      setLoginError("Invalid username or password.");
    } finally {
      setAuthLoading(false);
    }
  };

  if (currentView === 'admin') return <AdminDashboard onLogout={() => setCurrentView('customer')} />;

  if (currentView === 'login') {
    return (
      <>
         <div className="absolute top-4 right-4 z-50">
            <button onClick={() => setCurrentView('customer')} className="text-white/50 hover:text-white flex items-center gap-2">
               <X size={20} /> Cancel
            </button>
         </div>
         <LoginScreen onLogin={handleLogin} error={loginError} loading={authLoading} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-200 selection:text-blue-900">
      <Navbar 
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)} 
        onAdminClick={() => setCurrentView('login')}
      />
      <main>
        <Hero />
        <MenuSection products={products} loading={loadingProducts} onAdd={addToCart} />
      </main>
      <footer className="bg-slate-950 text-slate-500 py-8 text-center text-sm border-t border-slate-900">
        <div className="container mx-auto">
           <p>&copy; {new Date().getFullYear()} BlueBrew Coffee Co. | <span onClick={() => setCurrentView('login')} className="cursor-pointer hover:text-blue-500">Staff Access</span></p>
        </div>
      </footer>
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart}
        onRemove={removeFromCart}
        onUpdateQty={updateQuantity}
        onCheckout={handleCheckout}
        isProcessing={orderProcessing}
      />
    </div>  
  );
}
