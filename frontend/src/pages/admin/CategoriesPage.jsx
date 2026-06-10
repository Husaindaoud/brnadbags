import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { categoriesApi } from '../../services/api';
import { getImageUrl } from '../../services/api';
import Modal from '../../components/admin/Modal';
import ImageUploadField from '../../components/admin/ImageUploadField';
import LoadingSpinner from '../../components/LoadingSpinner';

function CategoryForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({ name: initial?.name || '', slug: initial?.slug || '' });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let cat;
      if (initial) {
        cat = await categoriesApi.update(initial.id, form);
        if (imageFile) cat = await categoriesApi.uploadImage(initial.id, imageFile);
      } else {
        cat = await categoriesApi.create(form);
        if (imageFile) cat = await categoriesApi.uploadImage(cat.id, imageFile);
      }
      onSave(cat);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error saving category');
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
          placeholder="e.g. Shoes" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-stone-600 mb-1.5">Slug (auto-generated if empty)</label>
        <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
          className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
          placeholder="e.g. shoes" />
      </div>
      <ImageUploadField label="Category Image" currentUrl={initial?.image_url}
        onFileSelect={setImageFile} onRemove={() => setImageFile(null)} />
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
          {saving ? 'Saving…' : (initial ? 'Update' : 'Create')}
        </button>
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold rounded-xl transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | category (for edit)
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => categoriesApi.list().then(setCategories).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSave = (cat) => {
    setCategories(prev => {
      const idx = prev.findIndex(c => c.id === cat.id);
      return idx >= 0 ? prev.map(c => c.id === cat.id ? cat : c) : [...prev, cat];
    });
    setModal(null);
    toast.success('Category saved!');
  };

  const handleDelete = async () => {
    try {
      await categoriesApi.delete(deleteTarget.id);
      setCategories(prev => prev.filter(c => c.id !== deleteTarget.id));
      toast.success('Category deleted');
    } catch { toast.error('Failed to delete'); }
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Categories</h1>
          <p className="text-stone-400 text-sm mt-0.5">{categories.length} total</p>
        </div>
        <button onClick={() => setModal('add')}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition-colors">
          <FiPlus size={16} /> Add Category
        </button>
      </div>

      {loading ? <LoadingSpinner className="mt-20" size="lg" /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          {categories.length === 0 ? (
            <p className="text-center text-stone-400 py-12 text-sm">No categories yet. Add your first one.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-xs text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3">Image</th>
                  <th className="text-left px-5 py-3">Name</th>
                  <th className="text-left px-5 py-3">Slug</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {categories.map(cat => (
                  <motion.tr key={cat.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100">
                        {cat.image_url && <img src={getImageUrl(cat.image_url)} alt={cat.name} className="w-full h-full object-cover" />}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-medium text-stone-800">{cat.name}</td>
                    <td className="px-5 py-3 text-stone-400 font-mono text-xs">{cat.slug}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setModal(cat)} className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors">
                          <FiEdit2 size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(cat)} className="p-1.5 text-stone-400 hover:text-red-500 transition-colors">
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

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Category' : 'Edit Category'}>
        {modal && (
          <CategoryForm
            initial={modal === 'add' ? null : modal}
            onSave={handleSave}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Category">
        <p className="text-sm text-stone-600 mb-5">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? Products in this category will become uncategorised.
        </p>
        <div className="flex gap-3">
          <button onClick={handleDelete} className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl">
            Delete
          </button>
          <button onClick={() => setDeleteTarget(null)} className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold rounded-xl">
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}
