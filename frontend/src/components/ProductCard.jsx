import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiCheck } from 'react-icons/fi';
import { getImageUrl } from '../services/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addItem, isInCart } = useCart();
  const navigate = useNavigate();
  const hasSizes = product.sizes?.length > 0;
  const inCart = isInCart(product.id);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.is_sold_out) return;
    if (hasSizes) {
      navigate(`/products/${product.id}`);
      return;
    }
    addItem(product, 1);
    toast.success(`${product.name} added to bag`);
  };

  const imageUrl = getImageUrl(product.primary_image_url);
  const hasDiscount = product.discount_percent && product.discount_percent > 0;

  return (
    <div className={`group relative ${product.is_sold_out ? 'opacity-70' : ''}`}>
      <Link to={`/products/${product.id}`} className="block">

        {/* Image */}
        <div className="relative overflow-hidden" style={{ background: '#f2f2f2', aspectRatio: '1/1' }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${
                product.is_sold_out ? 'grayscale-[30%]' : ''
              }`}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300">
              <FiShoppingBag size={40} />
            </div>
          )}

          {/* Discount badge */}
          {hasDiscount && (
            <span
              className="absolute top-2 left-2 text-white font-semibold"
              style={{
                background: '#b8966a',
                fontSize: '9px',
                letterSpacing: '0.06em',
                padding: '2px 6px',
              }}
            >
              -{product.discount_percent}%
            </span>
          )}

          {/* NEW badge */}
          {product.collection?.is_new && !hasDiscount && (
            <span
              className="absolute top-2.5 left-2.5 text-white font-semibold"
              style={{
                background: '#1a1a1a',
                fontSize: '10px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '3px 7px',
              }}
            >
              New
            </span>
          )}

          {/* Sold out */}
          {product.is_sold_out && (
            <div className="absolute inset-0 bg-white/30 flex items-center justify-center">
              <span
                className="text-white font-semibold"
                style={{
                  background: '#1a1a1a',
                  fontSize: '10px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  padding: '5px 12px',
                }}
              >
                Sold Out
              </span>
            </div>
          )}

          {/* Add to inquiry — appears on hover */}
          {!product.is_sold_out && (
            <div className="absolute bottom-0 inset-x-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleAdd}
                className="w-full flex items-center justify-center gap-1.5 text-white transition-colors"
                style={{
                  background: inCart ? '#1a1a1a' : '#b8966a',
                  fontSize: '10px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  padding: '11px 0',
                }}
              >
                {hasSizes ? 'Select Size' : inCart ? <><FiCheck size={11} /> In Bag</> : <><FiShoppingBag size={11} /> Add to Bag</>}
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pt-2 pb-1">
          {product.brand && (
            <p className="text-stone-400 mb-0.5" style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {product.brand.name}
            </p>
          )}
          <h3
            className="text-stone-800 font-semibold line-clamp-2 leading-tight mb-1"
            style={{ fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' }}
          >
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-stone-900" style={{ fontSize: '11px' }}>${product.final_price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-stone-400 line-through" style={{ fontSize: '10px' }}>${product.price.toFixed(2)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
