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
  const [activeSubcat, setActiveSubcat] = useState(null); // null = All

  // Resolve category from slug
  useEffect(() => {
    setLoadingCat(true);
    setNotFound(false);
    setActiveSubcat(null);
    Promise.all([categoriesApi.list(), brandsApi.list()])
      .then(([cats, brs]) => {
        setBrands(brs);
        const cat = cats.find(c => c.slug === slug);
        if (cat) {
          // Attach flat subcats from the full list (in case the nested rel is sparse)
          const subcats = cats.filter(c => c.parent_id === cat.id);
          setCategory({ ...cat, subcategories: subcats });
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
    const params = { ...filters, category_id: category.id };
    if (activeSubcat) params.subcategory_id = activeSubcat.id;
    productsApi.list(params)
      .then(setProducts)
      .finally(() => setLoadingProds(false));
  }, [category, filters, activeSubcat]);

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

  const subcats = category.subcategories || [];

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
        className="font-display text-3xl sm:text-4xl font-bold text-stone-900 mb-6"
      >
        {category.name}
      </motion.h1>

      {/* Subcategory tabs */}
      {subcats.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveSubcat(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              activeSubcat === null
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
            }`}
          >
            All
          </button>
          {subcats.map(sub => (
            <button
              key={sub.id}
              onClick={() => setActiveSubcat(sub)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                activeSubcat?.id === sub.id
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

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
