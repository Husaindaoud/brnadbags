import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiEdit2, FiMove } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { slidersApi } from '../../services/api';
import { getImageUrl } from '../../services/api';
import Modal from '../../components/admin/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';

function SliderUploadForm({ onSave, onCancel }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({ caption: '', link: '', order: 0 });
  const [saving, setSaving] = useState(false);
  const inputRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please select an image'); return; }
    setSaving(true);
    try {
      const slide = await slidersApi.upload(file, form.caption, form.link, form.order);
      onSave(slide);
    } catch { toast.error('Upload failed'); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {preview && <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-xl" />}
      <div>
        <label className="block text-xs font-semibold text-stone-600 mb-1.5">Image *</label>
        <button type="button" onClick={() => inputRef.current?.click()}
          className="px-4 py-2 text-sm border-2 border-dashed border-stone-200 rounded-xl text-stone-500 hover:border-rose-300 hover:text-rose-500 transition-colors">
          {file ? file.name : 'Choose image…'}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-stone-600 mb-1.5">Caption</label>
        <input value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
          className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
          placeholder="e.g. Summer Collection 2024" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-stone-600 mb-1.5">Link (optional)</label>
        <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
          className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
          placeholder="e.g. /new-collection" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-stone-600 mb-1.5">Display Order</label>
        <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))}
          className="w-32 px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl disabled:opacity-60">
          {saving ? 'Uploading…' : 'Upload'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 bg-stone-100 text-stone-700 text-sm font-semibold rounded-xl">Cancel</button>
      </div>
    </form>
  );
}

export default function SlidersPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { slidersApi.list().then(setSlides).finally(() => setLoading(false)); }, []);

  const handleDelete = async () => {
    await slidersApi.delete(deleteTarget.id);
    setSlides(prev => prev.filter(s => s.id !== deleteTarget.id));
    toast.success('Slide deleted');
    setDeleteTarget(null);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    const updated = await slidersApi.update(editTarget.id, editForm);
    setSlides(prev => prev.map(s => s.id === editTarget.id ? updated : s));
    setEditTarget(null);
    toast.success('Slide updated');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Slider Images</h1>
          <p className="text-stone-400 text-sm mt-0.5">Homepage hero carousel</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl">
          <FiPlus size={16} /> Add Slide
        </button>
      </div>

      {loading ? <LoadingSpinner className="mt-20" size="lg" /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.length === 0 && (
            <div className="col-span-full text-center text-stone-400 text-sm bg-white rounded-2xl p-12 border border-stone-100">
              No slides yet. Upload your first hero image.
            </div>
          )}
          {slides.map(slide => (
            <motion.div key={slide.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100">
              <div className="aspect-video bg-stone-100">
                <img src={getImageUrl(slide.image_url)} alt={slide.caption || 'Slide'}
                  className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-medium text-stone-800 text-sm">{slide.caption || '—'}</p>
                    {slide.link && <p className="text-xs text-stone-400 mt-0.5">{slide.link}</p>}
                  </div>
                  <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full shrink-0">#{slide.order}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditTarget(slide); setEditForm({ caption: slide.caption || '', link: slide.link || '', order: slide.order }); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 bg-stone-50 hover:bg-stone-100 rounded-lg transition-colors">
                    <FiEdit2 size={12} /> Edit
                  </button>
                  <button onClick={() => setDeleteTarget(slide)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                    <FiTrash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Slide">
        <SliderUploadForm
          onSave={(s) => { setSlides(prev => [...prev, s].sort((a, b) => a.order - b.order)); setShowAdd(false); toast.success('Slide added!'); }}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Slide">
        <form onSubmit={handleEditSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Caption</label>
            <input value={editForm.caption || ''} onChange={e => setEditForm(f => ({ ...f, caption: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Link</label>
            <input value={editForm.link || ''} onChange={e => setEditForm(f => ({ ...f, link: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Order</label>
            <input type="number" value={editForm.order ?? 0} onChange={e => setEditForm(f => ({ ...f, order: Number(e.target.value) }))}
              className="w-32 px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="px-5 py-2.5 bg-rose-500 text-white text-sm font-semibold rounded-xl">Save</button>
            <button type="button" onClick={() => setEditTarget(null)} className="px-5 py-2.5 bg-stone-100 text-stone-700 text-sm font-semibold rounded-xl">Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Slide">
        <p className="text-sm text-stone-600 mb-5">Delete this slide?</p>
        <div className="flex gap-3">
          <button onClick={handleDelete} className="px-5 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl">Delete</button>
          <button onClick={() => setDeleteTarget(null)} className="px-5 py-2.5 bg-stone-100 text-stone-700 text-sm font-semibold rounded-xl">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
