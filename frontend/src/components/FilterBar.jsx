import { useState } from 'react';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';

const BRAND = '#b8966a';

export default function FilterBar({ filters, onChange, brands = [], showNewFilter = true }) {
  const [expanded, setExpanded] = useState(false);

  const setField = (key, val) => onChange({ ...filters, [key]: val });

  const activeCount = [
    filters.brand_id,
    filters.on_sale,
    filters.new,
    filters.min_price,
    filters.max_price,
  ].filter(Boolean).length;

  const clearAll = () => onChange({ sort: filters.sort });

  const btnBase = {
    fontSize: '10px',
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    fontWeight: 500,
    padding: '7px 14px',
    border: '1px solid #d6d0c8',
    background: '#fafaf8',
    color: '#57534e',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  };

  const btnActive = {
    ...btnBase,
    background: BRAND,
    borderColor: BRAND,
    color: '#fff',
  };

  return (
    <div className="mb-8" style={{ borderBottom: '1px solid #ece8e1', paddingBottom: '20px' }}>
      {/* Top row */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Sort */}
        <div className="relative">
          <select
            value={filters.sort || ''}
            onChange={e => setField('sort', e.target.value || undefined)}
            className="appearance-none outline-none cursor-pointer bg-[#fafaf8] text-stone-700"
            style={{
              fontSize: '10px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              fontWeight: 500,
              padding: '7px 28px 7px 12px',
              border: '1px solid #d6d0c8',
            }}
          >
            <option value="">Newest</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
          <FiChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 transition-colors"
          style={expanded || activeCount > 0 ? btnActive : btnBase}
        >
          <FiFilter size={12} />
          Filters
          {activeCount > 0 && (
            <span
              className="flex items-center justify-center w-4 h-4 text-[9px] font-bold rounded-full"
              style={{ background: expanded ? '#fff' : BRAND, color: expanded ? BRAND : '#fff' }}
            >
              {activeCount}
            </span>
          )}
        </button>

        {/* Sale toggle */}
        <button
          onClick={() => setField('on_sale', filters.on_sale ? undefined : true)}
          style={filters.on_sale ? btnActive : btnBase}
        >
          Sale
        </button>

        {showNewFilter && (
          <button
            onClick={() => setField('new', filters.new ? undefined : true)}
            style={filters.new ? { ...btnActive, background: '#1a1a1a', borderColor: '#1a1a1a' } : btnBase}
          >
            New In
          </button>
        )}

        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="ml-auto flex items-center gap-1 text-stone-400 hover:text-stone-700 transition-colors"
            style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            <FiX size={12} /> Clear
          </button>
        )}
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="mt-5 pt-5 grid grid-cols-1 sm:grid-cols-3 gap-5" style={{ borderTop: '1px solid #ece8e1' }}>

          {brands.length > 0 && (
            <div>
              <label
                className="block text-stone-500 mb-2"
                style={{ fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}
              >
                Brand
              </label>
              <div className="relative">
                <select
                  value={filters.brand_id || ''}
                  onChange={e => setField('brand_id', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full appearance-none outline-none bg-white text-stone-700 cursor-pointer"
                  style={{ fontSize: '12px', padding: '8px 28px 8px 10px', border: '1px solid #d6d0c8' }}
                >
                  <option value="">All Brands</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <FiChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              </div>
            </div>
          )}

          <div>
            <label
              className="block text-stone-500 mb-2"
              style={{ fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}
            >
              Min Price
            </label>
            <input
              type="number" min="0" placeholder="$0"
              value={filters.min_price || ''}
              onChange={e => setField('min_price', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full outline-none bg-white text-stone-700"
              style={{ fontSize: '12px', padding: '8px 10px', border: '1px solid #d6d0c8' }}
            />
          </div>

          <div>
            <label
              className="block text-stone-500 mb-2"
              style={{ fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}
            >
              Max Price
            </label>
            <input
              type="number" min="0" placeholder="No limit"
              value={filters.max_price || ''}
              onChange={e => setField('max_price', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full outline-none bg-white text-stone-700"
              style={{ fontSize: '12px', padding: '8px 10px', border: '1px solid #d6d0c8' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
