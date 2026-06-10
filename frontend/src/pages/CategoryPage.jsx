import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categoriesApi, productsApi, brandsApi } from '../services/api';
import ProductCard from '../components/ProductCard';
import FilterBar from '../components/FilterBar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingCat, setLoadingCat] = useState(true);
  const [loadingProds, setLoadingProds] = useState(false);
  const [filters, setFilters] = useState({});

  // Resolve category from slug
  useEffect(() => {
    setLoadingCat(true);
    setNotFound(false);
    Promise.all([categoriesApi.list(), brandsApi.list()])
      .then(([cats, brs]) => {
        setBrands(brs);
        const cat = cats.find(c => c.slug === slug);
        if (cat) {
          setCategory(cat);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoadingCat(false));
  }, [slug]);

  const fetchProducts = useCallback(() => {
    if (!category) return;
    setLoadingProds(true);
    productsApi.list({ ...filters, category_id: category.id })
      .then(setProducts)
      .finally(() => setLoadingProds(false));
  }, [category, filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  if (loadingCat) return <LoadingSpinner className="min-h-[40vh]" size="lg" />;

  if (notFound) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <p className="text-6xl mb-4">🏷️</p>
      <h2 className="font-display text-3xl font-bold text-stone-800 mb-3">Category not found</h2>
      <p className="text-stone-400 mb-6">We couldn't find the "{slug}" category.</p>
      <Link to="/categories" className="px-6 py-3 bg-rose-500 text-white font-semibold rounded-full hover:bg-rose-600 transition-colors">
        Browse All Categories
      </Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-stone-400 mb-6 flex items-center gap-1.5">
        <Link to="/" className="hover:text-stone-600">Home</Link>
        <span>/</span>
        <Link to="/categories" className="hover:text-stone-600">Categories</Link>
        <span>/</span>
        <span className="text-stone-700">{category.name}</span>
      </nav>

      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl sm:text-4xl font-bold text-stone-900 mb-8"
      >
        {category.name}
      </motion.h1>

      <FilterBar filters={filters} onChange={setFilters} brands={brands} />

      {loadingProds ? (
        <LoadingSpinner className="mt-20" size="lg" />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products in this category yet"
          message="Check back soon for new arrivals"
          icon="👗"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </motion.div>
      )}
    </div>
  );
}
