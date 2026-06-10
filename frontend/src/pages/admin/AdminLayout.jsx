import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FiMenu } from 'react-icons/fi';
import AdminSidebar from '../../components/admin/AdminSidebar';
import ProtectedRoute from '../../components/admin/ProtectedRoute';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-stone-50">
        <AdminSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile top bar */}
          <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-stone-100 px-4 h-14 flex items-center gap-3 shrink-0">
            <button onClick={() => setSidebarOpen(true)} className="p-1.5 text-stone-600 hover:text-stone-900">
              <FiMenu size={20} />
            </button>
            <span className="font-semibold text-stone-800 text-sm">Admin Panel</span>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            <Outlet />
          </main>
        </div>

        <Toaster
          position="top-right"
          toastOptions={{ style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' } }}
        />
      </div>
    </ProtectedRoute>
  );
}
