import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { brandsApi } from '../../services/api';
import { getImageUrl } from '../../services/api';
import Modal from '../../components/admin/Modal';
import ImageUploadField from '../../components/admin/ImageUploadField';
import LoadingSpinner from '../../components/LoadingSpinner';

function BrandForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '');
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let brand;
      if (initial) {
        brand = await brandsApi.update(initial.id, { name });
        if (logoFile) brand = await brandsApi.uploadLogo(initial.id, logoFile);
      } else {
        brand = await brandsApi.create({ name });
        if (logoFile) brand = await brandsApi.uploadLogo(brand.id, logoFile);
      }
      onSave(brand);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error saving brand');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-stone-600 mb-1.5">Brand Name *</label>
        <input required value={name} onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
          placeholder="e.g. Zara" />
      </div>
      <ImageUploadField label="Brand Logo" currentUrl={initial?.logo_url}
        onFileSelect={setLogoFile} onRemove={() => setLogoFile(null)} />
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

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { brandsApi.list().then(setBrands).finally(() => setLoading(false)); }, []);

  const handleSave = (brand) => {
    setBrands(prev => {
      const idx = prev.findIndex(b => b.id === brand.id);
      return idx >= 0 ? prev.map(b => b.id === brand.id ? brand : b) : [...prev, brand];
    });
    setModal(null);
    toast.success('Brand saved!');
  };

  const handleDelete = async () => {
    try {
      await brandsApi.delete(deleteTarget.id);
      setBrands(prev => prev.filter(b => b.id !== deleteTarget.id));
      toast.success('Brand deleted');
    } catch { toast.error('Failed to delete'); }
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Brands</h1>
          <p className="text-stone-400 text-sm mt-0.5">{brands.length} total</p>
        </div>
        <button onClick={() => setModal('add')}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition-colors">
          <FiPlus size={16} /> Add Brand
        </button>
      </div>

      {loading ? <LoadingSpinner className="mt-20" size="lg" /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          {brands.length === 0 ? (
            <p className="text-center text-stone-400 py-12 text-sm">No brands yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-xs text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3">Logo</th>
                  <th className="text-left px-5 py-3">Name</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {brands.map(brand => (
                  <motion.tr key={brand.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-stone-50/50">
                    <td className="px-5 py-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 flex items-center justify-center">
                        {brand.logo_url
                          ? <img src={getImageUrl(brand.logo_url)} alt={brand.name} className="w-full h-full object-contain p-1" />
                          : <span className="text-lg font-bold text-stone-300">{brand.name[0]}</span>
                        }
                      </div>
                    </td>
                    <td className="px-5 py-3 font-medium text-stone-800">{brand.name}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setModal(brand)} className="p-1.5 text-stone-400 hover:text-rose-500">
                          <FiEdit2 size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(brand)} className="p-1.5 text-stone-400 hover:text-red-500">
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

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Brand' : 'Edit Brand'}>
        {modal && <BrandForm initial={modal === 'add' ? null : modal} onSave={handleSave} onCancel={() => setModal(null)} />}
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Brand">
        <p className="text-sm text-stone-600 mb-5">Delete <strong>{deleteTarget?.name}</strong>?</p>
        <div className="flex gap-3">
          <button onClick={handleDelete} className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl">Delete</button>
          <button onClick={() => setDeleteTarget(null)} className="px-5 py-2.5 bg-stone-100 text-stone-700 text-sm font-semibold rounded-xl">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
