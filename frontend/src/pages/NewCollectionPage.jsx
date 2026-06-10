import { useState, useEffect } from 'react';
import { productsApi, brandsApi } from '../services/api';
import ProductCard from '../components/ProductCard';
import FilterBar from '../components/FilterBar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function NewCollectionPage() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => { brandsApi.list().then(setBrands); }, []);

  useEffect(() => {
    setLoading(true);
    productsApi.list({ ...filters, new: true })
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Page heading */}
      <div className="mb-10">
        <p style={{ color: '#b8966a', fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 400, marginBottom: '6px' }}>
          Just Arrived
        </p>
        <h1
          className="font-display text-stone-900"
          style={{ fontSize: '1.25rem', letterSpacing: '0.08em', fontWeight: 600 }}
        >
          New Collection
        </h1>
        <div className="mt-3 h-px w-8" style={{ background: '#b8966a' }} />
      </div>

      <FilterBar filters={filters} onChange={setFilters} brands={brands} showNewFilter={false} />

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState title="No new items yet" message="Check back soon for fresh arrivals" icon="✨" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
