import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { collectionsApi } from '../../services/api';
import Modal from '../../components/admin/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';

function CollectionForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({ name: initial?.name || '', slug: initial?.slug || '', is_new: initial?.is_new ?? false });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const col = initial
        ? await collectionsApi.update(initial.id, form)
        : await collectionsApi.create(form);
      onSave(col);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error saving collection');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-stone-600 mb-1.5">Name *</label>
        <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
          placeholder="e.g. Summer 2024" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-stone-600 mb-1.5">Slug (auto if empty)</label>
        <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
          className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300" />
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <div className={`w-10 h-6 rounded-full transition-colors relative ${form.is_new ? 'bg-rose-500' : 'bg-stone-200'}`}
          onClick={() => setForm(f => ({ ...f, is_new: !f.is_new }))}>
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_new ? 'left-5' : 'left-1'}`} />
        </div>
        <span className="text-sm font-medium text-stone-700">Mark as "New Collection"</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl disabled:opacity-60">
          {saving ? 'Saving…' : (initial ? 'Update' : 'Create')}
        </button>
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold rounded-xl">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { collectionsApi.list().then(setCollections).finally(() => setLoading(false)); }, []);

  const handleSave = (col) => {
    setCollections(prev => {
      const idx = prev.findIndex(c => c.id === col.id);
      return idx >= 0 ? prev.map(c => c.id === col.id ? col : c) : [...prev, col];
    });
    setModal(null);
    toast.success('Collection saved!');
  };

  const handleDelete = async () => {
    try {
      await collectionsApi.delete(deleteTarget.id);
      setCollections(prev => prev.filter(c => c.id !== deleteTarget.id));
      toast.success('Collection deleted');
    } catch { toast.error('Failed to delete'); }
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Collections</h1>
          <p className="text-stone-400 text-sm mt-0.5">{collections.length} total</p>
        </div>
        <button onClick={() => setModal('add')}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition-colors">
          <FiPlus size={16} /> Add Collection
        </button>
      </div>

      {loading ? <LoadingSpinner className="mt-20" size="lg" /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          {collections.length === 0 ? (
            <p className="text-center text-stone-400 py-12 text-sm">No collections yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-xs text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3">Name</th>
                  <th className="text-left px-5 py-3">Slug</th>
                  <th className="text-left px-5 py-3">New</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {collections.map(col => (
                  <motion.tr key={col.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-stone-50/50">
                    <td className="px-5 py-3 font-medium text-stone-800">{col.name}</td>
                    <td className="px-5 py-3 text-stone-400 font-mono text-xs">{col.slug}</td>
                    <td className="px-5 py-3">
                      {col.is_new && <span className="text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-semibold">NEW</span>}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setModal(col)} className="p-1.5 text-stone-400 hover:text-rose-500">
                          <FiEdit2 size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(col)} className="p-1.5 text-stone-400 hover:text-red-500">
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Collection' : 'Edit Collection'}>
        {modal && <CollectionForm initial={modal === 'add' ? null : modal} onSave={handleSave} onCancel={() => setModal(null)} />}
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Collection">
        <p className="text-sm text-stone-600 mb-5">Delete <strong>{deleteTarget?.name}</strong>?</p>
        <div className="flex gap-3">
          <button onClick={handleDelete} className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl">Delete</button>
          <button onClick={() => setDeleteTarget(null)} className="px-5 py-2.5 bg-stone-100 text-stone-700 text-sm font-semibold rounded-xl">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
