import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { productsApi } from '../../services/api';
import { getImageUrl } from '../../services/api';
import Modal from '../../components/admin/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () =>
    productsApi.list({ limit: 200, include_inactive: true, search: search || undefined })
      .then(setProducts).finally(() => setLoading(false));

  useEffect(() => { load(); }, [search]);

  const handleDelete = async () => {
    try {
      await productsApi.delete(deleteTarget.id);
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
      toast.success('Product deleted');
    } catch { toast.error('Failed to delete product'); }
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Products</h1>
          <p className="text-stone-400 text-sm mt-0.5">{products.length} total</p>
        </div>
        <Link to="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition-colors">
          <FiPlus size={16} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
        />
      </div>

      {loading ? <LoadingSpinner className="mt-20" size="lg" /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          {products.length === 0 ? (
            <p className="text-center text-stone-400 py-12 text-sm">
              {search ? `No products matching "${search}"` : 'No products yet.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-stone-50 text-xs text-stone-500 uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-5 py-3">Product</th>
                    <th className="text-left px-5 py-3">Category</th>
                    <th className="text-left px-5 py-3">Price</th>
                    <th className="text-left px-5 py-3">Stock</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-right px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {products.map(p => (
                    <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                            {p.primary_image_url && (
                              <img src={getImageUrl(p.primary_image_url)} alt={p.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <span className="font-medium text-stone-800 line-clamp-1">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-stone-500">{p.category?.name || '—'}</td>
                      <td className="px-5 py-3">
                        <div>
                          <span className="font-semibold text-stone-800">${p.final_price.toFixed(2)}</span>
                          {p.discount_percent > 0 && (
                            <span className="ml-1.5 text-xs text-stone-400 line-through">${p.price.toFixed(2)}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-stone-500">{p.quantity}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.is_sold_out ? 'bg-stone-100 text-stone-500' : 'bg-emerald-50 text-emerald-700'}`}>
                            {p.is_sold_out ? 'Sold Out' : 'In Stock'}
                          </span>
                          {!p.is_active && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-600">Hidden</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/products/${p.id}/edit`} className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors">
                            <FiEdit2 size={15} />
                          </Link>
                          <button onClick={() => setDeleteTarget(p)} className="p-1.5 text-stone-400 hover:text-red-500 transition-colors">
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Product">
        <p className="text-sm text-stone-600 mb-2">
          Delete <strong>{deleteTarget?.name}</strong>? This will also delete all product images.
        </p>
        <p className="text-xs text-red-500 mb-5">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={handleDelete} className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl">
            Delete
          </button>
          <button onClick={() => setDeleteTarget(null)} className="px-5 py-2.5 bg-stone-100 text-stone-700 text-sm font-semibold rounded-xl">
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}
