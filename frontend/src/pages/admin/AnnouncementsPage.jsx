import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { announcementsApi } from '../../services/api';
import Modal from '../../components/admin/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';

const COLOR_SWATCHES = [
  { label: 'Olive',      value: '#6B7C45' },
  { label: 'Gold',       value: '#b8966a' },
  { label: 'Black',      value: '#1a1a1a' },
  { label: 'Blush',      value: '#c9748a' },
  { label: 'Terracotta', value: '#b55d3e' },
  { label: 'Navy',       value: '#2c3e6b' },
  { label: 'Forest',     value: '#2e5a3e' },
  { label: 'Mauve',      value: '#7a5c6e' },
];

function AnnouncementForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ title: '', message: '', type: 'discount', bg_color: '#6B7C45', is_active: true });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const ann = await announcementsApi.create(form);
      onSave(ann);
    } catch { toast.error('Error creating announcement'); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-stone-600 mb-1.5">Title *</label>
        <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
          placeholder="e.g. 20% OFF Shoes!" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-stone-600 mb-1.5">Message *</label>
        <textarea required rows={3} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
          placeholder="Detailed message for the banner..." />
      </div>
      <div>
        <label className="block text-xs font-semibold text-stone-600 mb-1.5">Type</label>
        <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
          className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300">
          <option value="discount">Discount</option>
          <option value="new_collection">New Collection</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-stone-600 mb-1.5">Banner Color</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {COLOR_SWATCHES.map(s => (
            <button key={s.value} type="button" title={s.label}
              onClick={() => setForm(f => ({ ...f, bg_color: s.value }))}
              className="w-7 h-7 rounded-full border-2 transition-all"
              style={{ background: s.value, borderColor: form.bg_color === s.value ? '#1a1a1a' : 'transparent', outline: form.bg_color === s.value ? '2px solid #1a1a1a' : 'none', outlineOffset: '2px' }}
            />
          ))}
          <input type="color" value={form.bg_color}
            onChange={e => setForm(f => ({ ...f, bg_color: e.target.value }))}
            className="w-7 h-7 rounded-full cursor-pointer border border-stone-200"
            title="Custom color" />
        </div>
        <div className="h-7 rounded-lg flex items-center justify-center text-white text-xs font-medium tracking-widest uppercase"
          style={{ background: form.bg_color }}>
          Preview
        </div>
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <div className={`w-10 h-6 rounded-full transition-colors relative ${form.is_active ? 'bg-rose-500' : 'bg-stone-200'}`}
          onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}>
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? 'left-5' : 'left-1'}`} />
        </div>
        <span className="text-sm font-medium text-stone-700">Active (show on site)</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl disabled:opacity-60">
          {saving ? 'Creating…' : 'Create'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 bg-stone-100 text-stone-700 text-sm font-semibold rounded-xl">Cancel</button>
      </div>
    </form>
  );
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { announcementsApi.list().then(setAnnouncements).finally(() => setLoading(false)); }, []);

  const handleToggle = async (ann) => {
    const updated = await announcementsApi.toggle(ann.id);
    setAnnouncements(prev => prev.map(a => a.id === ann.id ? updated : a));
    toast.success(updated.is_active ? 'Banner activated' : 'Banner deactivated');
  };

  const handleDelete = async () => {
    await announcementsApi.delete(deleteTarget.id);
    setAnnouncements(prev => prev.filter(a => a.id !== deleteTarget.id));
    toast.success('Announcement deleted');
    setDeleteTarget(null);
  };

  const typeLabel = { discount: 'Discount', new_collection: 'New Collection' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Announcements</h1>
          <p className="text-stone-400 text-sm mt-0.5">Site-wide banners for promotions and new arrivals</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition-colors">
          <FiPlus size={16} /> New Announcement
        </button>
      </div>

      {loading ? <LoadingSpinner className="mt-20" size="lg" /> : (
        <div className="space-y-3">
          {announcements.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center text-stone-400 text-sm border border-stone-100">
              No announcements yet.
            </div>
          )}
          {announcements.map(ann => (
            <motion.div key={ann.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="w-3.5 h-3.5 rounded-full shrink-0 border border-stone-200" style={{ background: ann.bg_color || '#6B7C45' }} />
                  <span className="font-semibold text-stone-800 text-sm">{ann.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ann.type === 'discount' ? 'bg-rose-50 text-rose-600' : 'bg-stone-100 text-stone-600'}`}>
                    {typeLabel[ann.type] || ann.type}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ann.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-50 text-stone-500'}`}>
                    {ann.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-stone-500">{ann.message}</p>
                <p className="text-xs text-stone-300 mt-1">{new Date(ann.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleToggle(ann)}
                  className={`p-2 rounded-lg transition-colors ${ann.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-stone-400 hover:bg-stone-50'}`}
                  title={ann.is_active ? 'Deactivate' : 'Activate'}>
                  {ann.is_active ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                </button>
                <button onClick={() => setDeleteTarget(ann)} className="p-2 text-stone-300 hover:text-red-500 transition-colors">
                  <FiTrash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Create Announcement">
        <AnnouncementForm
          onSave={(ann) => { setAnnouncements(prev => [ann, ...prev]); setShowAdd(false); toast.success('Announcement created!'); }}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Announcement">
        <p className="text-sm text-stone-600 mb-5">Delete <strong>{deleteTarget?.title}</strong>?</p>
        <div className="flex gap-3">
          <button onClick={handleDelete} className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl">Delete</button>
          <button onClick={() => setDeleteTarget(null)} className="px-5 py-2.5 bg-stone-100 text-stone-700 text-sm font-semibold rounded-xl">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
