import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { slidersApi, categoriesApi, productsApi, getImageUrl } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

function SectionHeader({ title, viewAllTo }) {
  return (
    <div className="flex items-end justify-between mb-10">
      <div>
        <h2
          className="font-bold text-stone-900"
          style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', letterSpacing: '0.14em', textTransform: 'uppercase' }}
        >
          {title}
        </h2>
        <div className="mt-3 h-px w-12" style={{ background: '#b8966a' }} />
      </div>
      {viewAllTo && (
        <Link
          to={viewAllTo}
          className="hidden sm:inline-flex items-center border border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white transition-colors"
          style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, padding: '8px 20px' }}
        >
          View All
        </Link>
      )}
    </div>
  );
}

function ViewAllMobile({ to }) {
  return (
    <div className="mt-8 text-center sm:hidden">
      <Link
        to={to}
        className="inline-flex items-center border border-stone-800 text-stone-800"
        style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, padding: '8px 28px' }}
      >
        View All
      </Link>
    </div>
  );
}

export default function HomePage() {
  const [slides, setSlides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      slidersApi.list(),
      categoriesApi.list(),
      productsApi.list({ new: true, limit: 8 }),
      productsApi.list({ on_sale: true, limit: 8 }),
    ]).then(([s, c, np, sp]) => {
      setSlides(s);
      setCategories(c);
      setNewProducts(np);
      setSaleProducts(sp);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );

  return (
    <div className="bg-white">

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      {slides.length > 0 ? (
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={slides.length > 1}
          className="w-full"
        >
          {slides.map(slide => (
            <SwiperSlide key={slide.id}>
              <div className="relative bg-stone-100 overflow-hidden" style={{ aspectRatio: '16/6' }}>
                <img
                  src={getImageUrl(slide.image_url)}
                  alt={slide.caption || 'Slide'}
                  className="w-full h-full object-cover"
                />
                {(slide.caption || slide.link) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 sm:pb-14 px-4 text-center"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)' }}
                  >
                    {slide.caption && (
                      <h2 className="font-display text-white font-bold mb-5 drop-shadow"
                        style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)', letterSpacing: '0.06em' }}>
                        {slide.caption}
                      </h2>
                    )}
                    {slide.link && (
                      <Link
                        to={slide.link}
                        className="border border-white text-white hover:bg-white hover:text-stone-900 transition-colors"
                        style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, padding: '10px 32px' }}
                      >
                        Shop Now
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div
          className="relative flex flex-col items-center justify-center text-center px-4"
          style={{ aspectRatio: '16/6', background: '#f5f0ea' }}
        >
          <h1 className="font-display font-bold text-stone-900 mb-4" style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', letterSpacing: '0.06em' }}>
            Welcome to Brand Bags
          </h1>
          <p className="text-stone-500 mb-8" style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Discover your next favourite piece
          </p>
          <Link
            to="/categories"
            className="border border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white transition-colors"
            style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, padding: '11px 36px' }}
          >
            Shop Now
          </Link>
        </div>
      )}

      {/* ── Categories ─────────────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h2
              className="font-bold text-stone-900"
              style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', letterSpacing: '0.14em', textTransform: 'uppercase' }}
            >
              Shop by Category
            </h2>
            <div className="mx-auto mt-3 h-px w-12" style={{ background: '#b8966a' }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  to={`/categories/${cat.slug}`}
                  className="group relative block overflow-hidden bg-stone-100"
                  style={{ aspectRatio: '1/1' }}
                >
                  {cat.image_url ? (
                    <img
                      src={getImageUrl(cat.image_url)}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-stone-100" />
                  )}
                  <div
                    className="absolute inset-0 flex items-end p-4"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)' }}
                  >
                    <span
                      className="text-white font-semibold"
                      style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' }}
                    >
                      {cat.name}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── New Collection ─────────────────────────────────────────────────── */}
      {newProducts.length > 0 && (
        <section className="py-16" style={{ background: '#faf8f5' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader title="New Collection" viewAllTo="/new-collection" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
              {newProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            <ViewAllMobile to="/new-collection" />
          </div>
        </section>
      )}

      {/* ── Sale ───────────────────────────────────────────────────────────── */}
      {saleProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader title="On Sale" viewAllTo="/sale" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
              {saleProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            <ViewAllMobile to="/sale" />
          </div>
        </section>
      )}

    </div>
  );
}
