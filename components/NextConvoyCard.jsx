'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';

export default function NextConvoyCard({ convoy, upcomingConvoys = [], onSelectConvoy, onOpenAccountModal }) {
  const {
    user,
    toggleConvoyReminder,
    reminders,
    isAdmin,
    showToast,
    confirmAttendance,
    cancelAttendance,
    isDriverAttending,
    getConvoyAttendees
  } = useAuth();
  const [copiedRoomId, setCopiedRoomId] = useState(false);
  const [isAttendeesModalOpen, setIsAttendeesModalOpen] = useState(false);
  const [searchAttendee, setSearchAttendee] = useState('');

  if (!convoy) return null;

  const hasReminder = reminders.includes(convoy.id);
  const attendees = getConvoyAttendees ? getConvoyAttendees(convoy.id) : [];
  const isAttending = isDriverAttending ? isDriverAttending(convoy.id) : false;
  const totalConfirmedCount = attendees.length;

  const filteredAttendees = attendees.filter((a) => {
    const q = searchAttendee.toLowerCase().trim();
    if (!q) return true;
    return (
      a.name?.toLowerCase().includes(q) ||
      a.vtc?.toLowerCase().includes(q) ||
      a.truck?.toLowerCase().includes(q) ||
      a.id?.toLowerCase().includes(q)
    );
  });

  const handleCopyRoomId = () => {
    if (convoy.roomId) {
      navigator.clipboard.writeText(convoy.roomId);
      setCopiedRoomId(true);
      showToast(`Copied Convoy Room ID: ${convoy.roomId}`, 'success');
      setTimeout(() => setCopiedRoomId(false), 2500);
    }
  };

  return (
    <section id="next-convoy" className="py-4">
      <div className="container">

        <div className="text-center mb-4">
          <span className="badge badge-gold text-uppercase fw-bold px-3 py-2 mb-2">
            <i className="bi bi-calendar-check-fill me-1"></i> Official Timetable Run
          </span>
          <h2 className="display-6 fw-extrabold text-dark mb-1">
            Next Public Convoy: {convoy.day} @ {convoy.eatTime || '21:00 EAT'} <span className="fs-6 text-muted">({convoy.time})</span>
          </h2>
          <p className="text-secondary mx-auto mb-0" style={{ maxWidth: '650px' }}>
            Full convoy briefing, server room coordinates, departure timetable in Kenyan Time (EAT, UTC+3), and equipment regulations directly matching the GTC Convoys Planner.
          </p>
        </div>

        <div className="card glass shadow-lg overflow-hidden">

          <div className="card-header bg-light py-3 px-4 d-flex flex-wrap align-items-center justify-content-between gap-3 border-bottom" style={{ borderColor: '#e2e8f0' }}>
            <div className="d-flex flex-wrap align-items-center gap-2">
              <span className="badge badge-gold text-uppercase px-3 py-2 fw-bold">
                <i className="bi bi-controller me-1"></i> {convoy.game}
              </span>

              <span className="badge bg-white text-dark border px-3 py-2 fw-bold" style={{ borderColor: '#e2e8f0' }}>
                <i className="bi bi-map me-1" style={{ color: '#0284c7' }}></i> {convoy.detail}
              </span>

              <div className="d-inline-flex align-items-center gap-2 bg-white border px-3 py-1 rounded-2 shadow-sm" style={{ borderColor: '#e2e8f0' }}>
                <span className="small text-secondary"><i className="bi bi-key-fill text-warning me-1"></i> Room ID:</span>
                <strong className="small" style={{ color: '#0284c7' }}>{convoy.roomId || 'GTC-TIMETABLE'}</strong>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-warning py-0 px-2"
                  onClick={handleCopyRoomId}
                  style={{ fontSize: '0.75rem' }}
                >
                  <i className={`bi ${copiedRoomId ? 'bi-check2' : 'bi-clipboard'} me-1`}></i>
                  {copiedRoomId ? 'Copied' : 'Copy'}
                </button>
              </div>

              <span className="text-secondary small">
                <i className="bi bi-hdd-network me-1"></i> Site: <strong className="text-dark">{convoy.site || 'TruckersMP Sim 1'}</strong>
              </span>
            </div>

            <div className="d-flex align-items-center gap-3">
              <span className="small text-secondary">
                <i className="bi bi-person-fill me-1"></i> Lead: <strong className="text-dark">{convoy.leadDriver}</strong>
              </span>
              {isAdmin && (
                <Link href="/admin" className="btn btn-sm btn-outline-warning">
                  <i className="bi bi-pencil-square me-1"></i> Edit Card
                </Link>
              )}
            </div>
          </div>

          <div className="card-body p-4 p-lg-5">
            <div className="row g-4 g-lg-5">

              <div className="col-12 col-lg-7">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                  <h3 className="h4 fw-bold text-dark mb-0">
                    {convoy.title || `${convoy.game} - ${convoy.detail}`}
                  </h3>
                  <span className="badge bg-primary text-white text-uppercase small">
                    {convoy.day} &bull; {convoy.eatTime || '21:00 EAT'} <span className="opacity-75">({convoy.time})</span>
                  </span>
                </div>
                <p className="text-secondary mb-3">{convoy.subTitle}</p>

                {upcomingConvoys && upcomingConvoys.length > 1 && (
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-3 p-2 rounded-2 bg-light border" style={{ borderColor: '#e2e8f0' }}>
                    <span className="small text-secondary fw-bold">
                      <i className="bi bi-clock-history me-1"></i> Timetable Runs:
                    </span>
                    {upcomingConvoys.map((c) => {
                      const isActive = c.id === convoy.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => onSelectConvoy && onSelectConvoy(c)}
                          className={`btn btn-sm ${isActive ? 'btn-primary fw-bold shadow-sm' : 'btn-outline-secondary'}`}
                          style={isActive ? { backgroundColor: '#0284c7', borderColor: '#0284c7', color: '#ffffff', fontSize: '0.75rem' } : { fontSize: '0.75rem' }}
                        >
                          {c.dayShort} {c.eatTime || c.time} &bull; {c.game}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="p-3 rounded-3 bg-light border mb-4" style={{ borderColor: '#e2e8f0' }}>
                  <div className="row align-items-center text-center text-sm-start g-3">
                    <div className="col-12 col-sm-3">
                      <span className="small text-uppercase text-secondary fw-bold d-block mb-1">
                        <i className="bi bi-calendar-check-fill text-primary me-1"></i> Timetable Day
                      </span>
                      <div className="fw-bold fs-5 text-dark">{convoy.day}</div>
                      <div className="small fw-bold" style={{ color: '#0284c7' }}>
                        {convoy.eatTime || '21:00 EAT'}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {convoy.time}
                      </div>
                    </div>

                    <div className="col-12 col-sm-3">
                      <span className="small text-uppercase text-secondary fw-bold d-block mb-1">
                        <i className="bi bi-controller text-warning me-1"></i> Simulator
                      </span>
                      <div className="fw-bold fs-5 text-dark">{convoy.game}</div>
                      <div className="small text-secondary">
                        {convoy.game?.includes('ATS') ? 'American Truck Sim' : 'Euro Truck Sim 2'}
                      </div>
                    </div>

                    <div className="col-12 col-sm-3">
                      <span className="small text-uppercase text-secondary fw-bold d-block mb-1">
                        <i className="bi bi-map-fill text-success me-1"></i> Map / Edition
                      </span>
                      <div className="fw-bold fs-5 text-dark">{convoy.detail}</div>
                      <div className="small text-secondary">
                        {convoy.dlcMapRequired}
                      </div>
                    </div>

                    <div className="col-12 col-sm-3 text-sm-end">
                      <span className="small text-uppercase text-secondary fw-bold d-block mb-1">
                        <i className="bi bi-clock-fill text-danger me-1"></i> Kenyan Time (EAT)
                      </span>
                      <div className="fw-bold fs-6 text-dark">Meet: {convoy.eatMeetupTime || '20:30 EAT'}</div>
                      <div className="small fw-bold" style={{ color: '#0284c7' }}>
                        Rolls: {convoy.eatTime || '21:00 EAT'}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        UTC: {convoy.meetupTime} / {convoy.time}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row g-3 mb-4">

                  <div className="col-12 col-sm-6">
                    <div className="p-3 rounded-3 bg-white border h-100 shadow-sm" style={{ borderColor: '#e2e8f0' }}>
                      <div className="d-flex align-items-center gap-2 small text-secondary fw-bold text-uppercase mb-2">
                        <i className="bi bi-truck text-warning"></i> Truck Specifications
                      </div>
                      <div className="fw-bold text-dark small mb-1">{convoy.truck?.recommended}</div>
                      <div className="text-secondary small">Power: {convoy.truck?.minPower}</div>
                      <div className="small mt-1 fw-semibold" style={{ color: '#0284c7' }}>Livery: {convoy.truck?.livery}</div>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6">
                    <div className="p-3 rounded-3 bg-white border h-100 shadow-sm" style={{ borderColor: '#e2e8f0' }}>
                      <div className="d-flex align-items-center gap-2 small text-secondary fw-bold text-uppercase mb-2">
                        <i className="bi bi-box-seam text-warning"></i> Cargo &amp; Freight
                      </div>
                      <div className="mb-1">
                        <span className={`badge ${convoy.isDlcCargo ? 'badge-gold' : 'badge-green'} text-uppercase small`}>
                          <i className={`bi ${convoy.isDlcCargo ? 'bi-lightning-charge-fill' : 'bi-check-circle-fill'} me-1`}></i>
                          {convoy.isDlcCargo ? 'DLC Cargo Convoy' : 'Base Game Cargo'}
                        </span>
                      </div>
                      <div className="fw-bold text-dark small mb-1">{convoy.cargo}</div>
                      <div className="text-secondary small">{convoy.dlcDetails}</div>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6">
                    <div className="p-3 rounded-3 bg-white border h-100 shadow-sm" style={{ borderColor: '#e2e8f0' }}>
                      <div className="d-flex align-items-center gap-2 small text-secondary fw-bold text-uppercase mb-2">
                        <i className="bi bi-map text-warning"></i> Map Territory
                      </div>
                      <div className="text-dark small fw-bold mb-1">{convoy.dlcMapRequired}</div>
                      <div className="text-secondary small">Speed Pace: {convoy.speedLimit}</div>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6">
                    <div className="p-3 rounded-3 bg-white border h-100 shadow-sm" style={{ borderColor: '#e2e8f0' }}>
                      <div className="d-flex align-items-center gap-2 small text-secondary fw-bold text-uppercase mb-2">
                        <i className="bi bi-broadcast text-danger"></i> Radio CB &amp; Voice
                      </div>
                      <div className="small fw-bold mb-1" style={{ color: '#0284c7' }}>{convoy.voiceChannel}</div>
                      <div className="text-secondary small">Briefing: 15 min prior to wheels roll</div>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-3">
                  {isAttending ? (
                    <button
                      type="button"
                      onClick={() => cancelAttendance(convoy.id)}
                      className="btn btn-success fw-bold d-inline-flex align-items-center gap-2 shadow-sm"
                    >
                      <i className="bi bi-check-circle-fill"></i> Attendance Confirmed (Cancel RSVP)
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (!user) {
                          onOpenAccountModal ? onOpenAccountModal('login') : showToast('Please sign in to confirm attendance', 'info');
                        } else {
                          confirmAttendance(convoy.id);
                        }
                      }}
                      className="btn btn-warning fw-bold d-inline-flex align-items-center gap-2 shadow-sm"
                      style={{ color: '#0f172a' }}
                    >
                      <i className="bi bi-calendar-check-fill"></i> Confirm Attendance (RSVP)
                    </button>
                  )}

                  <button
                    onClick={() => toggleConvoyReminder(convoy.id, convoy.title || `${convoy.game} - ${convoy.detail} (${convoy.day} ${convoy.eatTime || convoy.time})`, convoy.eatMeetupTime || convoy.meetupTime)}
                    className={`btn ${hasReminder ? 'btn-outline-secondary' : 'btn-primary'}`}
                    style={!hasReminder ? { backgroundColor: '#0284c7', borderColor: '#0284c7', color: '#ffffff' } : {}}
                  >
                    <i className={`bi ${hasReminder ? 'bi-check-circle-fill text-success' : 'bi-bell-fill'} me-2`}></i>
                    {hasReminder ? 'Reminder Active' : `Set Reminder for ${convoy.day} @ ${convoy.eatTime || convoy.time}`}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAttendeesModalOpen(true)}
                    className="btn btn-outline-secondary fw-bold"
                  >
                    <i className="bi bi-people-fill me-1"></i> Confirmed Drivers ({attendees.length})
                  </button>

                  <a
                    href="/GTC-Convoys-Planner.pdf"
                    download="GTC-Convoys-Planner.pdf"
                    className="btn btn-outline-primary"
                    style={{ borderColor: '#0284c7', color: '#0284c7' }}
                  >
                    <i className="bi bi-file-earmark-pdf me-2"></i> Download Planner PDF
                  </a>
                  <a href="#schedule" className="btn btn-outline-secondary">
                    <i className="bi bi-calendar3 me-1"></i> Full Timetable
                  </a>
                </div>
              </div>

              <div className="col-12 col-lg-5 d-flex flex-column gap-4">

                <div className="card p-3 position-relative shadow-sm" style={{ borderColor: '#e2e8f0' }}>
                  <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                    <span className="fw-bold text-dark small">
                      <i className="bi bi-clock-history text-warning me-1"></i> Waiting &amp; Staging Card
                    </span>
                    <span className="badge badge-gold text-uppercase fw-bold" style={{ fontSize: '0.68rem' }}>
                      Kenyan Time (EAT)
                    </span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between p-3 rounded-2 bg-light mb-3">
                    <div className="text-start">
                      <span className="small text-secondary text-uppercase d-block" style={{ fontSize: '0.72rem' }}>Meetup (EAT)</span>
                      <span className="fs-5 fw-bold" style={{ color: '#0284c7' }}>{convoy.eatMeetupTime || '17:30 EAT'}</span>
                      <span className="small text-muted d-block" style={{ fontSize: '0.7rem' }}>{convoy.meetupTime}</span>
                    </div>
                    <div className="text-secondary"><i className="bi bi-arrow-right fs-5 text-warning"></i></div>
                    <div className="text-end">
                      <span className="small text-secondary text-uppercase d-block" style={{ fontSize: '0.72rem' }}>Rolling (EAT)</span>
                      <span className="fs-5 fw-bold text-dark">
                        {convoy.eatTime || '18:00 EAT'}
                      </span>
                      <span className="small text-muted d-block" style={{ fontSize: '0.7rem' }}>{convoy.time}</span>
                    </div>
                  </div>

                  <p className="small text-secondary mb-3">
                    <strong className="text-dark">Arrival Protocol:</strong> {convoy.notes}
                  </p>

                  <div className="d-flex flex-wrap justify-content-between align-items-center pt-2 border-top gap-2 small">
                    <div>
                      <span className="text-secondary">Confirmed: </span>
                      <strong className="text-dark fs-6">{totalConfirmedCount} / {convoy.maxSlots || 80}</strong>
                      <button
                        type="button"
                        onClick={() => setIsAttendeesModalOpen(true)}
                        className="btn btn-sm btn-link p-0 ms-2 text-decoration-none fw-bold"
                        style={{ color: '#0284c7' }}
                      >
                        <i className="bi bi-people-fill me-1"></i> View Drivers ({attendees.length})
                      </button>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      {isAttending ? (
                        <span className="badge bg-success text-white fw-bold py-1 px-2">
                          <i className="bi bi-check-circle-fill me-1"></i> You&apos;re Attending
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-sm btn-primary py-1 px-2 fw-bold"
                          style={{ backgroundColor: '#0284c7', borderColor: '#0284c7' }}
                          onClick={() => {
                            if (!user) {
                              onOpenAccountModal ? onOpenAccountModal('login') : showToast('Please sign in to confirm attendance', 'info');
                            } else {
                              confirmAttendance(convoy.id);
                            }
                          }}
                        >
                          <i className="bi bi-plus-circle me-1"></i> Confirm Seat
                        </button>
                      )}
                      <span className="text-success fw-bold"><i className="bi bi-check-circle-fill me-1"></i> {convoy.status}</span>
                    </div>
                  </div>
                </div>

                <div className="card border overflow-hidden position-relative shadow-sm" style={{ height: '220px', borderColor: '#e2e8f0' }}>
                  <img
                    src={convoy.mapImage || (convoy.game?.includes('ATS') ? '/images/ats-art.jpg' : '/images/about-trucks.jpg')}
                    alt="Convoy Operation Visualizer"
                    className="w-100 h-100 object-fit-cover"
                  />
                  <div
                    className="position-absolute bottom-0 start-0 end-0 p-3 d-flex align-items-center justify-content-between"
                    style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.96) 80%)' }}
                  >
                    <div>
                      <span className="text-uppercase small fw-bold d-block" style={{ fontSize: '0.72rem', color: '#0284c7' }}>
                        Operation Visualizer
                      </span>
                      <span className="text-dark fw-bold small">
                        {convoy.game} &bull; {convoy.detail}
                      </span>
                    </div>
                    <span className="badge badge-gold">
                      <i className="bi bi-broadcast me-1"></i> CB CH 19
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isAttendeesModalOpen && (
        <div className="modal-backdrop-custom" onClick={() => setIsAttendeesModalOpen(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: '#e2e8f0' }}>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-people-fill fs-4" style={{ color: '#0284c7' }}></i>
                <div>
                  <h4 className="h5 fw-bold text-dark mb-0">Confirmed Convoy Drivers</h4>
                  <div className="small text-secondary">
                    {convoy.day} @ {convoy.eatTime || '18:00 EAT'} &bull; Room: <strong>{convoy.roomId || 'GTC-TIMETABLE'}</strong>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setIsAttendeesModalOpen(false)}
                aria-label="Close"
              ></button>
            </div>

            <div className="p-4 bg-light border-bottom d-flex flex-wrap justify-content-between align-items-center gap-3" style={{ borderColor: '#e2e8f0' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white border rounded-2 px-3 py-2 shadow-sm text-center">
                  <div className="small text-muted text-uppercase" style={{ fontSize: '0.68rem' }}>Slots Confirmed</div>
                  <strong className="fs-5 text-dark">{totalConfirmedCount} / {convoy.maxSlots || 80}</strong>
                </div>
                <div className="bg-white border rounded-2 px-3 py-2 shadow-sm text-center">
                  <div className="small text-muted text-uppercase" style={{ fontSize: '0.68rem' }}>Radio Channel</div>
                  <strong className="fs-5 text-danger">CB: CH 19</strong>
                </div>
              </div>

              <div>
                {isAttending ? (
                  <button
                    type="button"
                    onClick={() => cancelAttendance(convoy.id)}
                    className="btn btn-outline-danger btn-sm fw-bold shadow-sm"
                  >
                    <i className="bi bi-x-circle me-1"></i> Cancel My Attendance
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        setIsAttendeesModalOpen(false);
                        onOpenAccountModal ? onOpenAccountModal('login') : showToast('Please sign in to confirm attendance', 'info');
                      } else {
                        confirmAttendance(convoy.id);
                      }
                    }}
                    className="btn btn-primary btn-sm fw-bold shadow-sm"
                    style={{ backgroundColor: '#0284c7', borderColor: '#0284c7' }}
                  >
                    <i className="bi bi-check2-circle me-1"></i> Confirm My Attendance
                  </button>
                )}
              </div>
            </div>

            <div className="p-3 border-bottom bg-white" style={{ borderColor: '#e2e8f0' }}>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  placeholder="Filter confirmed drivers by callsign, VTC, truck..."
                  className="form-control"
                  value={searchAttendee}
                  onChange={(e) => setSearchAttendee(e.target.value)}
                />
                {searchAttendee && (
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setSearchAttendee('')}>
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="p-4" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              {filteredAttendees.length === 0 ? (
                <div className="text-center py-4 text-secondary">
                  <i className="bi bi-truck fs-1 text-muted d-block mb-2"></i>
                  <p className="small mb-2">
                    {searchAttendee ? 'No confirmed drivers matching search.' : 'No drivers have confirmed attendance for this convoy run yet. Be the first to confirm your staging slot!'}
                  </p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {filteredAttendees.map((att, idx) => {
                    const rolesList = att.roles || (att.role ? [att.role] : ['driver']);
                    const isCurrentUser = user && (user.id === att.id || user.name === att.name);

                    return (
                      <div
                        key={att.id || idx}
                        className={`p-3 rounded-2 border d-flex align-items-center justify-content-between flex-wrap gap-2 ${isCurrentUser ? 'bg-primary-subtle border-primary' : 'bg-white shadow-sm'}`}
                        style={{ borderColor: isCurrentUser ? '#0284c7' : '#e2e8f0' }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          {att.avatar ? (
                            <img
                              src={att.avatar}
                              alt={att.name}
                              className="rounded-circle object-fit-cover border shadow-sm"
                              style={{ width: '40px', height: '40px', borderColor: '#e2e8f0' }}
                            />
                          ) : (
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                              style={{ width: '40px', height: '40px', backgroundColor: '#0284c7', fontSize: '0.85rem' }}
                            >
                              {att.name ? att.name.slice(0, 2).toUpperCase() : 'DR'}
                            </div>
                          )}

                          <div>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              <span className="fw-bold text-dark">{att.name}</span>
                              {isCurrentUser && (
                                <span className="badge bg-primary small" style={{ fontSize: '0.62rem' }}>YOU</span>
                              )}
                              <span className="text-muted small" style={{ fontSize: '0.72rem' }}>({att.id})</span>
                            </div>
                            <div className="small text-secondary">
                              VTC: <strong className="text-dark">{att.vtc || 'Independent'}</strong> &bull; Rig: <span>{att.truck || 'Scania S730'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          {rolesList.map((rKey) => (
                            <span
                              key={rKey}
                              className="badge text-uppercase fw-bold"
                              style={{
                                fontSize: '0.65rem',
                                backgroundColor: rKey === 'admin' ? '#ef4444' :
                                  rKey === 'staff' ? '#a855f7' :
                                    rKey === 'dev_modder' ? '#0284c7' :
                                      rKey === 'convoy_lead' ? '#f59e0b' :
                                        rKey === 'dispatcher' ? '#0ea5e9' :
                                          rKey === 'streamer' ? '#ec4899' : '#10b981',
                                color: rKey === 'convoy_lead' ? '#0f172a' : '#ffffff'
                              }}
                            >
                              {rKey.replace('_', ' ')}
                            </span>
                          ))}
                          <span className="badge bg-success-subtle text-success border border-success fw-bold" style={{ fontSize: '0.65rem' }}>
                            <i className="bi bi-check-circle-fill me-1"></i> Confirmed
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-3 border-top bg-light text-center small text-secondary" style={{ borderColor: '#e2e8f0' }}>
              Meetup at staging area 30 minutes before wheels roll. Adhere to convoy lead instructions on CB CH 19.
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

