import { useState } from 'react';
import { reportsApi } from '../../services/api';

// ── CSV export helper ─────────────────────────────────────────────────────────
function exportCSV(rows, filename) {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => {
        const v = row[h] ?? '';
        const s = String(v);
        return s.includes(',') || s.includes('"') || s.includes('\n')
          ? `"${s.replace(/"/g, '""')}"`
          : s;
      }).join(',')
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Date helpers ──────────────────────────────────────────────────────────────
function today() { return new Date().toISOString().slice(0, 10); }
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const PRESETS = [
  { label: 'Today',       start: today(),      end: today() },
  { label: 'Last 7 days', start: daysAgo(6),   end: today() },
  { label: 'Last 30 days',start: daysAgo(29),  end: today() },
  { label: 'This month',  start: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`; })(), end: today() },
  { label: 'Last month',  start: (() => { const d = new Date(); d.setMonth(d.getMonth()-1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`; })(), end: (() => { const d = new Date(); d.setDate(0); return d.toISOString().slice(0,10); })() },
];

const REPORT_TYPES = [
  { id: 'orders',   label: 'Orders Export',      desc: 'Full list of orders with customer info and items' },
  { id: 'revenue',  label: 'Revenue by Day',     desc: 'Daily breakdown of gross revenue, discounts and net' },
  { id: 'products', label: 'Top Products',       desc: 'Best-selling products by units sold' },
  { id: 'status',   label: 'Orders by Status',   desc: 'Count and value of orders grouped by status' },
];

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped:   'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

