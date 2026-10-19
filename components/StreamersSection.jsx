'use client';

import React from 'react';
import { useAuth } from '@/lib/authContext';

export default function StreamersSection({ streamers }) {
  const { allDrivers, user } = useAuth();

  const streamerList = React.useMemo(() => {
    const list = [];
    const seenNames = new Set();
    const seenUrls = new Set();

    // 1. Process all live drivers from database via useAuth (handles 100+ users dynamically)
    (allDrivers || []).forEach((d) => {
      const isStreamerRole = d.role === 'streamer' || (Array.isArray(d.roles) && d.roles.includes('streamer')) || d.isStreamer;
      if (isStreamerRole) {
        let url = d.streamerUrl || d.stream || d.stream_url;
        if (!url) {
          const handle = (d.name || d.callsign || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
          url = `https://www.tiktok.com/@${handle || 'globaltruckers'}`;
        }
        const platform = d.streamerPlatform || (url.includes('tiktok') ? 'TikTok' : url.includes('twitch') ? 'Twitch' : url.includes('youtube') || url.includes('youtu.be') ? 'YouTube' : 'TikTok');
        const cleanName = (d.name || '').trim().toLowerCase();
        const activeAvatar = (user && (user.id === d.id || (user.email && user.email.toLowerCase() === d.email?.toLowerCase())) && user.avatar)
          ? user.avatar
          : (d.avatar || '');

        if (cleanName && !seenNames.has(cleanName)) {
          list.push({
            id: d.id,
            name: d.name,
            platform,
            url,
            games: (Array.isArray(d.games) ? d.games.join(', ') : d.games) || 'ETS 2, ATS',
            status: 'Official Streamer',
            avatar: activeAvatar,
            live: false
          });
          seenNames.add(cleanName);
          seenUrls.add(url.toLowerCase());
        }
      }
    });

    // 2. Also merge any configured streamers if not already present
    (streamers || []).forEach((s) => {
      const cleanName = (s.name || '').trim().toLowerCase();
      const cleanUrl = (s.url || '').trim().toLowerCase();
      const activeAvatar = (user && (user.id === s.id || (user.name && user.name.toLowerCase() === cleanName)) && user.avatar)
        ? user.avatar
        : (s.avatar || '');

      if (cleanName && !seenNames.has(cleanName) && (!cleanUrl || !seenUrls.has(cleanUrl))) {
        list.push({
          ...s,
          avatar: activeAvatar
        });
        seenNames.add(cleanName);
        if (cleanUrl) seenUrls.add(cleanUrl);
      }
    });

    return list;
  }, [streamers, allDrivers, user]);

  return (
    <section id="streamers" className="py-4">
      <div className="container">
        
        <div className="text-center mb-4">
          <span className="badge badge-gold text-uppercase fw-bold px-3 py-2 mb-2">
            <i className="bi bi-broadcast me-1"></i> Broadcast Network
          </span>
          <h2 className="display-6 fw-extrabold text-dark mb-2">Official Streamers &amp; Creators</h2>
          <p className="text-secondary mx-auto mb-0" style={{ maxWidth: '650px' }}>
            Watch GTC convoys broadcast live from multiple cabin viewpoints across TikTok, Twitch, and YouTube.
          </p>
        </div>

        <div className="row g-3 g-md-4">
          {streamerList.map((s, idx) => (
            <div key={s.id || idx} className="col-12 col-md-4">
              <div className="card glass p-3 d-flex flex-row align-items-center justify-content-between h-100 shadow-sm">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center overflow-hidden border"
                    style={{
                      width: '60px',
                      height: '50px',
                      backgroundColor: 'rgba(2, 132, 199, 0.08)',
                      borderColor: '#e2e8f0',
                      color: '#0284c7'
                    }}
                  >
                    {s.avatar ? (
                      <img src={s.avatar} alt={s.name} className="w-100 h-100 object-fit-cover" />
                    ) : (
                      <i className="bi bi-mic-fill fs-5"></i>
                    )}
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark fs-6 mb-0">{s.name}</h5>
                    <div className="small fw-semibold" style={{ color: '#0284c7' }}>
                      {s.platform} &bull; <span className="text-secondary fw-normal">{s.games}</span>
                    </div>
                  </div>
                </div>

                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-warning"
                >
                  <i className="bi bi-box-arrow-up-right me-1"></i> Watch
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
