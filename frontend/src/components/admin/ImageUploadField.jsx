import { useRef, useState } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import { getImageUrl } from '../../services/api';

export default function ImageUploadField({ label, hint, currentUrl, onFileSelect, onRemove, accept = 'image/*' }) {
  const inputRef = useRef();
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onFileSelect(file);
  };

  const handleRemove = () => {
    if (preview) {
      // Only a local preview — clear it without hitting the API
      setPreview(null);
      if (inputRef.current) inputRef.current.value = '';
    } else {
      // Saved image on server — delegate to parent which calls the API
      onRemove?.();
    }
  };

  const displayUrl = preview || getImageUrl(currentUrl);

  return (
    <div>
      {label && <label className="block text-xs font-semibold text-stone-600 mb-1">{label}</label>}
      {hint && <p className="text-xs text-stone-400 mb-1.5">{hint}</p>}
      <div className="flex items-start gap-3">
        {displayUrl && (
          <div className="relative shrink-0">
            <img src={displayUrl} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-stone-200" />
            <button type="button" onClick={handleRemove}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center shadow">
              <FiX size={11} />
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 text-sm text-stone-600 border-2 border-dashed border-stone-200 rounded-xl hover:border-rose-300 hover:text-rose-500 transition-colors"
        >
          <FiUpload size={15} />
          {displayUrl ? 'Change image' : 'Upload image'}
        </button>
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
      </div>
    </div>
  );
}
