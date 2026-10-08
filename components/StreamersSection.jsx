'use client';

import React from 'react';
import { useAuth } from '@/lib/authContext';

export default function StreamersSection({ streamers }) {
  const { allDrivers } = useAuth();

  const streamerList = React.useMemo(() => {
    const list = [...(streamers || [])];
    const existingUrls = new Set(list.map((s) => (s.url || '').toLowerCase()));
    const existingNames = new Set(list.map((s) => (s.name || '').toLowerCase()));

    (allDrivers || []).forEach((d) => {
      const url = d.streamerUrl || d.stream || d.stream_url;
      const isStreamerRole = d.role === 'streamer' || (Array.isArray(d.roles) && d.roles.includes('streamer')) || d.isStreamer;
      if (isStreamerRole && url && !existingUrls.has(url.toLowerCase()) && !existingNames.has(d.name?.toLowerCase())) {
        list.push({
          id: d.id,
          name: d.name,
          platform: url.includes('tiktok') ? 'TikTok' : url.includes('twitch') ? 'Twitch' : 'YouTube',
          url: url,
          games: (Array.isArray(d.games) ? d.games.join(', ') : d.games) || 'ETS 2, ATS',
          status: 'Official Streamer',
          avatar: d.avatar || '',
          live: false
        });
        existingUrls.add(url.toLowerCase());
        existingNames.add(d.name?.toLowerCase());
      }
    });

    return list;
  }, [streamers, allDrivers]);

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
