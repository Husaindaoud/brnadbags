import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../services/api';
import { FiShoppingBag } from 'react-icons/fi';

export default function ImageGallery({ images = [], productName = '' }) {
  const sorted = [...images].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
  const [activeIndex, setActiveIndex] = useState(0);
  const active = sorted[activeIndex];

  if (!sorted.length) {
    return (
      <div className="aspect-square bg-stone-100 rounded-2xl flex items-center justify-center text-stone-300">
        <FiShoppingBag size={64} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square sm:aspect-[4/5] bg-stone-100 rounded-2xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={active.id}
            src={getImageUrl(active.image_url)}
            alt={productName}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
        </AnimatePresence>
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                i === activeIndex ? 'border-rose-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={getImageUrl(img.image_url)}
                alt={`View ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
