'use client';

import React from 'react';

export default function DiscordSection({ config }) {
  const discordUrl = config?.discordUrl || 'https://discord.gg/NMucFhYaaY';
  const whatsappUrl = config?.whatsappUrl || 'https://chat.whatsapp.com/DA0RGVlaPJM2hsbi7tGH1m';
  const telegramUrl = config?.telegramUrl || 'https://t.me/+dPd9rDHL0jlhMzc0';

  const channels = (Array.isArray(config?.discordChannels) && config.discordChannels.length > 0)
    ? config.discordChannels
    : [
        { name: 'Convoy Radio #1 (CB 19)', info: '28 Drivers in Voice', icon: 'bi-volume-up-fill text-warning', isSuccess: true },
        { name: 'Dispatch & Pace Car Lead', info: 'Convoy Control', icon: 'bi-soundwave text-warning' },
        { name: 'ATS Interstate Frequency', info: '12 Drivers in Voice', icon: 'bi-volume-up-fill text-success', isSuccess: true },
        { name: '#convoy-announcements', info: 'Room ID Active', icon: 'bi-chat-square-text-fill text-primary', isBadge: true }
      ];

  const activeCount = config?.discordActiveCount || '142 Active';
  const cbFrequency = config?.cbRadioFrequency || 'Channel 19';

  return (
    <section id="discord" className="py-4">
      <div className="container">
        <div className="card glass p-4 p-lg-5 shadow-lg">
          <div className="row align-items-center g-4 g-lg-5">

            <div className="col-12 col-lg-7">
              <span className="badge badge-gold text-uppercase fw-bold px-3 py-2 mb-3">
                <i className="bi bi-broadcast me-1"></i> Voice &amp; Dispatch Hub
              </span>

              <h2 className="display-6 fw-extrabold text-dark mb-3">
                Tune Into Discord Radio<br />&amp; Live Convoy Comms
              </h2>

              <p className="text-secondary lead fs-6 mb-4">
                All live convoy radio communications, hazard warnings, overtaking clearances and voice chatter take place in our official Discord server. Coordinate frequencies before rolling out onto the highway.
              </p>

              <div className="d-flex flex-wrap gap-3">
                <a
                  href={discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-warning btn-lg fw-bold shadow-sm"
                >
                  <i className="bi bi-discord me-2"></i> Join GTC Discord Server
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-success btn-lg fw-bold"
                >
                  <i className="bi bi-whatsapp me-2"></i> WhatsApp Group
                </a>
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-secondary btn-lg fw-bold"
                >
                  <i className="bi bi-telegram me-2"></i> Telegram Channel
                </a>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <div className="p-4 rounded-3 bg-light border" style={{ borderColor: '#e2e8f0' }}>
                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2" style={{ borderColor: '#e2e8f0' }}>
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-discord text-primary fs-5"></i>
                    <strong className="text-dark small">Global Truckers Radio</strong>
                  </div>
                  <span className="badge bg-success-subtle text-success small rounded-1">
                    {activeCount}
                  </span>
                </div>

                <div className="d-flex flex-column gap-2 small">
                  {channels.map((ch, idx) => (
                    <div key={idx} className="d-flex justify-content-between align-items-center p-2 rounded-2 bg-white border">
                      <span className="text-dark fw-semibold">
                        <i className={`bi ${ch.icon || 'bi-volume-up-fill text-warning'} me-2`}></i> {ch.name}
                      </span>
                      {ch.isBadge ? (
                        <span className="badge badge-gold small">{ch.info}</span>
                      ) : (
                        <span className={ch.isSuccess ? 'text-success fw-bold' : 'text-secondary'}>
                          {ch.info}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-2 rounded-2 bg-white border text-secondary small">
                  <i className="bi bi-info-circle-fill me-1 text-warning"></i> In-game CB radio frequency: <strong>{cbFrequency}</strong> on standard ETS 2 / ATS multiplayer.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
