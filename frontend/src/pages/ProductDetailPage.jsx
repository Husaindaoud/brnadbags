import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiCheck, FiMinus, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { productsApi } from '../services/api';
import ImageGallery from '../components/ImageGallery';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCart } from '../context/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem, isInCart, getCartItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    setSelectedSize(null);
    setSizeError(false);
    productsApi.get(id).then(setProduct).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;
  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-stone-500">Product not found.</p>
      <Link to="/" className="text-rose-500 hover:underline mt-2 inline-block">← Back to home</Link>
    </div>
  );

  const hasSizes = product.sizes?.length > 0;
  const hasDiscount = product.discount_percent && product.discount_percent > 0;
  const inCart = isInCart(product.id, hasSizes ? selectedSize : undefined);
  const cartItem = getCartItem(product.id, hasSizes ? selectedSize : null);

  const handleAdd = () => {
    if (product.is_sold_out) return;
    if (hasSizes && !selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    addItem(product, qty, hasSizes ? selectedSize : null);
    toast.success(`${product.name}${selectedSize ? ` (Size ${selectedSize})` : ''} added to bag!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-stone-400 mb-6 flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="hover:text-stone-600">Home</Link>
        {product.category && (
          <><span>/</span>
          <Link to={`/categories/${product.category.slug}`} className="hover:text-stone-600">
            {product.category.name}
          </Link></>
        )}
        <span>/</span>
        <span className="text-stone-700 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Gallery */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <ImageGallery images={product.images} productName={product.name} />
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          {/* Brand + Collection badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {product.brand && (
              <Link to={`/brands/${product.brand.id}`}
                className="text-xs font-semibold text-stone-400 uppercase tracking-widest hover:text-rose-500 transition-colors">
                {product.brand.name}
              </Link>
            )}
            {product.collection?.is_new && (
              <span className="text-xs bg-stone-900 text-white px-2 py-0.5 rounded-full font-semibold">NEW</span>
            )}
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 mb-4 leading-tight">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl font-bold text-stone-900">${product.final_price.toFixed(2)}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-stone-400 line-through">${product.price.toFixed(2)}</span>
                <span className="bg-rose-100 text-rose-600 text-sm font-bold px-2 py-0.5 rounded-full">
                  -{product.discount_percent}% OFF
                </span>
              </>
            )}
          </div>

          {/* Availability */}
          <div className="mb-6">
            {product.is_sold_out ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full">
                Sold Out
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                ✓ Available
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-8">
              <p className="text-stone-600 leading-relaxed text-sm">{product.description}</p>
            </div>
          )}

          {/* Category/Collection info */}
          <div className="flex flex-wrap gap-4 mb-8 text-sm">
            {product.category && (
              <div className="text-stone-500">
                Category: <Link to={`/categories/${product.category.slug}`} className="text-stone-800 font-medium hover:text-rose-500">{product.category.name}</Link>
              </div>
            )}
            {product.collection && (
              <div className="text-stone-500">
                Collection: <span className="text-stone-800 font-medium">{product.collection.name}</span>
              </div>
            )}
          </div>

          {/* Size selector */}
          {hasSizes && !product.is_sold_out && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-stone-700">Size</span>
                {selectedSize && (
                  <span className="text-xs text-stone-400">Selected: <strong className="text-stone-700">{selectedSize}</strong></span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setSizeError(false); }}
                    className={`min-w-[48px] h-11 px-3 text-sm font-semibold rounded-xl border-2 transition-all ${
                      selectedSize === size
                        ? 'bg-stone-900 border-stone-900 text-white scale-105'
                        : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {sizeError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-rose-500 mt-2 font-medium"
                >
                  Please select a size before adding to bag
                </motion.p>
              )}
            </div>
          )}

          {/* Qty selector + Add button */}
          {!product.is_sold_out && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-stone-600">Quantity:</span>
                <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors">
                    <FiMinus size={14} />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.quantity, q + 1))}
                    className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors">
                    <FiPlus size={14} />
                  </button>
                </div>
              </div>

              <motion.button
                onClick={handleAdd}
                whileTap={{ scale: 0.97 }}
                className={`w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                  inCart
                    ? 'bg-stone-900 text-white hover:bg-stone-800'
                    : sizeError
                    ? 'bg-rose-100 text-rose-600 border-2 border-rose-300'
                    : 'bg-rose-500 text-white hover:bg-rose-600'
                }`}
              >
                {inCart ? (
                  <><FiCheck size={16} /> In Bag ({cartItem?.quantity})</>
                ) : hasSizes && !selectedSize ? (
                  <><FiShoppingBag size={16} /> Select a Size</>
                ) : (
                  <><FiShoppingBag size={16} /> Add to Bag</>
                )}
              </motion.button>

              {inCart && (
                <Link to="/cart"
                  className="w-full py-3 rounded-2xl text-sm font-semibold border border-stone-200 text-stone-700 hover:border-rose-300 hover:text-rose-500 transition-colors text-center">
                  View Bag →
                </Link>
              )}
            </div>
          )}

          {product.is_sold_out && (
            <div className="bg-stone-50 rounded-2xl p-4 text-sm text-stone-500 text-center">
              This item is currently sold out. Contact us on WhatsApp to be notified when it's back.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
