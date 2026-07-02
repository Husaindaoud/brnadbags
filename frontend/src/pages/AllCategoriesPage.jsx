import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categoriesApi } from '../services/api';
import { getImageUrl } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function AllCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesApi.list()
      .then(cats => setCategories(cats.filter(c => c.parent_id == null && c.slug)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-stone-900">All Categories</h1>
        <p className="text-stone-400 mt-2">Explore our full range</p>
      </motion.div>

      {loading ? (
        <LoadingSpinner className="mt-20" size="lg" />
      ) : categories.length === 0 ? (
        <EmptyState title="No categories yet" message="Check back soon" icon="🛍️" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link to={`/categories/${cat.slug}`}
                className="group relative block aspect-square rounded-2xl overflow-hidden bg-stone-100 shadow-sm hover:shadow-md transition-shadow">
                {cat.image_url ? (
                  <img src={getImageUrl(cat.image_url)} alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-rose-100 to-stone-100 flex items-center justify-center">
                    <span className="font-display text-4xl font-bold text-stone-300">{cat.name[0]}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent flex items-end p-4">
                  <span className="text-white font-semibold text-sm sm:text-base">{cat.name}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
