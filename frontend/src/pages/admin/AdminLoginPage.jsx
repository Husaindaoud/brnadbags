import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff, FiUser, FiLock } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import api, { authApi, getImageUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

export default function AdminLoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { access_token } = await authApi.login(form.username, form.password);
      localStorage.setItem('admin_token', access_token);
      const user = await api.get('/auth/me').then(r => r.data);
      login(access_token, user);
      navigate('/admin');
    } catch {
      toast.error('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const storeName = settings?.site_title || 'Brand Bags';

  return (
    <div className="min-h-screen flex">
      <Toaster position="top-right" />

      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-stone-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-sm">
          {settings?.logo_url ? (
            <div className="bg-white rounded-2xl px-6 py-4 shadow-sm">
              <img
                src={getImageUrl(settings.logo_url)}
                alt={storeName}
                className="h-12 w-auto object-contain"
              />
            </div>
          ) : (
            <div className="text-white text-4xl font-bold tracking-tight">{storeName}</div>
          )}
          <div className="w-12 h-0.5 bg-rose-400 rounded-full" />
          <p className="text-stone-400 text-sm leading-relaxed">
            Manage your store, track orders, and grow your business — all from one place.
          </p>

          {/* Feature list */}
          <div className="flex flex-col gap-3 w-full mt-4 text-left">
            {['Order management', 'Product catalogue', 'Analytics & reports', 'Promo codes'].map(f => (
              <div key={f} className="flex items-center gap-3 text-stone-400 text-sm">
                <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-stone-50 px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            {settings?.logo_url ? (
              <img src={getImageUrl(settings.logo_url)} alt={storeName} className="h-10 w-auto object-contain mx-auto mb-3" />
            ) : (
              <div className="text-stone-900 text-2xl font-bold mb-1">{storeName}</div>
            )}
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-stone-900">Welcome back</h1>
            <p className="text-stone-400 text-sm mt-1">Sign in to your admin panel</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-7">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Username field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Username</label>
                <div className="relative">
                  <FiUser size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300" />
                  <input
                    type="text"
                    required
                    autoFocus
                    autoComplete="username"
                    value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 text-stone-900 placeholder:text-stone-300 transition-shadow"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full pl-10 pr-11 py-3 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 text-stone-900 placeholder:text-stone-300 transition-shadow"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500 transition-colors"
                  >
                    {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full py-3.5 bg-stone-900 hover:bg-stone-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Signing in…
                  </>
                ) : 'Sign In'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-stone-300 mt-6">
            {storeName} Admin · Secure access
          </p>
        </motion.div>
      </div>
    </div>
  );
}
