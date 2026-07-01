import { useState, useEffect } from 'react';
import { promoCodesApi } from '../../services/api';
import { FiPlus, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const BRAND = '#b8966a';

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #d6d0c8',
  background: '#fff',
  fontSize: '13px',
  color: '#1a1a1a',
  outline: 'none',
};

const labelStyle = {
  display: 'block',
  fontSize: '10px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  fontWeight: 600,
  color: '#57534e',
  marginBottom: '5px',
};

const emptyForm = {
  code: '',
  discount_percent: '',
  is_active: true,
  max_uses: '',
  expires_at: '',
};

export default function PromoCodesPage() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const data = await promoCodesApi.list();
      setCodes(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        code: form.code,
        discount_percent: parseFloat(form.discount_percent),
        is_active: form.is_active,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        expires_at: form.expires_at || null,
      };
      await promoCodesApi.create(payload);
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to create promo code.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (pc) => {
    try {
      await promoCodesApi.update(pc.id, { is_active: !pc.is_active });
      load();
    } catch {
      // silent
    }
  };

  const handleDelete = async (pc) => {
    if (!confirm(`Delete promo code "${pc.code}"? This cannot be undone.`)) return;
    try {
      await promoCodesApi.delete(pc.id);
      load();
    } catch {
      // silent
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p style={{ color: BRAND, fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: '4px' }}>
            Admin
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600, color: '#1a1a1a' }}>
            Promo Codes
          </h1>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setError(''); setForm(emptyForm); }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: BRAND, color: '#fff', border: 'none', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}
        >
          <FiPlus size={14} />
          New Code
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} style={{ border: '1px solid #e8e3db', padding: '20px', marginBottom: '24px', background: '#fafaf8' }}>
          <h2 style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: '#1a1a1a', marginBottom: '16px' }}>
            Create Promo Code
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label style={labelStyle}>Code *</label>
              <input
                required
                placeholder="e.g. SUMMER20"
                value={form.code}
                onChange={e => set('code', e.target.value.toUpperCase())}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Discount % *</label>
              <input
                required
                type="number"
                min="0.1"
                max="100"
                step="0.1"
                placeholder="e.g. 15"
                value={form.discount_percent}
                onChange={e => set('discount_percent', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Max Uses (leave blank = unlimited)</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 100"
                value={form.max_uses}
                onChange={e => set('max_uses', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Expires At (leave blank = never)</label>
              <input
                type="datetime-local"
                value={form.expires_at}
                onChange={e => set('expires_at', e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <label style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Active</label>
            <button
              type="button"
              onClick={() => set('is_active', !form.is_active)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: form.is_active ? '#22c55e' : '#d6d0c8', padding: 0 }}
            >
              {form.is_active ? <FiToggleRight size={28} /> : <FiToggleLeft size={28} />}
            </button>
            <span style={{ fontSize: '12px', color: form.is_active ? '#22c55e' : '#78716c' }}>
              {form.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          {error && (
            <p style={{ fontSize: '12px', color: '#dc2626', marginBottom: '12px' }}>{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              style={{ padding: '9px 22px', background: saving ? '#c4a882' : BRAND, color: '#fff', border: 'none', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving ? 'Saving…' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(''); }}
              style={{ padding: '9px 22px', background: 'transparent', color: '#78716c', border: '1px solid #d6d0c8', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      {loading ? (
        <p style={{ fontSize: '13px', color: '#78716c' }}>Loading…</p>
      ) : codes.length === 0 ? (
        <div style={{ border: '1px solid #e8e3db', padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#78716c' }}>No promo codes yet. Create one above.</p>
        </div>
      ) : (
        <div style={{ border: '1px solid #e8e3db', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#fafaf8', borderBottom: '1px solid #e8e3db' }}>
                {['Code', 'Discount', 'Uses', 'Expires', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, color: '#57534e' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {codes.map((pc, i) => (
                <tr key={pc.id} style={{ borderBottom: i < codes.length - 1 ? '1px solid #f0ece6' : 'none' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, letterSpacing: '0.06em', color: '#1a1a1a' }}>
                    {pc.code}
                  </td>
                  <td style={{ padding: '12px 14px', color: BRAND, fontWeight: 600 }}>
                    {pc.discount_percent}%
                  </td>
                  <td style={{ padding: '12px 14px', color: '#57534e' }}>
                    {pc.uses_count}{pc.max_uses != null ? ` / ${pc.max_uses}` : ''}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#78716c' }}>
                    {pc.expires_at
                      ? new Date(pc.expires_at).toLocaleDateString()
                      : <span style={{ color: '#d6d0c8' }}>Never</span>
                    }
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <button
                      onClick={() => handleToggle(pc)}
                      title={pc.is_active ? 'Deactivate' : 'Activate'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: pc.is_active ? '#22c55e' : '#d6d0c8', padding: 0, display: 'flex', alignItems: 'center' }}
                    >
                      {pc.is_active ? <FiToggleRight size={22} /> : <FiToggleLeft size={22} />}
                    </button>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <button
                      onClick={() => handleDelete(pc)}
                      title="Delete"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d6d0c8', padding: 0, display: 'flex', alignItems: 'center' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                      onMouseLeave={e => e.currentTarget.style.color = '#d6d0c8'}
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
