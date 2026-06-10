import { Link, useParams } from 'react-router-dom';

const BRAND = '#b8966a';

export default function OrderConfirmedPage() {
  const { ref } = useParams();

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f0ece6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={BRAND} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <p style={{ color: BRAND, fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: '8px' }}>
        Thank You
      </p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, letterSpacing: '0.06em', color: '#1a1a1a', marginBottom: '10px' }}>
        Order Confirmed
      </h1>
      <div style={{ height: '1px', width: '32px', background: BRAND, margin: '0 auto 20px' }} />

      <p style={{ fontSize: '13px', color: '#78716c', lineHeight: 1.7, marginBottom: '6px' }}>
        Your order has been received and is being processed.
      </p>
      <p style={{ fontSize: '13px', color: '#78716c', lineHeight: 1.7, marginBottom: '28px' }}>
        Order Reference: <span style={{ fontWeight: 700, color: '#1a1a1a', letterSpacing: '0.06em' }}>{ref}</span>
      </p>

      <Link to="/"
        style={{ display: 'inline-block', border: `1px solid ${BRAND}`, color: BRAND, padding: '11px 32px', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, transition: 'all 0.2s' }}>
        Continue Shopping
      </Link>
    </div>
  );
}
