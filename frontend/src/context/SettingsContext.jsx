import { createContext, useContext, useState, useEffect } from 'react';
import { settingsApi, getImageUrl } from '../services/api';

const SettingsContext = createContext(null);

function applyFavicon(url) {
  let link = document.querySelector("link[rel='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = url || '/vite.svg';
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({ logo_url: null, favicon_url: null, whatsapp_number: '', instagram_url: '' });

  useEffect(() => {
    settingsApi.get().then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    applyFavicon(settings.favicon_url ? getImageUrl(settings.favicon_url) : null);
  }, [settings.favicon_url]);

  useEffect(() => {
    if (settings.site_title) document.title = settings.site_title;
  }, [settings.site_title]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
