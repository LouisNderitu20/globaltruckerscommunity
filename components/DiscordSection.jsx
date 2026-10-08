'use client';

import React from 'react';

export default function DiscordSection({ config }) {
  const discordUrl = config?.discordUrl || 'https://discord.gg/NMucFhYaaY';
  const whatsappUrl = config?.whatsappUrl || 'https://chat.whatsapp.com/DA0RGVlaPJM2hsbi7tGH1m';
  const telegramUrl = config?.telegramUrl || 'https://t.me/+dPd9rDHL0jlhMzc0';

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
                    142 Active
                  </span>
                </div>

                <div className="d-flex flex-column gap-2 small">
                  <div className="d-flex justify-content-between align-items-center p-2 rounded-2 bg-white border">
                    <span className="text-dark fw-semibold">
                      <i className="bi bi-volume-up-fill text-warning me-2"></i> Convoy Radio #1 (CB 19)
                    </span>
                    <span className="text-success fw-bold">28 Drivers in Voice</span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center p-2 rounded-2 bg-white border">
                    <span className="text-dark fw-semibold">
                      <i className="bi bi-soundwave text-warning me-2"></i> Dispatch &amp; Pace Car Lead
                    </span>
                    <span className="text-secondary">Convoy Control</span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center p-2 rounded-2 bg-white border">
                    <span className="text-dark fw-semibold">
                      <i className="bi bi-volume-up-fill text-success me-2"></i> ATS Interstate Frequency
                    </span>
                    <span className="text-success fw-bold">12 Drivers in Voice</span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center p-2 rounded-2 bg-white border">
                    <span className="text-dark fw-semibold">
                      <i className="bi bi-chat-square-text-fill text-primary me-2"></i> #convoy-announcements
                    </span>
                    <span className="badge badge-gold small">Room ID Active</span>
                  </div>
                </div>

                <div className="mt-3 p-2 rounded-2 bg-white border text-secondary small">
                  <i className="bi bi-info-circle-fill me-1 text-warning"></i> In-game CB radio frequency: <strong>Channel 19</strong> on standard ETS 2 / ATS multiplayer.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
