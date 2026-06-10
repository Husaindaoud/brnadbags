import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTag, FiAward, FiLayers, FiShoppingBag, FiImage, FiBell, FiSettings } from 'react-icons/fi';
import { categoriesApi, brandsApi, collectionsApi, productsApi, announcementsApi } from '../../services/api';

function StatCard({ label, value, icon: Icon, to, color }) {
  return (
    <Link to={to}>
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 flex items-center gap-4 hover:border-rose-200 transition-all"
      >
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-stone-900">{value ?? '—'}</p>
          <p className="text-xs text-stone-400 font-medium">{label}</p>
        </div>
      </motion.div>
    </Link>
  );
}

const quickLinks = [
  { to: '/admin/categories', label: 'Manage Categories', icon: FiTag },
  { to: '/admin/brands', label: 'Manage Brands', icon: FiAward },
  { to: '/admin/collections', label: 'Manage Collections', icon: FiLayers },
  { to: '/admin/products', label: 'Manage Products', icon: FiShoppingBag },
  { to: '/admin/sliders', label: 'Manage Sliders', icon: FiImage },
  { to: '/admin/announcements', label: 'Announcements', icon: FiBell },
  { to: '/admin/settings', label: 'Site Settings', icon: FiSettings },
];

export default function DashboardPage() {
  const [stats, setStats] = useState({});
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    Promise.all([
      categoriesApi.list(),
      brandsApi.list(),
      collectionsApi.list(),
      productsApi.list({ limit: 5, include_inactive: true }),
      announcementsApi.active(),
    ]).then(([cats, brands, colls, prods, ann]) => {
      setStats({ categories: cats.length, brands: brands.length, collections: colls.length, announcements: ann.length });
      setRecentProducts(prods);
    }).catch(() => {});
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-stone-400 text-sm mt-1">Welcome back! Here's an overview of your store.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Categories" value={stats.categories} icon={FiTag} to="/admin/categories" color="bg-rose-500" />
        <StatCard label="Brands" value={stats.brands} icon={FiAward} to="/admin/brands" color="bg-stone-700" />
        <StatCard label="Collections" value={stats.collections} icon={FiLayers} to="/admin/collections" color="bg-amber-500" />
        <StatCard label="Active Banners" value={stats.announcements} icon={FiBell} to="/admin/announcements" color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick links */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
          <h2 className="font-semibold text-stone-800 mb-4 text-sm">Quick Actions</h2>
          <div className="space-y-1">
            {quickLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-600 hover:bg-stone-50 hover:text-rose-500 transition-colors">
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Recent products */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-800 text-sm">Recent Products</h2>
            <Link to="/admin/products" className="text-xs text-rose-500 hover:underline">View all</Link>
          </div>
          {recentProducts.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-8">No products yet</p>
          ) : (
            <div className="space-y-3">
              {recentProducts.map(p => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                    {p.primary_image_url && (
                      <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${p.primary_image_url}`}
                        alt={p.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{p.name}</p>
                    <p className="text-xs text-stone-400">${p.final_price.toFixed(2)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.is_sold_out ? 'bg-stone-100 text-stone-500' : 'bg-emerald-50 text-emerald-700'}`}>
                    {p.is_sold_out ? 'Sold Out' : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
