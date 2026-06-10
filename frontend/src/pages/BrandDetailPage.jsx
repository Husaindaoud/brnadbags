import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { brandsApi, productsApi } from '../services/api';
import { getImageUrl } from '../services/api';
import ProductCard from '../components/ProductCard';
import FilterBar from '../components/FilterBar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function BrandDetailPage() {
  const { id } = useParams();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => { brandsApi.get(id).then(setBrand).catch(() => {}); }, [id]);

  useEffect(() => {
    setLoading(true);
    productsApi.list({ ...filters, brand_id: id })
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [id, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-xs text-stone-400 mb-6 flex items-center gap-1.5">
        <Link to="/" className="hover:text-stone-600">Home</Link>
        <span>/</span>
        <Link to="/brands" className="hover:text-stone-600">Brands</Link>
        {brand && <><span>/</span><span className="text-stone-700">{brand.name}</span></>}
      </nav>

      {brand && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 mb-10">
          {brand.logo_url && (
            <img src={getImageUrl(brand.logo_url)} alt={brand.name} className="h-14 w-auto object-contain" />
          )}
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-stone-900">{brand.name}</h1>
        </motion.div>
      )}

      <FilterBar filters={filters} onChange={setFilters} brands={[]} />

      {loading ? (
        <LoadingSpinner className="mt-20" size="lg" />
      ) : products.length === 0 ? (
        <EmptyState title="No products for this brand" message="Check back soon" icon="👗" />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </motion.div>
      )}
    </div>
  );
}
