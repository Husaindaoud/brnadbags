import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { categoriesApi } from '../../services/api';
import { getImageUrl } from '../../services/api';
import Modal from '../../components/admin/Modal';
import ImageUploadField from '../../components/admin/ImageUploadField';
import LoadingSpinner from '../../components/LoadingSpinner';

function CategoryForm({ initial, parentId, onSave, onCancel }) {
  const [form, setForm] = useState({ name: initial?.name || '', slug: initial?.slug || '' });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (parentId != null) payload.parent_id = parentId;
      let cat;
      if (initial) {
        cat = await categoriesApi.update(initial.id, payload);
        if (imageFile) cat = await categoriesApi.uploadImage(initial.id, imageFile);
      } else {
        cat = await categoriesApi.create(payload);
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
      {parentId != null && (
        <p className="text-xs bg-stone-50 text-stone-500 rounded-lg px-3 py-2 border border-stone-100">
          This will be saved as a subcategory.
        </p>
      )}
      <div>
        <label className="block text-xs font-semibold text-stone-600 mb-1.5">Name *</label>
        <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
          placeholder={parentId != null ? 'e.g. Men' : 'e.g. Shoes'} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-stone-600 mb-1.5">Slug (auto-generated if empty)</label>
        <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
          className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
          placeholder={parentId != null ? 'e.g. men' : 'e.g. shoes'} />
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
  // modal: null | 'add' | { type: 'edit', cat } | { type: 'add-sub', parent }
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expanded, setExpanded] = useState({});

  const load = () => categoriesApi.list().then(setCategories).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  // Top-level categories (no parent)
  const topLevel = categories.filter(c => c.parent_id == null);

  // Get subcategories for a given parent from the flat list
  const getSubcats = (parentId) => categories.filter(c => c.parent_id === parentId);

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const handleSave = () => {
    load();
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

  const getModalTitle = () => {
    if (!modal) return '';
    if (modal === 'add') return 'Add Category';
    if (modal.type === 'add-sub') return `Add Subcategory under "${modal.parent.name}"`;
    if (modal.type === 'edit') return `Edit "${modal.cat.name}"`;
    return '';
  };

  const getFormProps = () => {
    if (!modal || modal === 'add') return { initial: null, parentId: null };
    if (modal.type === 'add-sub') return { initial: null, parentId: modal.parent.id };
    if (modal.type === 'edit') return { initial: modal.cat, parentId: modal.cat.parent_id ?? null };
    return {};
  };

  const CatRow = ({ cat, isSubcat }) => {
    const subcats = isSubcat ? [] : getSubcats(cat.id);
    const isOpen = expanded[cat.id];

    return (
      <>
        <motion.tr key={cat.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className={`hover:bg-stone-50/50 transition-colors ${isSubcat ? 'bg-stone-50/30' : ''}`}>
          <td className="px-5 py-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100">
              {cat.image_url && <img src={getImageUrl(cat.image_url)} alt={cat.name} className="w-full h-full object-cover" />}
            </div>
          </td>
          <td className="px-5 py-3 font-medium text-stone-800">
            <div className="flex items-center gap-2">
              {isSubcat && <span className="w-4 h-px bg-stone-300 inline-block ml-2 flex-shrink-0" />}
              {!isSubcat && subcats.length > 0 && (
                <button onClick={() => toggleExpand(cat.id)}
                  className="p-0.5 text-stone-400 hover:text-stone-600 transition-colors">
                  {isOpen ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                </button>
              )}
              {isSubcat && <span className="text-stone-500">{cat.name}</span>}
              {!isSubcat && <span>{cat.name}</span>}
              {!isSubcat && subcats.length > 0 && (
                <span className="text-xs text-stone-400 font-normal">{subcats.length} sub</span>
              )}
            </div>
          </td>
          <td className="px-5 py-3 text-stone-400 font-mono text-xs">{cat.slug}</td>
          <td className="px-5 py-3 text-right">
            <div className="flex items-center justify-end gap-2">
              {!isSubcat && (
                <button
                  onClick={() => setModal({ type: 'add-sub', parent: cat })}
                  className="px-2 py-1 text-xs text-stone-500 hover:text-rose-500 border border-stone-200 hover:border-rose-300 rounded-lg transition-colors"
                  title="Add subcategory">
                  + Sub
                </button>
              )}
              <button onClick={() => setModal({ type: 'edit', cat })} className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors">
                <FiEdit2 size={15} />
              </button>
              <button onClick={() => setDeleteTarget(cat)} className="p-1.5 text-stone-400 hover:text-red-500 transition-colors">
                <FiTrash2 size={15} />
              </button>
            </div>
          </td>
        </motion.tr>
        {!isSubcat && isOpen && subcats.map(sub => (
          <CatRow key={sub.id} cat={sub} isSubcat />
        ))}
      </>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Categories</h1>
          <p className="text-stone-400 text-sm mt-0.5">{topLevel.length} categories, {categories.length - topLevel.length} subcategories</p>
        </div>
        <button onClick={() => setModal('add')}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition-colors">
          <FiPlus size={16} /> Add Category
        </button>
      </div>

      {loading ? <LoadingSpinner className="mt-20" size="lg" /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          {topLevel.length === 0 ? (
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
                {topLevel.map(cat => <CatRow key={cat.id} cat={cat} isSubcat={false} />)}
              </tbody>
            </table>
          )}
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={getModalTitle()}>
        {modal && (
          <CategoryForm
            {...getFormProps()}
            onSave={handleSave}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Category">
        <p className="text-sm text-stone-600 mb-5">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
          {deleteTarget?.parent_id == null && ' Any subcategories will also need to be removed separately.'}
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
