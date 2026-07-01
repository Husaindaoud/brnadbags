import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersApi, promoApi, getImageUrl } from '../services/api';

const BRAND = '#b8966a';

const COUNTRIES = [
  'Lebanon', 'United Arab Emirates', 'Saudi Arabia', 'Kuwait', 'Qatar',
  'Bahrain', 'Oman', 'Jordan', 'Egypt', 'United States', 'United Kingdom',
  'France', 'Germany', 'Canada', 'Australia', 'Other',
];

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d6d0c8',
  background: '#fff',
  fontSize: '13px',
  color: '#1a1a1a',
  outline: 'none',
  transition: 'border-color 0.2s',
};

const labelStyle = {
  display: 'block',
  fontSize: '10px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  fontWeight: 600,
  color: '#57534e',
  marginBottom: '6px',
};

function Field({ label, required, children }) {
  return (
    <div>
      <label style={labelStyle}>
        {label}{required && <span style={{ color: BRAND, marginLeft: '2px' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [promoInput, setPromoInput] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [checkingPromo, setCheckingPromo] = useState(false);

  const [form, setForm] = useState({
    first_name: '', last_name: '', company_name: '',
    country: 'Lebanon', street_address: '', apartment: '',
    city: '', postcode: '', phone: '', email: '', order_notes: '',
  });

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-stone-400 mb-6" style={{ fontSize: '13px' }}>Your cart is empty.</p>
        <Link to="/"
          style={{ border: `1px solid ${BRAND}`, color: BRAND, padding: '10px 28px', fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const discountAmount = promoApplied ? +(totalPrice * promoDiscount / 100).toFixed(2) : 0;
  const finalTotal = +(totalPrice - discountAmount).toFixed(2);

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setCheckingPromo(true);
    setPromoMsg('');
    try {
      const result = await promoApi.validate(promoInput.trim());
      if (result.valid) {
        setPromoDiscount(result.discount_percent);
        setPromoApplied(true);
        setPromoMsg(result.message);
      } else {
        setPromoApplied(false);
        setPromoDiscount(0);
        setPromoMsg(result.message);
      }
    } catch {
      setPromoMsg('Failed to validate promo code.');
    } finally {
      setCheckingPromo(false);
    }
  };

  const removePromo = () => {
    setPromoInput('');
    setPromoDiscount(0);
    setPromoApplied(false);
    setPromoMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const orderItems = items.map(({ product, quantity }) => ({
        product_id: product.id,
        product_name: product.name,
        product_image_url: product.primary_image_url || null,
        price: product.final_price,
        quantity,
      }));
      const order = await ordersApi.create({
        ...form,
        items: orderItems,
        promo_code: promoApplied ? promoInput.trim() : null,
      });
      clearCart();
      navigate(`/order-confirmed/${order.order_ref}`);
    } catch {
      setError('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* heading */}
      <div className="mb-8">
        <p style={{ color: BRAND, fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: '6px' }}>
          Secure Checkout
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 600, letterSpacing: '0.08em', color: '#1a1a1a' }}>
          Place Your Order
        </h1>
        <div style={{ marginTop: '10px', height: '1px', width: '32px', background: BRAND }} />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* ── Left: billing form ─────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-5">
            <h2 style={{ fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, color: '#1a1a1a', borderBottom: '1px solid #e8e3db', paddingBottom: '12px' }}>
              Billing Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First Name" required>
                <input required value={form.first_name} onChange={e => set('first_name', e.target.value)}
                  style={inputStyle} onFocus={e => e.target.style.borderColor = BRAND} onBlur={e => e.target.style.borderColor = '#d6d0c8'} />
              </Field>
              <Field label="Last Name" required>
                <input required value={form.last_name} onChange={e => set('last_name', e.target.value)}
                  style={inputStyle} onFocus={e => e.target.style.borderColor = BRAND} onBlur={e => e.target.style.borderColor = '#d6d0c8'} />
              </Field>
            </div>

            <Field label="Company Name (optional)">
              <input value={form.company_name} onChange={e => set('company_name', e.target.value)}
                style={inputStyle} onFocus={e => e.target.style.borderColor = BRAND} onBlur={e => e.target.style.borderColor = '#d6d0c8'} />
            </Field>

            <Field label="Country / Region" required>
              <select required value={form.country} onChange={e => set('country', e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}>
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="Street Address" required>
              <input required placeholder="House number and street name" value={form.street_address}
                onChange={e => set('street_address', e.target.value)}
                style={inputStyle} onFocus={e => e.target.style.borderColor = BRAND} onBlur={e => e.target.style.borderColor = '#d6d0c8'} />
            </Field>

            <Field label="Apartment, suite, unit (optional)">
              <input placeholder="Apartment, suite, unit, etc." value={form.apartment}
                onChange={e => set('apartment', e.target.value)}
                style={inputStyle} onFocus={e => e.target.style.borderColor = BRAND} onBlur={e => e.target.style.borderColor = '#d6d0c8'} />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Town / City" required>
                <input required value={form.city} onChange={e => set('city', e.target.value)}
                  style={inputStyle} onFocus={e => e.target.style.borderColor = BRAND} onBlur={e => e.target.style.borderColor = '#d6d0c8'} />
              </Field>
              <Field label="Postcode / ZIP">
                <input value={form.postcode} onChange={e => set('postcode', e.target.value)}
                  style={inputStyle} onFocus={e => e.target.style.borderColor = BRAND} onBlur={e => e.target.style.borderColor = '#d6d0c8'} />
              </Field>
            </div>

            <Field label="Phone" required>
              <input required type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                style={inputStyle} onFocus={e => e.target.style.borderColor = BRAND} onBlur={e => e.target.style.borderColor = '#d6d0c8'} />
            </Field>

            <Field label="Email Address">
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                style={inputStyle} onFocus={e => e.target.style.borderColor = BRAND} onBlur={e => e.target.style.borderColor = '#d6d0c8'} />
            </Field>

            <Field label="Order Notes (optional)">
              <textarea rows={3} placeholder="Notes about your order, e.g. special delivery instructions"
                value={form.order_notes} onChange={e => set('order_notes', e.target.value)}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => e.target.style.borderColor = BRAND} onBlur={e => e.target.style.borderColor = '#d6d0c8'} />
            </Field>
          </div>

          {/* ── Right: order summary ───────────────────────────────── */}
          <div className="lg:col-span-2">
            <div style={{ border: '1px solid #e8e3db', position: 'sticky', top: '100px' }}>
              <h2 style={{ fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, color: '#1a1a1a', padding: '16px 20px', borderBottom: '1px solid #e8e3db' }}>
                Order Summary
              </h2>

              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0ece6' }}>
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-3 mb-4">
                    <div style={{ width: '56px', height: '56px', background: '#f2f2f2', flexShrink: 0, position: 'relative' }}>
                      {product.primary_image_url && (
                        <img src={getImageUrl(product.primary_image_url)} alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#1a1a1a', color: '#fff', fontSize: '9px', fontWeight: 700, width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1a1a1a' }} className="line-clamp-2">
                        {product.name}
                      </p>
                      {product.brand && <p style={{ fontSize: '10px', color: '#78716c', marginTop: '2px' }}>{product.brand.name}</p>}
                    </div>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', flexShrink: 0 }}>
                      ${(product.final_price * quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Promo code */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0ece6' }}>
                <p style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: '#1a1a1a', marginBottom: '10px' }}>
                  Promo Code
                </p>
                {promoApplied ? (
                  <div className="flex items-center justify-between" style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '8px 12px' }}>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#15803d', letterSpacing: '0.06em' }}>{promoInput.toUpperCase()}</span>
                      <span style={{ fontSize: '11px', color: '#15803d', marginLeft: '8px' }}>−{promoDiscount}% off</span>
                    </div>
                    <button onClick={removePromo} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#78716c', textDecoration: 'underline' }}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={promoInput}
                      onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoMsg(''); }}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), applyPromo())}
                      placeholder="Enter code"
                      style={{ flex: 1, padding: '8px 10px', border: '1px solid #d6d0c8', fontSize: '12px', outline: 'none', letterSpacing: '0.06em' }}
                    />
                    <button
                      type="button"
                      onClick={applyPromo}
                      disabled={checkingPromo || !promoInput.trim()}
                      style={{ padding: '8px 14px', background: checkingPromo || !promoInput.trim() ? '#e0d5c8' : BRAND, color: '#fff', border: 'none', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: checkingPromo || !promoInput.trim() ? 'not-allowed' : 'pointer' }}
                    >
                      {checkingPromo ? '…' : 'Apply'}
                    </button>
                  </div>
                )}
                {promoMsg && !promoApplied && (
                  <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '6px' }}>{promoMsg}</p>
                )}
              </div>

              {/* Totals */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0ece6' }}>
                <div className="flex justify-between mb-2">
                  <span style={{ fontSize: '11px', color: '#78716c', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Subtotal</span>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>${totalPrice.toFixed(2)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between mb-2">
                    <span style={{ fontSize: '11px', color: '#15803d', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Discount ({promoDiscount}%)</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803d' }}>−${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between mb-2">
                  <span style={{ fontSize: '11px', color: '#78716c', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Shipping</span>
                  <span style={{ fontSize: '11px', color: '#78716c' }}>Calculated at delivery</span>
                </div>
                <div className="flex justify-between mt-3 pt-3" style={{ borderTop: '1px solid #e8e3db' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Total</span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: BRAND }}>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0ece6' }}>
                <h3 style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: '#1a1a1a', marginBottom: '10px' }}>
                  Payment Information
                </h3>
                <div style={{ border: '1px solid #d6d0c8', padding: '10px 14px', background: '#fafaf8' }}>
                  <div className="flex items-center gap-2">
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: `2px solid ${BRAND}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: BRAND }} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#1a1a1a' }}>Cash on Delivery</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#78716c', marginTop: '6px', marginLeft: '22px' }}>
                    Pay when your order is delivered.
                  </p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{ padding: '10px 20px', background: '#fef2f2', color: '#dc2626', fontSize: '12px' }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <div style={{ padding: '16px 20px' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: submitting ? '#c4a882' : BRAND,
                    color: '#fff',
                    border: 'none',
                    fontSize: '11px',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {submitting ? 'Placing Order…' : 'Place Order'}
                </button>
                <Link to="/cart" style={{ display: 'block', textAlign: 'center', marginTop: '12px', fontSize: '10px', color: '#78716c', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  ← Back to Cart
                </Link>
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
