import { useState, useEffect } from 'react';
import { announcementsApi } from '../services/api';

export default function AnnouncementBanner() {
  const [items, setItems] = useState([]);
  const [dismissed, setDismissed] = useState(
    () => !!sessionStorage.getItem('ann_bar_dismissed')
  );

  useEffect(() => {
    if (dismissed) return;
    announcementsApi.active().then(list => {
      if (list.length > 0) {
        setItems(list.map(a => (a.message ? `${a.title}  —  ${a.message}` : a.title)));
      }
    }).catch(() => {});
  }, [dismissed]);

  if (!items.length || dismissed) return null;

  // Duplicate for seamless loop: animation moves -50% then repeats
  const track = [...items, ...items];

  return (
    <div
      className="text-white flex items-center overflow-hidden"
      style={{ background: '#b8966a', height: '36px' }}
    >
      <div className="flex-1 overflow-hidden">
        <div
          className="animate-marquee inline-flex items-center"
          style={{ width: 'max-content' }}
        >
          {track.map((text, i) => (
            <span key={i} className="inline-flex items-center">
              <span
                className="whitespace-nowrap font-medium"
                style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '0 2.5rem' }}
              >
                {text}
              </span>
              <span style={{ opacity: 0.4, fontSize: '12px' }}>|</span>
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={() => {
          sessionStorage.setItem('ann_bar_dismissed', '1');
          setDismissed(true);
        }}
        className="shrink-0 px-3 text-white/60 hover:text-white transition-colors text-base leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
