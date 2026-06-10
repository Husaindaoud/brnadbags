import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { productsApi, brandsApi } from '../services/api';
import ProductCard from '../components/ProductCard';
import FilterBar from '../components/FilterBar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function SalePage() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => { brandsApi.list().then(setBrands); }, []);

  useEffect(() => {
    setLoading(true);
    productsApi.list({ ...filters, on_sale: true })
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-rose-500 font-semibold text-sm uppercase tracking-widest mb-1">Limited Time</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 mb-8">Sale & Discounts</h1>
      </motion.div>

      <FilterBar filters={filters} onChange={setFilters} brands={brands} showNewFilter />

      {loading ? (
        <LoadingSpinner className="mt-20" size="lg" />
      ) : products.length === 0 ? (
        <EmptyState title="No sale items right now" message="Check back soon for great deals" icon="🏷️" />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </motion.div>
      )}
    </div>
  );
}
