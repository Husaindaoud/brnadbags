import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
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
      setCategories(c.filter(cat => cat.parent_id == null && cat.slug));
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
      <style>{`
        .hero-swiper { width: 100%; display: block; }
        .hero-swiper .swiper-button-prev,
        .hero-swiper .swiper-button-next {
          width: 44px; height: 44px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.3);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-radius: 0;
          color: #fff;
          transition: background 0.2s;
          top: 50%;
        }
        .hero-swiper .swiper-button-prev { left: 20px; }
        .hero-swiper .swiper-button-next { right: 20px; }
        .hero-swiper .swiper-button-prev:hover,
        .hero-swiper .swiper-button-next:hover {
          background: rgba(255,255,255,0.25);
        }
        .hero-swiper .swiper-button-prev::after,
        .hero-swiper .swiper-button-next::after {
          font-size: 14px; font-weight: 900;
        }
        .hero-swiper .swiper-pagination {
          bottom: 18px;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .hero-swiper .swiper-pagination-bullet {
          width: 24px; height: 2px; border-radius: 0;
          background: rgba(255,255,255,0.4);
          opacity: 1; margin: 0;
          transition: width 0.4s ease, background 0.4s ease;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          width: 48px; background: #fff;
        }
        @media (max-width: 640px) {
          .hero-swiper .swiper-button-prev,
          .hero-swiper .swiper-button-next { display: none; }
        }
      `}</style>

      {slides.length > 0 ? (
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5500, disableOnInteraction: false }}
          loop={slides.length > 1}
          autoHeight
          className="hero-swiper"
        >
          {slides.map(slide => (
            <SwiperSlide key={slide.id}>
              <div style={{ position: 'relative', width: '100%', lineHeight: 0 }}>
                {/* Image at full natural proportions — zero cropping */}
                <img
                  src={getImageUrl(slide.image_url)}
                  alt={slide.caption || 'Slide'}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
                {/* Subtle vignette so caption stays readable */}
                {(slide.caption || slide.link) && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: '45%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)',
                    pointerEvents: 'none',
                  }} />
                )}
                {/* Caption + CTA */}
                {(slide.caption || slide.link) && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '0 clamp(16px, 5vw, 64px) clamp(32px, 5vh, 60px)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                  }}>
                    {slide.caption && (
                      <h2
                        className="font-display text-white font-bold"
                        style={{
                          fontSize: 'clamp(1.3rem, 3.5vw, 2.8rem)',
                          letterSpacing: '0.07em',
                          marginBottom: '18px',
                          textShadow: '0 2px 20px rgba(0,0,0,0.55)',
                          lineHeight: 1.2,
                        }}
                      >
                        {slide.caption}
                      </h2>
                    )}
                    {slide.link && (
                      <Link
                        to={slide.link}
                        style={{
                          display: 'inline-block',
                          border: '1px solid rgba(255,255,255,0.75)',
                          color: '#fff',
                          fontSize: '10px',
                          letterSpacing: '0.24em',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          padding: '12px 38px',
                          background: 'rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(6px)',
                          WebkitBackdropFilter: 'blur(6px)',
                        }}
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
          style={{
            height: 'clamp(360px, 68vh, 760px)',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2520 50%, #1a1a1a 100%)',
          }}
        >
          <div style={{ marginBottom: '16px', height: '1px', width: '48px', background: '#b8966a' }} />
          <h1
            className="font-display font-bold text-white mb-5"
            style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', letterSpacing: '0.08em' }}
          >
            Brand Bags & More
          </h1>
          <p
            className="text-stone-400 mb-10"
            style={{ fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase' }}
          >
            Curated fashion for the modern woman
          </p>
          <Link
            to="/categories"
            style={{
              border: '1px solid rgba(184,150,106,0.7)',
              color: '#b8966a',
              fontSize: '10px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              fontWeight: 600,
              padding: '13px 40px',
              display: 'inline-block',
            }}
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
