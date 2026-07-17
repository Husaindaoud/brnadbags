import { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '../../services/api';

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent = 'stone', live = false }) {
  const accents = {
    green:  'border-l-emerald-400 bg-emerald-50/40',
    blue:   'border-l-sky-400    bg-sky-50/40',
    purple: 'border-l-violet-400 bg-violet-50/40',
    orange: 'border-l-amber-400  bg-amber-50/40',
    stone:  'border-l-stone-300  bg-white',
  };
  const textAccents = {
    green:  'text-emerald-600',
    blue:   'text-sky-600',
    purple: 'text-violet-600',
    orange: 'text-amber-600',
    stone:  'text-stone-900',
  };
  return (
    <div className={`rounded-2xl border border-stone-100 border-l-4 p-5 flex flex-col gap-2 ${accents[accent]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{label}</span>
        {live && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            live
          </span>
        )}
      </div>
      <span className={`text-4xl font-bold leading-none ${textAccents[accent]}`}>{value ?? '—'}</span>
      {sub && <span className="text-xs text-stone-400">{sub}</span>}
    </div>
  );
}

// ── Bar chart ─────────────────────────────────────────────────────────────────
function BarChart({ data }) {
  const [hovered, setHovered] = useState(null);

  if (!data || data.length === 0) return (
    <div className="flex flex-col items-center justify-center h-48 gap-2 text-stone-300">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/>
      </svg>
      <span className="text-sm">No pageview data yet</span>
    </div>
  );

  const max = Math.max(...data.map(d => d.y ?? 0), 1);
  const total = data.reduce((a, d) => a + (d.y ?? 0), 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs text-stone-400">
        <span>{data.length} days</span>
        <span>{total.toLocaleString()} total views</span>
      </div>
      <div className="relative flex items-end gap-[3px] h-48 w-full px-1">
        {data.map((d, i) => {
          const height = Math.max(((d.y ?? 0) / max) * 100, (d.y ?? 0) > 0 ? 3 : 0);
          const date = new Date(d.x);
          const label = `${date.getMonth() + 1}/${date.getDate()}`;
          const isHov = hovered === i;
          return (
            <div
              key={i}
              className="flex flex-col items-center flex-1 gap-1 cursor-default group relative"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {isHov && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap z-10 pointer-events-none">
                  {label}: {(d.y ?? 0).toLocaleString()}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900" />
                </div>
              )}
              <div
                className={`w-full rounded-t-sm transition-all duration-150 ${isHov ? 'bg-rose-400' : 'bg-stone-700'}`}
                style={{ height: `${height}%`, minHeight: (d.y ?? 0) > 0 ? 4 : 0 }}
              />
              {(i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1) && (
                <span className="text-[9px] text-stone-300 whitespace-nowrap">{label}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Metric list ────────────────────────────────────────────────────────────────
function MetricList({ rows, labelKey = 'x', valueKey = 'y', emptyText = 'No data yet' }) {
  if (!rows || rows.length === 0) return (
    <div className="flex flex-col items-center justify-center py-8 text-stone-300 gap-1">
      <span className="text-sm">{emptyText}</span>
    </div>
  );
  const max = Math.max(...rows.map(r => r[valueKey] ?? 0), 1);
  return (
    <div className="flex flex-col divide-y divide-stone-50">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5">
          <span className="text-xs font-bold text-stone-300 w-4 shrink-0">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-stone-700 truncate font-medium">{r[labelKey] || '(direct)'}</div>
            <div className="h-1 rounded-full bg-stone-100 mt-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-stone-700 transition-all"
                style={{ width: `${((r[valueKey] ?? 0) / max) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-bold text-stone-600 shrink-0 tabular-nums">
            {(r[valueKey] ?? 0).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`animate-pulse bg-stone-100 rounded-2xl ${className}`} />;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [summary, setSummary]     = useState(null);
  const [pageviews, setPageviews] = useState(null);
  const [pages, setPages]         = useState(null);
  const [referrers, setReferrers] = useState(null);
  const [devices, setDevices]     = useState(null);
  const [error, setError]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      analyticsApi.summary(),
      analyticsApi.pageviews(),
      analyticsApi.pages(),
      analyticsApi.referrers(),
      analyticsApi.devices(),
    ])
      .then(([s, pv, pg, ref, dev]) => {
        setSummary(s);
        setPageviews(pv?.pageviews ?? []);
        setPages(pg);
        setReferrers(ref);
        setDevices(dev);
        setLastUpdated(new Date());
      })
      .catch(err => setError(err?.response?.data?.detail ?? 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Analytics</h1>
          <p className="text-stone-400 text-sm mt-0.5">
            Visitor insights · powered by Umami
            {lastUpdated && (
              <span className="ml-2 text-stone-300">
                · updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-stone-200 hover:bg-stone-50 disabled:opacity-40 text-stone-600 text-sm font-medium rounded-xl transition-colors"
        >
          <span className={loading ? 'animate-spin inline-block' : ''}>↻</span>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3.5">
          <span className="text-red-400 mt-0.5">⚠</span>
          <div>
            <p className="font-semibold">Could not load analytics</p>
            <p className="text-red-500 text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !summary && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
          <Skeleton className="h-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-52" />)}
          </div>
        </div>
      )}

      {summary && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <StatCard
              label="Active now"
              value={summary.active}
              sub="visitors right now"
              accent="green"
              live
            />
            <StatCard
              label="Today"
              value={summary.today?.visitors}
              sub={`${(summary.today?.pageviews ?? 0).toLocaleString()} pageviews`}
              accent="blue"
            />
            <StatCard
              label="Last 7 days"
              value={summary.week?.visitors?.toLocaleString()}
              sub={`${(summary.week?.pageviews ?? 0).toLocaleString()} pageviews`}
              accent="purple"
            />
            <StatCard
              label="Last 30 days"
              value={summary.month?.visitors?.toLocaleString()}
              sub={`${(summary.month?.pageviews ?? 0).toLocaleString()} pageviews`}
              accent="orange"
            />
          </div>

          {/* Pageviews chart */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide">Pageviews</h2>
              <span className="text-xs text-stone-400 bg-stone-50 px-2 py-1 rounded-lg">Last 30 days</span>
            </div>
            <BarChart data={pageviews} />
          </div>

          {/* Bottom grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide">Top Pages</h2>
                <span className="text-xs text-stone-300">{pages?.length ?? 0} pages</span>
              </div>
              <MetricList rows={pages} emptyText="No page data yet" />
            </div>

            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide">Referrers</h2>
                <span className="text-xs text-stone-300">{referrers?.length ?? 0} sources</span>
              </div>
              <MetricList rows={referrers} emptyText="No referrer data yet" />
            </div>

            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide">Devices</h2>
                <span className="text-xs text-stone-300">{devices?.length ?? 0} types</span>
              </div>
              <MetricList rows={devices} emptyText="No device data yet" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
