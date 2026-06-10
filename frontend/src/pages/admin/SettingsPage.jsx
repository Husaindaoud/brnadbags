import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { settingsApi } from '../../services/api';
import ImageUploadField from '../../components/admin/ImageUploadField';

export default function SettingsPage() {
  const [form, setForm] = useState({ whatsapp_number: '', instagram_url: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi.get().then(s => {
      setSettings(s);
      setForm({ whatsapp_number: s.whatsapp_number || '', instagram_url: s.instagram_url || '' });
    });
  }, []);

  const handleRemoveLogo = async () => {
    try {
      const updated = await settingsApi.deleteLogo();
      setSettings(updated);
      setLogoFile(null);
      toast.success('Logo removed');
    } catch {
      toast.error('Failed to remove logo');
    }
  };

  const handleRemoveFavicon = async () => {
    try {
      const updated = await settingsApi.deleteFavicon();
      setSettings(updated);
      setFaviconFile(null);
      toast.success('Favicon removed');
    } catch {
      toast.error('Failed to remove favicon');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (logoFile) {
        const updated = await settingsApi.uploadLogo(logoFile);
        setSettings(updated);
        setLogoFile(null);
      }
      if (faviconFile) {
        const updated = await settingsApi.uploadFavicon(faviconFile);
        setSettings(updated);
        setFaviconFile(null);
      }
      const updated = await settingsApi.update(form);
      setSettings(updated);
      toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Site Settings</h1>
        <p className="text-stone-400 text-sm mt-1">Manage your store logo, favicon, WhatsApp, and Instagram.</p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSave}
        className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 max-w-xl space-y-6"
      >
        <ImageUploadField
          label="Store Logo"
          currentUrl={settings?.logo_url}
          onFileSelect={setLogoFile}
          onRemove={handleRemoveLogo}
        />

        <div style={{ borderTop: '1px solid #f0ece6', paddingTop: '20px' }}>
          <ImageUploadField
            label="Browser Tab Icon (Favicon)"
            hint="Recommended: 32×32 or 64×64 px PNG or ICO file"
            currentUrl={settings?.favicon_url}
            onFileSelect={setFaviconFile}
            onRemove={handleRemoveFavicon}
            accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/jpeg,image/webp"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5">WhatsApp Number</label>
          <input
            type="text"
            placeholder="+1234567890"
            value={form.whatsapp_number}
            onChange={e => setForm(f => ({ ...f, whatsapp_number: e.target.value }))}
            className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
          <p className="text-xs text-stone-400 mt-1">Include country code, e.g. +961 ...</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5">Instagram URL</label>
          <input
            type="url"
            placeholder="https://instagram.com/youraccount"
            value={form.instagram_url}
            onChange={e => setForm(f => ({ ...f, instagram_url: e.target.value }))}
            className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </motion.form>
    </div>
  );
}
