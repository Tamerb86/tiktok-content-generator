import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../lib/api';
import type { Product } from '../../types';
import {
  Sparkles,
  LayoutDashboard,
  Package,
  CreditCard,

  LogOut,
  Plus,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import clsx from 'clsx';

export default function DashboardLayout() {
  const { user, profile, signOut } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(false); // Closed by default
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await api.getProducts(1, 50);
        if (response.success && response.data) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
    { icon: CreditCard, label: 'Billing', path: '/app/billing' },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface-50 border-b border-white/10 h-16 flex items-center px-4">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 text-slate-300 hover:text-white"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex-1 flex items-center justify-center">
          <Link to="/app" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">ContentGen</span>
          </Link>
        </div>
        <div className="w-10" /> {/* Spacer for balance */}
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-50 h-full bg-surface-50 border-r border-white/10 transition-all duration-300',
          // Desktop
          'hidden lg:block',
          sidebarOpen ? 'lg:w-64' : 'lg:w-20',
          // Mobile
          mobileSidebarOpen ? 'block w-64' : 'hidden'
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          {(sidebarOpen || mobileSidebarOpen) ? (
            <Link to="/app" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl">ContentGen</span>
            </Link>
          ) : (
            <Link to="/app" className="mx-auto">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </Link>
          )}
          
          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileSidebarOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                location.pathname === item.path
                  ? 'bg-primary-50 text-primary-300'
                  : 'text-slate-300 hover:bg-surface-50/10'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {(sidebarOpen || mobileSidebarOpen) && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Products Section */}
        {(sidebarOpen || mobileSidebarOpen) && (
          <div className="px-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Products
              </h3>
              <Link
                to="/app"
                state={{ openAddProduct: true }}
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 text-slate-500 hover:text-primary-400 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {loadingProducts ? (
                <div className="py-2 text-sm text-slate-500">Loading...</div>
              ) : products.length === 0 ? (
                <div className="py-2 text-sm text-slate-500">No products yet</div>
              ) : (
                products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/app/product/${product.id}`}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={clsx(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors truncate',
                      location.pathname === `/app/product/${product.id}`
                        ? 'bg-primary-50 text-primary-300'
                        : 'text-slate-300 hover:bg-surface-50/10'
                    )}
                  >
                    <Package className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{product.title}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          {(sidebarOpen || mobileSidebarOpen) ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-300">
                    {profile?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {profile?.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2 w-full text-left text-slate-300 hover:bg-surface-50/10 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center p-2 w-full text-slate-300 hover:bg-surface-50/10 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Toggle Button (Desktop only) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-surface-50 border border-white/10 rounded-full items-center justify-center text-slate-500 hover:text-slate-300 shadow-sm"
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <main
        className={clsx(
          'min-h-screen transition-all duration-300 pt-16 lg:pt-0',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        )}
      >
        <div className="p-4 lg:p-8">
          <Outlet context={{ products, setProducts, loadingProducts }} />
        </div>
      </main>
    </div>
  );
}
