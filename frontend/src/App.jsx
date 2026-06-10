import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';

// Public layout + pages
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AllCategoriesPage from './pages/AllCategoriesPage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import NewCollectionPage from './pages/NewCollectionPage';
import SalePage from './pages/SalePage';
import BrandsPage from './pages/BrandsPage';
import BrandDetailPage from './pages/BrandDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmedPage from './pages/OrderConfirmedPage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import SettingsPage from './pages/admin/SettingsPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import BrandsAdminPage from './pages/admin/BrandsPage';
import CollectionsPage from './pages/admin/CollectionsPage';
import ProductsPage from './pages/admin/ProductsPage';
import ProductFormPage from './pages/admin/ProductFormPage';
import SlidersPage from './pages/admin/SlidersPage';
import AnnouncementsPage from './pages/admin/AnnouncementsPage';
import OrdersAdminPage from './pages/admin/OrdersPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <CartProvider>
            <Routes>
              {/* Public site */}
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="categories" element={<AllCategoriesPage />} />
                <Route path="categories/:slug" element={<CategoryPage />} />
                <Route path="products/:id" element={<ProductDetailPage />} />
                <Route path="new-collection" element={<NewCollectionPage />} />
                <Route path="sale" element={<SalePage />} />
                <Route path="brands" element={<BrandsPage />} />
                <Route path="brands/:id" element={<BrandDetailPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="order-confirmed/:ref" element={<OrderConfirmedPage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="brands" element={<BrandsAdminPage />} />
                <Route path="collections" element={<CollectionsPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="products/new" element={<ProductFormPage />} />
                <Route path="products/:id/edit" element={<ProductFormPage />} />
                <Route path="sliders" element={<SlidersPage />} />
                <Route path="announcements" element={<AnnouncementsPage />} />
                <Route path="orders" element={<OrdersAdminPage />} />
              </Route>
            </Routes>
          </CartProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
