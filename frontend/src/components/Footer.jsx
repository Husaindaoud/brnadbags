import { Link } from 'react-router-dom';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { useSettings } from '../context/SettingsContext';
import { getImageUrl } from '../services/api';

export default function Footer() {
  const { settings } = useSettings();
  const waNumber = settings?.whatsapp_number?.replace(/\D/g, '');

  return (
    <footer className="mt-auto" style={{ background: '#f8f6f2', borderTop: '1px solid #e8e3db' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            {settings?.logo_url ? (
              <img src={getImageUrl(settings.logo_url)} alt="Store" className="h-10 w-auto object-contain mb-4" />
            ) : (
              <span className="font-display text-2xl font-bold text-stone-900 block mb-4">Boutique</span>
            )}
            <p className="text-sm leading-relaxed text-stone-500">
              {settings?.footer_description || 'Curated fashion for the modern woman. Browse, fall in love, inquire via WhatsApp.'}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4
              className="text-stone-900 font-semibold mb-5"
              style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase' }}
            >
              Shop
            </h4>
            <ul className="space-y-3">
              {[
                { to: '/categories', label: 'All Categories' },
                { to: '/new-collection', label: 'New Collection' },
                { to: '/sale', label: 'Sale' },
                { to: '/brands', label: 'Brands' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-stone-500 hover:text-[#b8966a] transition-colors text-sm"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-stone-900 font-semibold mb-5"
              style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase' }}
            >
              Contact
            </h4>
            <div className="flex flex-col gap-3.5">
              {waNumber && (
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-stone-500 hover:text-[#b8966a] transition-colors"
                >
                  <FaWhatsapp size={17} style={{ color: '#b8966a' }} />
                  Chat on WhatsApp
                </a>
              )}
              {settings?.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-stone-500 hover:text-[#b8966a] transition-colors"
                >
                  <FaInstagram size={17} style={{ color: '#b8966a' }} />
                  Follow on Instagram
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-200 py-5 text-center" style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#a8a29e' }}>
        © {new Date().getFullYear()} Powered by e-tech.
      </div>
    </footer>
  );
}
