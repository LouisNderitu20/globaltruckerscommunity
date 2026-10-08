'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';

function calculateTimeRemaining(convoy) {
  if (!convoy) return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false };
  let targetMs;
  if (convoy.departureTime) {
    targetMs = new Date(convoy.departureTime).getTime();
  } else if (convoy.hour !== undefined && convoy.dayIndex !== undefined) {
    const now = new Date();
    const currentDow = now.getUTCDay();
    const currentHour = now.getUTCHours() + now.getUTCMinutes() / 60;
    let offset = (convoy.dayIndex - currentDow + 7) % 7;
    if (offset === 0 && convoy.hour <= currentHour) offset = 7;
    const target = new Date(now);
    target.setUTCDate(now.getUTCDate() + offset);
    target.setUTCHours(convoy.hour, 0, 0, 0);
    targetMs = target.getTime();
  } else {
    targetMs = Date.now() + 6 * 3600 * 1000;
  }

  const nowMs = Date.now();
  const diff = targetMs - nowMs;
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, isLive: false };
}

export default function HeroCountdown({ nextConvoy, onOpenAccountModal }) {
  const { toggleConvoyReminder, reminders, user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [timerState, setTimerState] = useState(() => calculateTimeRemaining(nextConvoy));

  useEffect(() => {
    setMounted(true);
    const update = () => {
      setTimerState(calculateTimeRemaining(nextConvoy));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [nextConvoy?.departureTime, nextConvoy?.id, nextConvoy?.time]);

  const hasReminder = nextConvoy?.id ? reminders.includes(nextConvoy.id) : false;
  const { days, hours, minutes, seconds, isLive } = timerState;

  return (
    <section id="hero" className="pt-2 pt-md-3 pb-3 position-relative">
      <div className="container">
        <div className="row align-items-center g-4 g-lg-5">
          
          <div className="col-12 col-lg-7">
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-1 bg-white border shadow-sm mb-3" style={{ borderColor: '#e2e8f0' }}>
              <span className="small fw-bold text-uppercase" style={{ color: '#0284c7' }}>
                Next Timetable Convoy: {nextConvoy?.day} @ {nextConvoy?.eatTime || '21:00 EAT'} Kenyan Time ({nextConvoy?.time || '18:00 UTC'})
              </span>
            </div>

            <h1 className="display-4 fw-extrabold text-dark lh-sm mb-3">
              Haul Together.<br />
              <span style={{ color: '#0284c7' }}>Every Route. Every Map.</span>
            </h1>

            <p className="lead text-secondary mb-4" style={{ maxWidth: '620px', fontSize: '1.05rem' }}>
              Global Truckers Community (GTC) unites virtual ETS 2 and ATS truckers, VTC companies, streamers, and independent solo haulers from around the world into organized, synchronized convoys.
            </p>

            <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
              <a
                href="#next-convoy"
                className="btn btn-primary btn-lg shadow-sm"
                style={{ backgroundColor: '#0284c7', borderColor: '#0284c7', color: '#ffffff' }}
              >
                <i className="bi bi-truck me-2"></i> Next Convoy Card
              </a>
              <a
                href={nextConvoy?.pdfUrl || '/GTC-Convoys-Planner.pdf'}
                download="GTC-Convoys-Planner.pdf"
                className="btn btn-outline-primary btn-lg shadow-sm"
                style={{ borderColor: '#0284c7', color: '#0284c7' }}
              >
                <i className="bi bi-file-earmark-pdf-fill me-2"></i> Download Planner
              </a>
              <button
                onClick={() => onOpenAccountModal(user ? 'profile' : 'login')}
                className="btn btn-outline-secondary btn-lg"
              >
                <i className="bi bi-person-badge me-2"></i> {user ? 'Driver Portal' : 'Driver Portal (Sign In)'}
              </button>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small pt-1">
              <span className="d-flex align-items-center gap-1">
                <i className="bi bi-check-circle-fill" style={{ color: '#0284c7' }}></i> ETS 2 &bull; ATS Supported
              </span>
              <span>&bull;</span>
              <span className="d-flex align-items-center gap-1">
                <i className="bi bi-clock-history text-primary"></i> Kenyan Time: EAT (UTC+3)
              </span>
              <span>&bull;</span>
              <span className="d-flex align-items-center gap-1">
                <i className="bi bi-hdd-network text-success"></i> TruckersMP &bull; SCS Dedicated
              </span>
            </div>
          </div>

          <div className="col-12 col-lg-5">
            <div className="card glass p-4 shadow-lg">
              <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom" style={{ borderColor: '#e2e8f0' }}>
                <div>
                  <span
                    className="badge text-uppercase fw-bold mb-1"
                    style={{ backgroundColor: '#e0f2fe', color: '#0284c7', border: '1px solid rgba(2, 132, 199, 0.25)' }}
                  >
                    <i className="bi bi-stopwatch-fill me-1"></i> Timetable Countdown
                  </span>
                  <h4 className="fw-bold text-dark mb-0 fs-5">
                    {nextConvoy?.title || (nextConvoy?.game ? `${nextConvoy.game} - ${nextConvoy.detail}` : 'Scheduled Timetable Run')}
                  </h4>
                  <div className="small fw-semibold mt-1" style={{ color: '#0284c7' }}>
                    <i className="bi bi-calendar3 me-1"></i> {nextConvoy?.day} @ {nextConvoy?.eatTime || '18:00 EAT'} <span className="text-secondary fw-normal">({nextConvoy?.time})</span>
                  </div>
                </div>
                <span
                  className="badge text-white text-uppercase"
                  style={{ backgroundColor: isLive ? '#dc2626' : '#0284c7' }}
                >
                  {isLive ? 'Live Now' : 'Active Timer'}
                </span>
              </div>

              <div className="row g-2 mb-3" suppressHydrationWarning>
                <div className="col-3">
                  <div className="countdown-box">
                    <div className="countdown-num" suppressHydrationWarning>{String(days).padStart(2, '0')}</div>
                    <div className="countdown-lbl">Days</div>
                  </div>
                </div>
                <div className="col-3">
                  <div className="countdown-box">
                    <div className="countdown-num" suppressHydrationWarning>{String(hours).padStart(2, '0')}</div>
                    <div className="countdown-lbl">Hours</div>
                  </div>
                </div>
                <div className="col-3">
                  <div className="countdown-box">
                    <div className="countdown-num" suppressHydrationWarning>{String(minutes).padStart(2, '0')}</div>
                    <div className="countdown-lbl">Mins</div>
                  </div>
                </div>
                <div className="col-3">
                  <div className="countdown-box">
                    <div className="countdown-num" suppressHydrationWarning>{String(seconds).padStart(2, '0')}</div>
                    <div className="countdown-lbl">Secs</div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-3 bg-light border mb-3" style={{ borderColor: '#e2e8f0', backgroundColor: '#f8fafc' }}>
                <div className="d-flex justify-content-between align-items-center small mb-2">
                  <span className="text-secondary"><i className="bi bi-clock me-1"></i> Kenyan Time (EAT)</span>
                  <span className="text-dark fw-bold">
                    {nextConvoy?.day} @ {nextConvoy?.eatTime || '18:00 EAT'} <span className="text-secondary fw-normal">({nextConvoy?.time})</span>
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center small mb-2">
                  <span className="text-secondary"><i className="bi bi-controller me-1"></i> Simulator</span>
                  <span className="fw-bold" style={{ color: '#0284c7' }}>{nextConvoy?.game || 'ETS 2'}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center small mb-2">
                  <span className="text-secondary"><i className="bi bi-map me-1"></i> Map / Edition</span>
                  <span
                    className="badge px-2 py-1 fw-bold"
                    style={{ backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}
                  >
                    {nextConvoy?.detail || 'BASE MAP'}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center small mb-2">
                  <span className="text-secondary"><i className="bi bi-hdd-network me-1"></i> Server / Site</span>
                  <span className="fw-bold text-dark">{nextConvoy?.site || 'TruckersMP Sim 1'}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center small mb-2">
                  <span className="text-secondary"><i className="bi bi-key me-1"></i> Room ID</span>
                  <span className="fw-bold" style={{ color: '#0284c7' }}>{nextConvoy?.roomId || 'GTC-CONVOY-778'}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center small">
                  <span className="text-secondary"><i className="bi bi-clock-history me-1"></i> Staging / Roll</span>
                  <span className="text-dark fw-bold">
                    Meet {nextConvoy?.eatMeetupTime || '17:30 EAT'} &bull; Roll {nextConvoy?.eatTime || '18:00 EAT'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => toggleConvoyReminder(nextConvoy?.id || 'convoy-next', nextConvoy?.title || `${nextConvoy?.game} - ${nextConvoy?.detail} (${nextConvoy?.day} ${nextConvoy?.eatTime || nextConvoy?.time})`, nextConvoy?.eatMeetupTime || nextConvoy?.meetupTime)}
                className={`btn ${hasReminder ? 'btn-outline-secondary' : 'btn-primary'} w-100 fw-bold`}
                style={!hasReminder ? { backgroundColor: '#0284c7', borderColor: '#0284c7', color: '#ffffff' } : {}}
              >
                <i className={`bi ${hasReminder ? 'bi-check-circle-fill text-success' : 'bi-bell-fill'} me-2`}></i>
                {hasReminder ? 'Reminder Enabled (Inbox & Email Active)' : `Set Reminder for ${nextConvoy?.day || ''} @ ${nextConvoy?.eatTime || nextConvoy?.time || ''}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
