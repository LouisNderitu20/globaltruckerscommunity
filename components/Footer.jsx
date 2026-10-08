'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';

export default function Footer({ config }) {
  const { isAdmin } = useAuth();
  const whatsappUrl = config?.whatsappUrl || 'https://chat.whatsapp.com/DA0RGVlaPJM2hsbi7tGH1m';
  const facebookUrl = config?.facebookUrl || 'https://www.facebook.com/globaltruckerscommunity';
  const telegramUrl = config?.telegramUrl || 'https://t.me/+dPd9rDHL0jlhMzc0';
  const discordUrl = config?.discordUrl || 'https://discord.gg/NMucFhYaaY';

  return (
    <footer className="bg-white border-top pt-5 pb-4 mt-5" style={{ borderColor: '#0284c7' }}>
      <div className="container">
        <div className="row g-4 mb-4">
          
          <div className="col-12 col-lg-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <svg viewBox="0 0 256 256" width="34" height="34" role="img" aria-label="GTC Logo" className="rounded-2 shadow-sm">
                <rect x="8" y="8" width="240" height="240" rx="36" fill="#0284c7" />
                <rect x="20" y="20" width="216" height="216" rx="26" fill="none" stroke="#ffffff" strokeWidth="6" />
                <g fill="#ffffff">
                  <path d="M38 73.5H90V86.5H51V131.5H90V144.5H38Z M77 102.5H90V131.5H77Z M63.5 102.5H77V115.5H63.5Z" />
                  <path d="M102 73.5H154V86.5H134.5V144.5H121.5V86.5H102Z" />
                  <path d="M166 73.5H218V86.5H179V131.5H218V144.5H166Z" />
                </g>
                <path d="M52 184H204" stroke="#f59e0b" strokeWidth="8" strokeDasharray="20 12" fill="none" />
              </svg>
              <div className="d-flex flex-column">
                <span className="fw-bold fs-5 text-dark lh-1">Global Truckers</span>
                <span className="small fw-bold text-uppercase" style={{ color: '#0284c7', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                  Community Hub
                </span>
              </div>
            </div>
            <p className="text-secondary small pe-lg-4">
              Haul Together. A worldwide open community connecting Euro Truck Simulator 2 and American Truck Simulator drivers, streamers, and virtual trucking companies.
            </p>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <h5 className="text-dark small fw-bold text-uppercase mb-3" style={{ letterSpacing: '0.05em' }}>Convoy Operations</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary">
              <li><a href="/#next-convoy" className="text-secondary text-decoration-none hover-gold">Next Convoy Briefing</a></li>
              <li><a href="/#schedule" className="text-secondary text-decoration-none hover-gold">Weekly Timetable</a></li>
              <li><a href="/GTC-Convoys-Planner.pdf" download="GTC-Convoys-Planner.pdf" className="fw-bold text-decoration-none" style={{ color: '#0284c7' }}><i className="bi bi-file-earmark-pdf-fill me-1"></i> Download PDF Planner</a></li>
              <li><a href="/#stats" className="text-secondary text-decoration-none hover-gold">Fleet Telemetry</a></li>
              <li><a href="/#signup" className="text-secondary text-decoration-none hover-gold">Driver Recruitment</a></li>
            </ul>
          </div>

          <div className="col-6 col-md-3 col-lg-3">
            <h5 className="text-dark small fw-bold text-uppercase mb-3" style={{ letterSpacing: '0.05em' }}>Comms &amp; Radio</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary">
              <li><a href={discordUrl} target="_blank" rel="noreferrer" className="text-secondary text-decoration-none hover-gold"><i className="bi bi-discord me-1" style={{ color: '#5865F2' }}></i> Discord Radio Server</a></li>
              <li><a href={whatsappUrl} target="_blank" rel="noreferrer" className="text-secondary text-decoration-none hover-gold"><i className="bi bi-whatsapp me-1 text-success"></i> WhatsApp Group</a></li>
              <li><a href={telegramUrl} target="_blank" rel="noreferrer" className="text-secondary text-decoration-none hover-gold"><i className="bi bi-telegram me-1 text-info"></i> Telegram Channel</a></li>
              <li><a href={facebookUrl} target="_blank" rel="noreferrer" className="text-secondary text-decoration-none hover-gold"><i className="bi bi-facebook me-1 text-primary"></i> Facebook Page</a></li>
              <li><a href="https://truckersmp.com" target="_blank" rel="noreferrer" className="text-secondary text-decoration-none hover-gold"><i className="bi bi-hdd-network me-1"></i> TruckersMP Hub</a></li>
            </ul>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <h5 className="text-dark small fw-bold text-uppercase mb-3" style={{ letterSpacing: '0.05em' }}>Management</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 small text-secondary">
              {isAdmin && (
                <li><Link href="/admin" className="fw-bold text-decoration-none" style={{ color: '#0284c7' }}><i className="bi bi-gear-fill me-1"></i> Admin Content Desk</Link></li>
              )}
              <li><Link href="/stats" className="text-secondary text-decoration-none hover-gold"><i className="bi bi-speedometer2 me-1"></i> Distance Leaderboard</Link></li>
              <li><a href="/#gallery" className="text-secondary text-decoration-none hover-gold"><i className="bi bi-images me-1"></i> Screenshot Gallery</a></li>
              <li><a href="/#news" className="text-secondary text-decoration-none hover-gold"><i className="bi bi-shield-check me-1"></i> Rules &amp; CB Protocol</a></li>
            </ul>
          </div>
        </div>

        <div className="border-top pt-3 d-flex flex-wrap justify-content-between align-items-center small text-secondary" style={{ borderColor: 'rgba(2, 132, 199, 0.35)' }}>
          <div>
            &copy; {new Date().getFullYear()} Global Truckers Community (GTC). All simulator trademarks belong to SCS Software.
          </div>
          <div className="d-flex gap-3">
            <span>ETS 2 &bull; ATS &bull; TruckersMP</span>
            {isAdmin && (
              <Link href="/admin" className="text-secondary text-decoration-none hover-gold">Admin CMS</Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
