import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { brandsApi } from '../services/api';
import { getImageUrl } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    brandsApi.list().then(setBrands).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-stone-900">Brands</h1>
        <p className="text-stone-400 mt-2">Explore our curated brand selection</p>
      </motion.div>

      {loading ? (
        <LoadingSpinner className="mt-20" size="lg" />
      ) : brands.length === 0 ? (
        <EmptyState title="No brands yet" message="Check back soon" icon="🏷️" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {brands.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link to={`/brands/${brand.id}`}
                className="group block bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-stone-100 hover:border-rose-200 transition-all text-center">
                {brand.logo_url ? (
                  <div className="h-16 flex items-center justify-center mb-3">
                    <img src={getImageUrl(brand.logo_url)} alt={brand.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="h-16 flex items-center justify-center mb-3">
                    <span className="font-display text-2xl font-bold text-stone-300 group-hover:text-rose-300 transition-colors">
                      {brand.name[0]}
                    </span>
                  </div>
                )}
                <p className="font-semibold text-stone-800 text-sm group-hover:text-rose-500 transition-colors">{brand.name}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