// ── Table renderers ───────────────────────────────────────────────────────────
function OrdersTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-100 text-left text-xs text-stone-400 uppercase tracking-wide">
            {['Ref','Date','Customer','Phone','City','Status','Items','Subtotal','Discount','Total'].map(h => (
              <th key={h} className="pb-2 pr-4 font-medium whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-stone-50 hover:bg-stone-50">
              <td className="py-2 pr-4 font-mono text-xs text-stone-500">{r.order_ref}</td>
              <td className="py-2 pr-4 whitespace-nowrap text-stone-600">{r.date}</td>
              <td className="py-2 pr-4 whitespace-nowrap font-medium">{r.customer}</td>
              <td className="py-2 pr-4 text-stone-500">{r.phone}</td>
              <td className="py-2 pr-4 text-stone-500">{r.city}</td>
              <td className="py-2 pr-4">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] ?? 'bg-stone-100 text-stone-600'}`}>
                  {r.status}
                </span>
              </td>
              <td className="py-2 pr-4 text-stone-600 max-w-[200px] truncate" title={r.items}>{r.items}</td>
              <td className="py-2 pr-4 text-right">${r.subtotal}</td>
              <td className="py-2 pr-4 text-right text-green-600">{r.discount > 0 ? `-$${r.discount}` : '—'}</td>
              <td className="py-2 font-semibold text-right">${r.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RevenueTable({ rows, totals }) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 text-left text-xs text-stone-400 uppercase tracking-wide">
              {['Date','Orders','Gross Revenue','Discounts','Net Revenue'].map(h => (
                <th key={h} className="pb-2 pr-6 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-stone-50 hover:bg-stone-50">
                <td className="py-2 pr-6 font-medium">{r.date}</td>
                <td className="py-2 pr-6 text-stone-600">{r.orders}</td>
                <td className="py-2 pr-6">${r.gross.toFixed(2)}</td>
                <td className="py-2 pr-6 text-green-600">{r.discounts > 0 ? `-$${r.discounts.toFixed(2)}` : '—'}</td>
                <td className="py-2 font-semibold">${r.net.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          {totals && (
            <tfoot>
              <tr className="border-t-2 border-stone-200 bg-stone-50 font-bold">
                <td className="py-3 pr-6">TOTAL</td>
                <td className="py-3 pr-6">{totals.orders}</td>
                <td className="py-3 pr-6">${totals.gross.toFixed(2)}</td>
                <td className="py-3 pr-6 text-green-600">{totals.discounts > 0 ? `-$${totals.discounts.toFixed(2)}` : '—'}</td>
                <td className="py-3">${totals.net.toFixed(2)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {totals && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Total Orders',   value: totals.orders },
            { label: 'Gross Revenue',  value: `$${totals.gross.toFixed(2)}` },
            { label: 'Total Discounts',value: `-$${totals.discounts.toFixed(2)}` },
            { label: 'Net Revenue',    value: `$${totals.net.toFixed(2)}` },
          ].map(s => (
            <div key={s.label} className="bg-stone-50 rounded-xl p-4">
              <div className="text-xs text-stone-400 uppercase tracking-wide">{s.label}</div>
              <div className="text-2xl font-bold text-stone-900 mt-1">{s.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductsTable({ rows }) {
  const maxUnits = Math.max(...rows.map(r => r.units_sold), 1);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-100 text-left text-xs text-stone-400 uppercase tracking-wide">
            <th className="pb-2 pr-4 font-medium">#</th>
            <th className="pb-2 pr-4 font-medium">Product</th>
            <th className="pb-2 pr-4 font-medium">Units Sold</th>
            <th className="pb-2 font-medium text-right">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-stone-50 hover:bg-stone-50">
              <td className="py-2 pr-4 text-stone-400 font-mono">{i + 1}</td>
              <td className="py-2 pr-4 font-medium">{r.product}</td>
              <td className="py-2 pr-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-stone-800 rounded-full" style={{ width: `${(r.units_sold / maxUnits) * 100}%` }} />
                  </div>
                  <span className="text-stone-700 font-semibold w-8 text-right">{r.units_sold}</span>
                </div>
              </td>
              <td className="py-2 font-semibold text-right">${r.revenue.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusTable({ rows, grand_total }) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 text-left text-xs text-stone-400 uppercase tracking-wide">
              {['Status','Orders','Total Value','% of Orders'].map(h => (
                <th key={h} className="pb-2 pr-6 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const totalOrders = rows.reduce((a, x) => a + x.count, 0);
              const pct = totalOrders > 0 ? ((r.count / totalOrders) * 100).toFixed(1) : 0;
              return (
                <tr key={i} className="border-b border-stone-50 hover:bg-stone-50">
                  <td className="py-3 pr-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[r.status] ?? 'bg-stone-100 text-stone-600'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 pr-6 font-semibold">{r.count}</td>
                  <td className="py-3 pr-6">${r.total.toFixed(2)}</td>
                  <td className="py-3 pr-6">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-stone-800 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-stone-500">{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {grand_total !== undefined && (
        <div className="mt-4 text-right text-sm text-stone-500">
          Grand total: <span className="font-bold text-stone-900">${grand_total.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [reportType, setReportType] = useState('orders');
  const [startDate, setStartDate]   = useState(daysAgo(29));
  const [endDate, setEndDate]       = useState(today());
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  const currentType = REPORT_TYPES.find(r => r.id === reportType);

  function applyPreset(p) {
    setStartDate(p.start);
    setEndDate(p.end);
    setData(null);
  }

  function generate() {
    setLoading(true);
    setError(null);
    setData(null);
    reportsApi[reportType](startDate, endDate)
      .then(setData)
      .catch(err => setError(err?.response?.data?.detail ?? 'Failed to generate report'))
      .finally(() => setLoading(false));
  }

  function handleExport() {
    if (!data) return;
    const rows = data.rows ?? [];
    exportCSV(rows, `${reportType}-report-${startDate}-to-${endDate}.csv`);
  }

  const hasRows = data?.rows?.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Reports</h1>
        <p className="text-stone-400 text-sm mt-0.5">Export and analyse your store data</p>
      </div>

      {/* Config card */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5 flex flex-col gap-5">
        {/* Report type */}
        <div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Report type</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {REPORT_TYPES.map(rt => (
              <button
                key={rt.id}
                onClick={() => { setReportType(rt.id); setData(null); }}
                className={`flex flex-col items-start gap-0.5 p-3 rounded-xl border text-left transition-colors ${
                  reportType === rt.id
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-200 hover:border-stone-400 text-stone-700'
                }`}
              >
                <span className="text-sm font-semibold">{rt.label}</span>
                <span className={`text-xs leading-tight ${reportType === rt.id ? 'text-stone-300' : 'text-stone-400'}`}>{rt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date range */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Date range</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  startDate === p.start && endDate === p.end
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-200 hover:border-stone-400 text-stone-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-stone-500 w-10">From</label>
              <input
                type="date"
                value={startDate}
                max={endDate}
                onChange={e => { setStartDate(e.target.value); setData(null); }}
                className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-stone-500 w-10">To</label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                max={today()}
                onChange={e => { setEndDate(e.target.value); setData(null); }}
                className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={generate}
            disabled={loading}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {loading ? 'Generating…' : 'Generate Report'}
          </button>
          {hasRows && (
            <button
              onClick={handleExport}
              className="px-5 py-2.5 border border-stone-300 hover:border-stone-500 text-stone-700 text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
            >
              ↓ Export CSV
            </button>
          )}
          {hasRows && (
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 border border-stone-300 hover:border-stone-500 text-stone-700 text-sm font-semibold rounded-xl transition-colors"
            >
              Print / PDF
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      {/* Results */}
      {data && (
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-stone-900">{currentType?.label}</h2>
              <p className="text-xs text-stone-400">{startDate} → {endDate} · {data.rows?.length ?? 0} rows</p>
            </div>
          </div>

          {!hasRows ? (
            <p className="text-stone-400 text-sm text-center py-8">No data for this period.</p>
          ) : reportType === 'orders' ? (
            <OrdersTable rows={data.rows} />
          ) : reportType === 'revenue' ? (
            <RevenueTable rows={data.rows} totals={data.totals} />
          ) : reportType === 'products' ? (
            <ProductsTable rows={data.rows} />
          ) : (
            <StatusTable rows={data.rows} grand_total={data.grand_total} />
          )}
        </div>
      )}
    </div>
  );
}
