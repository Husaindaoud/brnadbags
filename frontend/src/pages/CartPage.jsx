import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { getImageUrl } from '../services/api';

function buildWhatsAppMessage(items) {
  const lines = items.map((item, i) => {
    const sizeStr = item.size ? ` / Size: ${item.size}` : '';
    return `${i + 1}. ${item.product.name}${sizeStr} (Qty: ${item.quantity}) — $${(item.product.final_price * item.quantity).toFixed(2)}`;
  });
  const subtotal = items.reduce((s, i) => s + i.product.final_price * i.quantity, 0);
  return encodeURIComponent(
    `Hello! I'd like to inquire about the following items:\n\n${lines.join('\n')}\n\nSubtotal: $${subtotal.toFixed(2)}\n\nPlease let me know about availability and how to proceed. Thank you!`
  );
}

const BRAND = '#b8966a';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  // cart items are keyed by (product.id, size)
  const { settings } = useSettings();
  const navigate = useNavigate();
  const waNumber = settings?.whatsapp_number?.replace(/\D/g, '');

  const waUrl = waNumber
    ? `https://wa.me/${waNumber}?text=${buildWhatsAppMessage(items)}`
    : null;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <FiShoppingBag size={64} className="text-stone-200 mx-auto mb-6" />
        <h2 className="font-display text-3xl font-bold text-stone-800 mb-3">Your bag is empty</h2>
        <p className="text-stone-400 mb-8">Add items you're interested in and send them to us via WhatsApp.</p>
        <Link to="/" className="px-8 py-3 bg-rose-500 text-white font-semibold rounded-full hover:bg-rose-600 transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-stone-900">My Bag</h1>
        <button onClick={clearCart} className="text-xs text-stone-400 hover:text-rose-500 flex items-center gap-1 transition-colors">
          <FiTrash2 size={13} /> Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {items.map(({ product, quantity, size }) => (
              <motion.div
                key={`${product.id}-${size}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm border border-stone-100"
              >
                <Link to={`/products/${product.id}`} className="shrink-0">
                  <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-stone-100">
                    {product.primary_image_url ? (
                      <img src={getImageUrl(product.primary_image_url)} alt={product.name}
                        className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full bg-stone-100" />}
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/products/${product.id}`}>
                    <h3 className="font-semibold text-stone-800 text-sm sm:text-base leading-snug hover:text-rose-500 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    {product.brand && <p className="text-xs text-stone-400">{product.brand.name}</p>}
                    {size && <span className="text-xs font-semibold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">Size {size}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-stone-900 text-sm">${product.final_price.toFixed(2)}</span>
                    {product.discount_percent > 0 && (
                      <span className="text-xs text-stone-400 line-through">${product.price.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                      <button onClick={() => updateQuantity(product.id, quantity - 1, size)}
                        className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-50">
                        <FiMinus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, quantity + 1, size)}
                        className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-50">
                        <FiPlus size={12} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-stone-700">
                        ${(product.final_price * quantity).toFixed(2)}
                      </span>
                      <button onClick={() => removeItem(product.id, size)}
                        className="text-stone-300 hover:text-rose-400 transition-colors">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 sticky top-24">
            <h3 className="font-semibold text-stone-800 mb-4 text-lg">Summary</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-stone-600">
                <span>{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between font-bold text-stone-900 text-base border-t border-stone-100 pt-3">
                <span>Estimated Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-xs text-stone-400 mb-4 leading-relaxed">
              This is a bag — not a purchase. Send via WhatsApp and we'll confirm availability and pricing.
            </p>

            <button
              onClick={() => navigate('/checkout')}
              style={{ width: '100%', padding: '14px', background: BRAND, color: '#fff', border: 'none', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', marginBottom: '10px' }}
            >
              Proceed to Checkout
            </button>

            {waUrl ? (
              <motion.a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 flex items-center justify-center gap-2 transition-colors text-sm font-semibold"
                style={{ background: '#22c55e', color: '#fff', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
              >
                <FaWhatsapp size={18} />
                Inquire via WhatsApp
              </motion.a>
            ) : null}

            <Link to="/"
              className="block text-center text-sm text-stone-400 hover:text-stone-600 mt-4 transition-colors">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
