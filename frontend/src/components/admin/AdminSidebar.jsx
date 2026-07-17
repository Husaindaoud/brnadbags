import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiSettings, FiTag, FiPackage, FiImage,
  FiBell, FiLayers, FiShoppingBag, FiX, FiAward, FiPercent, FiBarChart2, FiFileText
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

const links = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/orders', label: 'Orders', icon: FiPackage },
  { to: '/admin/settings', label: 'Site Settings', icon: FiSettings },
  { to: '/admin/categories', label: 'Categories', icon: FiTag },
  { to: '/admin/brands', label: 'Brands', icon: FiAward },
  { to: '/admin/collections', label: 'Collections', icon: FiLayers },
  { to: '/admin/products', label: 'Products', icon: FiShoppingBag },
  { to: '/admin/sliders', label: 'Slider Images', icon: FiImage },
  { to: '/admin/announcements', label: 'Announcements', icon: FiBell },
  { to: '/admin/promo-codes', label: 'Promo Codes', icon: FiPercent },
  { to: '/admin/analytics', label: 'Analytics', icon: FiBarChart2 },
  { to: '/admin/reports',   label: 'Reports',   icon: FiFileText },
];

function SidebarContent({ onClose }) {
  const { logout, user } = useAuth();
  const { settings } = useSettings();

  return (
    <div className="flex flex-col h-full bg-white border-r border-stone-100">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-stone-100 shrink-0">
        <div className="flex items-center gap-2">
          {settings?.logo_url
            ? <img src={getImageUrl(settings.logo_url)} alt="Logo" className="h-8 w-auto object-contain" />
            : <span className="font-display font-bold text-stone-900 text-lg">Admin</span>
          }
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600 lg:hidden">
            <FiX size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-stone-100 shrink-0">
        <div className="flex items-center justify-between">
          <div className="text-xs text-stone-400">
            Logged in as <span className="font-semibold text-stone-600">{user?.username}</span>
          </div>
          <button onClick={logout}
            className="text-xs text-stone-400 hover:text-rose-500 transition-colors font-medium">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSidebar({ mobileOpen, onClose }) {
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-60 lg:shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
            >
              <SidebarContent onClose={onClose} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
