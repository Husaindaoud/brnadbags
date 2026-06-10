import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productsApi, brandsApi } from '../services/api';
import ProductCard from '../components/ProductCard';
import FilterBar from '../components/FilterBar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => { brandsApi.list().then(setBrands); }, []);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    productsApi.list({ ...filters, search: query })
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [query, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <p className="text-stone-400 text-sm mb-1">Search results for</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-stone-900">"{query}"</h1>
        {!loading && <p className="text-stone-400 text-sm mt-2">{products.length} result{products.length !== 1 ? 's' : ''}</p>}
      </motion.div>

      <FilterBar filters={filters} onChange={setFilters} brands={brands} />

      {loading ? (
        <LoadingSpinner className="mt-20" size="lg" />
      ) : products.length === 0 ? (
        <EmptyState title="No results found" message={`We couldn't find anything for "${query}"`} icon="🔍" />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </motion.div>
      )}
    </div>
  );
}
