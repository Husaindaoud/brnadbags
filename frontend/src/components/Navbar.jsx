import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiShoppingBag, FiMenu, FiX } from 'react-icons/fi';
import { FaInstagram } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { getImageUrl } from '../services/api';

const BRAND = '#b8966a';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/categories', label: 'Categories' },
  { to: '/new-collection', label: 'New Collection' },
  { to: '/sale', label: 'Sale' },
  { to: '/brands', label: 'Brands' },
];

function LogoMark() {
  return (
    <svg width="152" height="50" viewBox="0 0 152 50" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="The Boutique">
      {/* Corner brackets */}
      <path d="M5 15 L5 5 L15 5"   stroke={BRAND} strokeWidth="1.2" strokeLinecap="square"/>
      <path d="M137 5 L147 5 L147 15" stroke={BRAND} strokeWidth="1.2" strokeLinecap="square"/>
      <path d="M5 35 L5 45 L15 45"  stroke={BRAND} strokeWidth="1.2" strokeLinecap="square"/>
      <path d="M137 45 L147 45 L147 35" stroke={BRAND} strokeWidth="1.2" strokeLinecap="square"/>

      {/* THE — italic, gold, small-caps style */}
      <text
        x="76" y="22"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="8"
        fontStyle="italic"
        fill={BRAND}
        letterSpacing="5"
      >THE</text>

      {/* Divider: line · diamond · line */}
      <line x1="22" y1="27.5" x2="66" y2="27.5" stroke={BRAND} strokeWidth="0.6" opacity="0.8"/>
      <polygon points="76,24.5 79.5,27.5 76,30.5 72.5,27.5" fill={BRAND}/>
      <line x1="86" y1="27.5" x2="130" y2="27.5" stroke={BRAND} strokeWidth="0.6" opacity="0.8"/>

      {/* BOUTIQUE — bold, dark, tracked */}
      <text
        x="76" y="41"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="13"
        fontWeight="700"
        fill="#1a1a1a"
        letterSpacing="4.5"
      >BOUTIQUE</text>
    </svg>
  );
}

function Logo({ settings, onClick }) {
  return (
    <Link to="/" onClick={onClick} className="shrink-0 flex items-center select-none">
      {settings?.logo_url ? (
        <img
          src={getImageUrl(settings.logo_url)}
          alt="Store"
          className="h-12 w-auto object-contain"
        />
      ) : (
        <LogoMark />
      )}
    </Link>
  );
}

export default function Navbar() {
  const { totalItems } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const igUrl = settings?.instagram_url;

  return (
    <>
      {/* ── Main header ───────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 bg-white transition-all duration-300"
        style={{
          boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.07)' : 'none',
          borderBottom: scrolled ? 'none' : '1px solid #e8e3db',
        }}
      >
        {/* Gold accent line at top of navbar */}
        <div style={{ height: '2px', background: `linear-gradient(90deg, transparent, ${BRAND}, transparent)` }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between" style={{ height: '76px' }}>

            {/* Logo */}
            <Logo settings={settings} />

            {/* Desktop nav — centered */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className="nav-link text-stone-600 hover:text-[#b8966a]"
                  style={{ fontSize: '12px', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 500 }}
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-1">
              {igUrl && (
                <a
                  href={igUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 text-stone-500 hover:text-[#b8966a] transition-colors rounded-full hover:bg-stone-50"
                  title="Follow us on Instagram"
                >
                  <FaInstagram size={18} />
                </a>
              )}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 text-stone-600 hover:text-[#b8966a] transition-colors rounded-full hover:bg-stone-50"
                aria-label="Search"
              >
                <FiSearch size={18} />
              </button>
              <Link
                to="/cart"
                className="relative p-2.5 text-stone-600 hover:text-[#b8966a] transition-colors rounded-full hover:bg-stone-50"
                aria-label="Cart"
              >
                <FiShoppingBag size={18} />
                {totalItems > 0 && (
                  <span
                    className="absolute top-1 right-1 min-w-[16px] h-4 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5"
                    style={{ background: BRAND }}
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile actions */}
            <div className="flex md:hidden items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-stone-600 hover:text-[#b8966a] transition-colors"
                aria-label="Search"
              >
                <FiSearch size={20} />
              </button>
              <Link to="/cart" className="relative p-2 text-stone-600 hover:text-[#b8966a] transition-colors">
                <FiShoppingBag size={20} />
                {totalItems > 0 && (
                  <span
                    className="absolute top-1 right-1 min-w-[16px] h-4 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5"
                    style={{ background: BRAND }}
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMenuOpen(true)}
                className="p-2 text-stone-600 hover:text-[#b8966a] transition-colors ml-1"
                aria-label="Open menu"
              >
                <FiMenu size={22} />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 bg-black/40 md:hidden"
              onClick={() => setMenuOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              className="fixed top-0 right-0 h-full z-50 bg-white flex flex-col md:hidden"
              style={{ width: '280px', boxShadow: '-4px 0 30px rgba(0,0,0,0.12)' }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #f0ece6' }}>
                <Logo settings={settings} onClick={() => setMenuOpen(false)} />
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-1.5 text-stone-500 hover:text-stone-800 transition-colors"
                  aria-label="Close menu"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col flex-1 overflow-y-auto py-4">
                {navLinks.map(({ to, label }, i) => (
                  <motion.div
                    key={to}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05 }}
                  >
                    <NavLink
                      to={to}
                      end={to === '/'}
                      onClick={() => setMenuOpen(false)}
                      className="nav-link flex items-center px-6 py-4 text-stone-600 hover:text-[#b8966a] hover:bg-stone-50 transition-colors"
                      style={{
                        fontSize: '12px',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        fontWeight: 500,
                        borderBottom: '1px solid #f5f2ee',
                      }}
                    >
                      {label}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              {/* Drawer footer */}
              <div className="px-6 py-5" style={{ borderTop: '1px solid #f0ece6' }}>
                {igUrl && (
                  <a
                    href={igUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-stone-500 hover:text-[#b8966a] transition-colors"
                    style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500 }}
                  >
                    <FaInstagram size={16} style={{ color: BRAND }} />
                    Follow on Instagram
                  </a>
                )}
                <p className="mt-4 text-stone-400" style={{ fontSize: '10px', letterSpacing: '0.1em' }}>
                  © {new Date().getFullYear()} Boutique
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Search overlay ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-28 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl bg-white overflow-hidden"
              style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            >
              {/* Search hint */}
              <div style={{ background: BRAND, height: '2px' }} />
              <form onSubmit={handleSearch}>
                <div className="flex items-center px-5 py-4 gap-4">
                  <FiSearch size={20} style={{ color: BRAND, flexShrink: 0 }} />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search products…"
                    className="flex-1 outline-none text-stone-900 placeholder-stone-400 bg-transparent"
                    style={{ fontSize: '15px', letterSpacing: '0.04em' }}
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="text-stone-400 hover:text-stone-700 transition-colors p-1"
                  >
                    <FiX size={20} />
                  </button>
                </div>
                <div className="px-5 pb-3 flex items-center gap-2" style={{ borderTop: '1px solid #f5f0ea' }}>
                  <span className="text-stone-400" style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Press Enter to search
                  </span>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
