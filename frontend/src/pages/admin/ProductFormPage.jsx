import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUpload, FiTrash2, FiStar, FiChevronLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { productsApi, categoriesApi, brandsApi, collectionsApi } from '../../services/api';
import { getImageUrl } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const emptyForm = {
  name: '', description: '', price: '', discount_percent: '',
  quantity: 0, is_active: true,
  category_id: '', brand_id: '', collection_id: '',
};

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = !!id && id !== 'new';
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const imageInputRef = useRef();

  useEffect(() => {
    Promise.all([
      categoriesApi.list(),
      brandsApi.list(),
      collectionsApi.list(),
      isEdit ? productsApi.get(id) : Promise.resolve(null),
    ]).then(([cats, brs, cols, prod]) => {
      setCategories(cats);
      setBrands(brs);
      setCollections(cols);
      if (prod) {
        setProduct(prod);
        setForm({
          name: prod.name,
          description: prod.description || '',
          price: prod.price,
          discount_percent: prod.discount_percent ?? '',
          quantity: prod.quantity,
          is_active: prod.is_active,
          category_id: prod.category?.id || '',
          brand_id: prod.brand?.id || '',
          collection_id: prod.collection?.id || '',
        });
      }
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        price: Number(form.price),
        discount_percent: form.discount_percent !== '' ? Number(form.discount_percent) : null,
        quantity: Number(form.quantity),
        is_active: form.is_active,
        category_id: form.category_id || null,
        brand_id: form.brand_id || null,
        collection_id: form.collection_id || null,
      };
      if (isEdit) {
        const updated = await productsApi.update(id, payload);
        setProduct(updated);
        toast.success('Product updated!');
      } else {
        const created = await productsApi.create(payload);
        toast.success('Product created! You can now upload images below.');
        navigate(`/admin/products/${created.id}/edit`, { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !product) return;
    setUploadingImages(true);
    try {
      await productsApi.uploadImages(product.id, files);
      const refreshed = await productsApi.get(product.id);
      setProduct(refreshed);
      toast.success(`${files.length} image(s) uploaded`);
    } catch { toast.error('Image upload failed'); }
    finally { setUploadingImages(false); imageInputRef.current.value = ''; }
  };

  const handleSetPrimary = async (imageId) => {
    await productsApi.setPrimaryImage(product.id, imageId);
    setProduct(p => ({ ...p, images: p.images.map(img => ({ ...img, is_primary: img.id === imageId })) }));
    toast.success('Primary image set');
  };

  const handleDeleteImage = async (imageId) => {
    await productsApi.deleteImage(product.id, imageId);
    setProduct(p => ({ ...p, images: p.images.filter(img => img.id !== imageId) }));
    toast.success('Image removed');
  };

  if (loading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/products" className="text-stone-400 hover:text-stone-600 p-1.5">
          <FiChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{isEdit ? 'Edit Product' : 'New Product'}</h1>
          {product && <p className="text-stone-400 text-sm">ID #{product.id}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main form */}
        <motion.form onSubmit={handleSave} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="xl:col-span-2 space-y-5">

          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 space-y-4">
            <h2 className="font-semibold text-stone-800 text-sm">Basic Info</h2>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Product Name *</label>
              <input required value={form.name} onChange={e => setField('name', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
                placeholder="e.g. Leather Sandals" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Description</label>
              <textarea rows={4} value={form.description} onChange={e => setField('description', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                placeholder="Product description…" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 space-y-4">
            <h2 className="font-semibold text-stone-800 text-sm">Pricing & Stock</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Price ($) *</label>
                <input required type="number" min="0" step="0.01" value={form.price}
                  onChange={e => setField('price', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
                  placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Discount (%)</label>
                <input type="number" min="0" max="100" step="1" value={form.discount_percent}
                  onChange={e => setField('discount_percent', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
                  placeholder="0" />
                {form.discount_percent && form.price && (
                  <p className="text-xs text-rose-500 mt-1">
                    Final: ${(Number(form.price) * (1 - Number(form.discount_percent) / 100)).toFixed(2)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Quantity</label>
                <input type="number" min="0" value={form.quantity}
                  onChange={e => setField('quantity', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300" />
                {Number(form.quantity) === 0 && (
                  <p className="text-xs text-amber-500 mt-1">Will be marked as Sold Out</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 space-y-4">
            <h2 className="font-semibold text-stone-800 text-sm">Categorisation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Category</label>
                <select value={form.category_id} onChange={e => setField('category_id', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300">
                  <option value="">None</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Brand</label>
                <select value={form.brand_id} onChange={e => setField('brand_id', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300">
                  <option value="">None</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Collection</label>
                <select value={form.collection_id} onChange={e => setField('collection_id', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300">
                  <option value="">None</option>
                  {collections.map(c => <option key={c.id} value={c.id}>{c.name}{c.is_new ? ' ✨' : ''}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Visibility toggle + Save */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 flex items-center justify-between gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-10 h-6 rounded-full relative transition-colors ${form.is_active ? 'bg-rose-500' : 'bg-stone-200'}`}
                onClick={() => setField('is_active', !form.is_active)}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? 'left-5' : 'left-1'}`} />
              </div>
              <span className="text-sm font-medium text-stone-700">Visible on site</span>
            </label>
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
              {saving ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Product')}
            </button>
          </div>
        </motion.form>

        {/* Images panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
            <h2 className="font-semibold text-stone-800 text-sm mb-4">Product Images</h2>

            {!isEdit && !product ? (
              <p className="text-xs text-stone-400 text-center py-6 leading-relaxed">
                Save the product first, then you can upload images.
              </p>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImages}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-stone-200 rounded-xl text-sm text-stone-500 hover:border-rose-300 hover:text-rose-500 transition-colors disabled:opacity-60 mb-4"
                >
                  <FiUpload size={15} />
                  {uploadingImages ? 'Uploading…' : 'Upload Images'}
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />

                <div className="grid grid-cols-3 gap-2">
                  {(product?.images || []).sort((a, b) => b.is_primary - a.is_primary).map(img => (
                    <div key={img.id} className="relative group">
                      <div className={`aspect-square rounded-lg overflow-hidden border-2 ${img.is_primary ? 'border-rose-500' : 'border-transparent'}`}>
                        <img src={getImageUrl(img.image_url)} alt="" className="w-full h-full object-cover" />
                      </div>
                      {img.is_primary && (
                        <div className="absolute top-1 left-1 bg-rose-500 text-white rounded-full p-0.5">
                          <FiStar size={10} fill="white" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        {!img.is_primary && (
                          <button onClick={() => handleSetPrimary(img.id)}
                            className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-rose-500"
                            title="Set as primary">
                            <FiStar size={13} />
                          </button>
                        )}
                        <button onClick={() => handleDeleteImage(img.id)}
                          className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-red-500"
                          title="Delete image">
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {product?.images?.length === 0 && (
                  <p className="text-xs text-stone-400 text-center py-4">No images yet</p>
                )}

                <p className="text-xs text-stone-400 mt-3">
                  Hover an image to set it as primary (⭐) or delete it.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
