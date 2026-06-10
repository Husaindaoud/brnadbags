import { useState, useEffect } from 'react';
import { ordersApi } from '../../services/api';

const BRAND = '#b8966a';

const STATUS_COLORS = {
  pending:   { bg: '#fef9f0', color: '#b45309', border: '#fde68a' },
  confirmed: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  shipped:   { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  delivered: { bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
  cancelled: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, padding: '3px 8px' }}>
      {status}
    </span>
  );
}

function OrderRow({ order, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleStatus = async (e) => {
    setUpdating(true);
    try { await onStatusChange(order.id, e.target.value); }
    finally { setUpdating(false); }
  };

  const date = new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <>
      <tr style={{ borderBottom: '1px solid #f0ece6', cursor: 'pointer' }} onClick={() => setOpen(!open)}>
        <td style={tdStyle}><span style={{ fontWeight: 700, fontSize: '12px', letterSpacing: '0.06em', color: BRAND }}>{order.order_ref}</span></td>
        <td style={tdStyle}>{order.first_name} {order.last_name}</td>
        <td style={tdStyle}>{date}</td>
        <td style={tdStyle}><StatusBadge status={order.status} /></td>
        <td style={tdStyle}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
        <td style={tdStyle}><span style={{ fontWeight: 700 }}>${order.total.toFixed(2)}</span></td>
        <td style={tdStyle} onClick={e => e.stopPropagation()}>
          <select value={order.status} onChange={handleStatus} disabled={updating}
            style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', border: '1px solid #d6d0c8', padding: '5px 8px', background: '#fafaf8', cursor: 'pointer', opacity: updating ? 0.5 : 1 }}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </td>
      </tr>

      {open && (
        <tr style={{ background: '#fafaf8' }}>
          <td colSpan={7} style={{ padding: '16px 20px' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Billing details */}
              <div>
                <p style={sectionLabel}>Billing Details</p>
                <div style={{ fontSize: '12px', color: '#57534e', lineHeight: 1.8 }}>
                  <p>{order.first_name} {order.last_name}</p>
                  {order.company_name && <p>{order.company_name}</p>}
                  <p>{order.street_address}{order.apartment ? `, ${order.apartment}` : ''}</p>
                  <p>{order.city}{order.postcode ? ` ${order.postcode}` : ''}</p>
                  <p>{order.country}</p>
                  <p style={{ marginTop: '6px' }}>📞 {order.phone}</p>
                  {order.email && <p>✉ {order.email}</p>}
                  {order.order_notes && <p style={{ marginTop: '8px', fontStyle: 'italic', color: '#78716c' }}>Note: {order.order_notes}</p>}
                </div>
              </div>

              {/* Items */}
              <div>
                <p style={sectionLabel}>Items</p>
                <div style={{ fontSize: '12px', color: '#57534e' }}>
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 mb-2">
                      {item.product_image_url && (
                        <img src={item.product_image_url.startsWith('http') ? item.product_image_url : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${item.product_image_url}`}
                          alt={item.product_name} style={{ width: '40px', height: '40px', objectFit: 'cover', background: '#f2f2f2' }} />
                      )}
                      <div>
                        <p style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '11px' }}>{item.product_name}</p>
                        <p style={{ color: '#78716c' }}>Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                      </div>
                      <p style={{ marginLeft: 'auto', fontWeight: 700 }}>${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid #e8e3db', marginTop: '8px', paddingTop: '8px' }}>
                    <div className="flex justify-between" style={{ fontWeight: 700 }}>
                      <span style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px' }}>Total</span>
                      <span style={{ color: BRAND }}>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

const tdStyle = { padding: '14px 16px', fontSize: '12px', color: '#374151', verticalAlign: 'middle' };
const sectionLabel = { fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: '#1a1a1a', marginBottom: '8px' };

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    ordersApi.list()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id, status) => {
    const updated = await ordersApi.updateStatus(id, status);
    setOrders(prev => prev.map(o => o.id === id ? updated : o));
  };

  const filtered = orders.filter(o => {
    if (filterStatus && o.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const fullName = `${o.first_name} ${o.last_name}`.toLowerCase();
      if (!o.order_ref.toLowerCase().includes(q) && !fullName.includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '0.04em' }}>Orders</h1>
            <p style={{ fontSize: '12px', color: '#78716c', marginTop: '2px' }}>
              {filtered.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}
            </p>
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid #d6d0c8', padding: '7px 14px', background: '#fafaf8', cursor: 'pointer' }}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Search bar */}
        <div style={{ position: 'relative' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2.2" strokeLinecap="round"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search by order reference or customer name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              border: '1px solid #d6d0c8',
              background: '#fff',
              fontSize: '12px',
              color: '#1a1a1a',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = BRAND}
            onBlur={e => e.target.style.borderColor = '#d6d0c8'}
          />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a8a29e', fontSize: '16px', lineHeight: 1 }}>
              ×
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#78716c', fontSize: '13px' }}>Loading orders…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#78716c', fontSize: '13px' }}>
          {search ? `No orders matching "${search}".` : filterStatus ? `No ${filterStatus} orders.` : 'No orders yet.'}
        </div>
      ) : (
        <div style={{ border: '1px solid #e8e3db', background: '#fff', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e8e3db', background: '#fafaf8' }}>
                {['Order Ref', 'Customer', 'Date', 'Status', 'Items', 'Total', 'Update Status'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, color: '#57534e', textAlign: 'left' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <OrderRow key={order.id} order={order} onStatusChange={handleStatusChange} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
