'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { getKenyanTime } from '@/lib/defaultConfig';

const TIME_SLOTS = [
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
  '00:00'
];

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const SCHEDULE_DATA = {
  '18:00': {
    MON: { game: 'ETS 2', detail: 'BASE MAP' },
    TUE: { game: 'ETS 2', detail: 'CARGO DLC' },
    WED: { game: 'ATS', detail: 'BASE MAP' },
    THU: { game: 'BRAZIL MAP', detail: 'CARGO DLC' },
    FRI: { game: 'ETS 2', detail: 'MAP DLC' },
    SAT: { game: 'EAA MAP', detail: 'CARGO DLC' },
    SUN: { game: 'ETS 2 (TMP)', detail: 'BASE MAP' },
  },
  '20:00': {
    MON: { game: 'ETS 2', detail: 'BRAZIL MAP' },
    TUE: { game: 'ETS 2', detail: 'EAA MAP' },
    WED: { game: 'ETS 2 (TMP)', detail: 'BASE MAP' },
    THU: { game: 'ETS 2', detail: 'BASE MAP' },
    FRI: { game: 'ETS 2 (TMP)', detail: 'CARGO DLC' },
    SAT: { game: 'ETS 2', detail: 'MAP DLC' },
    SUN: { game: 'ETS 2 (TMP)', detail: 'MAP DLC' },
  },
  '22:00': {
    MON: { game: 'ETS 2', detail: 'MAP DLC' },
    TUE: { game: 'ETS 2', detail: 'BASE MAP' },
    WED: { game: 'ETS 2 (TMP)', detail: 'MAP DLC' },
    THU: { game: 'ETS 2', detail: 'CARGO DLC' },
    FRI: { game: 'ETS 2', detail: 'BASE MAP' },
    SAT: { game: 'ETS 2 (TMP)', detail: 'BASE MAP' },
    SUN: { game: 'ATS', detail: 'BASE MAP' },
  }
};

export default function ConvoySchedule({ planner, activeSlot, onSelectSlot }) {
  const { toggleConvoyReminder, reminders } = useAuth();
  const pdfUrl = planner?.pdfUrl || '/GTC-Convoys-Planner.pdf';
  
  const todayShort = React.useMemo(() => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[new Date().getDay()];
  }, []);

  const [selectedMobileDay, setSelectedMobileDay] = useState(activeSlot?.day || todayShort || 'WED');
  const [mobileViewMode, setMobileViewMode] = useState('cards'); // 'cards' | 'table'

  const activeSchedule = planner?.grid || planner?.scheduleData || SCHEDULE_DATA;

  return (
    <section id="schedule" className="py-4">
      <div className="container">
        
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <div>
            <h2 className="h4 fw-extrabold text-dark mb-0" style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)' }}>
              Official Convoy Timetable
            </h2>
            <span className="small text-secondary">
              Official 21-run weekly schedule in Kenyan Time (EAT, UTC+3) and UTC.
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileViewMode(mobileViewMode === 'cards' ? 'table' : 'cards')}
              className="btn btn-sm btn-outline-primary d-md-none fw-bold"
              style={{ fontSize: '0.78rem' }}
            >
              <i className={`bi ${mobileViewMode === 'cards' ? 'bi-table' : 'bi-grid-fill'} me-1`}></i>
              {mobileViewMode === 'cards' ? 'Full Table Grid' : 'Mobile Cards'}
            </button>
            <a
              href={pdfUrl}
              download="GTC-Convoys-Planner.pdf"
              className="btn btn-sm btn-outline-secondary fw-bold"
              style={{ fontSize: '0.78rem' }}
            >
              <i className="bi bi-download me-1"></i> PDF
            </a>
          </div>
        </div>

        {/* Mobile-Adaptive Day Selector & Cards (Active on screens < 768px in 'cards' mode) */}
        {mobileViewMode === 'cards' && (
          <div className="d-md-none mb-4">
            <div className="d-flex align-items-center gap-1 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: 'none' }}>
              {DAYS.map((day) => {
                const isSelected = selectedMobileDay === day;
                const isToday = todayShort === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedMobileDay(day)}
                    className={`btn btn-sm text-nowrap flex-shrink-0 fw-bold px-3 py-1.5 rounded-2 ${isSelected ? 'btn-primary shadow-sm' : 'btn-light border'}`}
                    style={isSelected ? { backgroundColor: '#0284c7', borderColor: '#0284c7', fontSize: '0.8rem' } : { fontSize: '0.8rem', borderColor: '#e2e8f0' }}
                  >
                    {day} {isToday && <span className="badge bg-warning text-dark ms-1" style={{ fontSize: '0.6rem' }}>TODAY</span>}
                  </button>
                );
              })}
            </div>

            <div className="d-flex flex-column gap-2">
              {['18:00', '20:00', '22:00'].map((time) => {
                const cell = activeSchedule?.[time]?.[selectedMobileDay];
                if (!cell) return null;
                const eatHour = parseInt(time.split(':')[0], 10);
                const utcHour = (eatHour - 3 + 24) % 24;
                const eatTime = `${time} EAT`;
                const utcTime = `${String(utcHour).padStart(2, '0')}:00 UTC`;
                const reminderKey = `${selectedMobileDay}-${time}-${cell.game}`;
                const isReminded = reminders?.includes(reminderKey);
                const isCurrentSlot = activeSlot?.day === selectedMobileDay && activeSlot?.time === time;

                return (
                  <div
                    key={time}
                    className="card p-3 shadow-sm border"
                    style={{
                      borderRadius: '10px',
                      borderColor: isCurrentSlot ? '#0284c7' : '#e2e8f0',
                      backgroundColor: isCurrentSlot ? '#f0f9ff' : '#ffffff'
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-primary text-white fw-bold px-2 py-1" style={{ fontSize: '0.75rem' }}>
                          {eatTime}
                        </span>
                        <span className="text-secondary small fw-medium">
                          ({utcTime})
                        </span>
                      </div>
                      {isCurrentSlot && (
                        <span className="badge bg-warning text-dark fw-bold" style={{ fontSize: '0.65rem' }}>
                          ★ ACTIVE NEXT
                        </span>
                      )}
                    </div>

                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div>
                        <h5 className="fw-extrabold text-dark mb-0 fs-6">
                          {cell.game}
                        </h5>
                        <span className="badge px-2 py-0.5 mt-1" style={{ backgroundColor: '#e2e8f0', color: '#334155', fontSize: '0.72rem' }}>
                          {cell.detail}
                        </span>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 pt-2 border-top" style={{ borderColor: '#e2e8f0' }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectSlot) {
                            onSelectSlot({ day: selectedMobileDay, time, ...cell });
                          }
                        }}
                        className="btn btn-sm btn-outline-primary flex-grow-1 fw-bold py-1.5"
                        style={{ fontSize: '0.78rem' }}
                      >
                        <i className="bi bi-eye-fill me-1"></i> View Briefing
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleConvoyReminder(reminderKey, `${cell.game}: ${cell.detail}`, time)}
                        className={`btn btn-sm ${isReminded ? 'btn-success' : 'btn-light border'} fw-bold px-3 py-1.5`}
                        style={{ fontSize: '0.78rem' }}
                        title="Toggle reminder"
                      >
                        <i className={`bi ${isReminded ? 'bi-check-circle-fill' : 'bi-bell'} me-1`}></i>
                        {isReminded ? 'Set' : 'Remind'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className={`card shadow-sm overflow-hidden mb-4 ${mobileViewMode === 'cards' ? 'd-none d-md-block' : 'd-block'}`} style={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}>
          
          <div
            className="px-4 py-3 d-flex flex-wrap align-items-center justify-content-between gap-2"
            style={{ backgroundColor: '#0d426a', color: '#ffffff' }}
          >
            <div className="fs-5 fw-extrabold text-uppercase text-center text-md-start flex-grow-1" style={{ letterSpacing: '2.5px' }}>
              GTC CONVOYS PLANNER
            </div>
            <div className="text-uppercase small fw-bold text-end" style={{ opacity: 0.95, letterSpacing: '1px' }}>
              <span className="badge bg-warning text-dark me-2">KENYAN TIME (EAT - UTC+3)</span>
              YEAR: 2026
            </div>
          </div>

          <div className="table-responsive">
            <table
              className="table table-bordered mb-0 text-center align-middle"
              style={{
                borderColor: '#e2e8f0',
                minWidth: '780px',
                tableLayout: 'fixed'
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      backgroundColor: '#cb9858',
                      color: '#ffffff',
                      width: '125px',
                      padding: '12px 6px',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                      borderRight: '1px solid #e2e8f0'
                    }}
                  >
                    TIME (EAT / UTC)
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      style={{
                        backgroundColor: '#588da9',
                        color: '#ffffff',
                        padding: '12px 6px',
                        fontWeight: 800,
                        letterSpacing: '1px',
                        borderRight: '1px solid #e2e8f0'
                      }}
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((time) => {
                  const activeSchedule = planner?.grid || planner?.scheduleData || SCHEDULE_DATA;
                  const rowData = activeSchedule ? activeSchedule[time] : null;
                  const eatHour = parseInt(time.split(':')[0], 10);
                  const utcHour = (eatHour - 3 + 24) % 24;
                  const eatTime = `${time} EAT`;
                  const utcTime = `${String(utcHour).padStart(2, '0')}:00 UTC`;

                  return (
                    <tr key={time}>
                      
                      <td
                        style={{
                          backgroundColor: '#ffffff',
                          padding: '10px 6px',
                          borderRight: '1px solid #e2e8f0'
                        }}
                      >
                        <div className="fw-bolder" style={{ color: '#0284c7', fontSize: '0.92rem' }}>
                          {eatTime}
                        </div>
                        <div className="text-secondary small" style={{ fontSize: '0.72rem' }}>
                          {utcTime}
                        </div>
                      </td>

                      {DAYS.map((day) => {
                        const cell = rowData ? rowData[day] : null;

                        if (!cell) {
                          return (
                            <td
                              key={day}
                              style={{
                                backgroundColor: '#ffffff',
                                height: '54px',
                                padding: '8px 4px',
                                borderRight: '1px solid #e2e8f0'
                              }}
                            ></td>
                          );
                        }

                        const reminderKey = `${day}-${time}-${cell.game}`;
                        const isReminded = reminders?.includes(reminderKey);
                        const isCurrentSlot = activeSlot?.day === day && activeSlot?.time === time;

                        return (
                          <td
                            key={day}
                            onClick={() => {
                              if (onSelectSlot) {
                                onSelectSlot({ day, time, ...cell });
                              } else {
                                toggleConvoyReminder(reminderKey, `${cell.game}: ${cell.detail}`, time);
                              }
                            }}
                            title="Click to feature in convoy card &amp; toggle reminder"
                            style={{
                              backgroundColor: isCurrentSlot ? '#e0f2fe' : (isReminded ? '#f0fdf4' : '#ffffff'),
                              padding: '8px 4px',
                              cursor: 'pointer',
                              borderRight: '1px solid #e2e8f0',
                              border: isCurrentSlot ? '2px solid #0284c7' : undefined,
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {isCurrentSlot && (
                              <div className="mb-1">
                                <span className="badge bg-primary text-white text-uppercase" style={{ fontSize: '0.58rem', letterSpacing: '0.3px', padding: '2px 4px' }}>
                                  ★ ACTIVE NEXT
                                </span>
                              </div>
                            )}
                            <div className="fw-bolder text-dark lh-sm" style={{ fontSize: '0.82rem', letterSpacing: '0.3px' }}>
                              {cell.game}
                            </div>
                            <div className="fw-bold text-dark lh-sm mt-1" style={{ fontSize: '0.74rem', letterSpacing: '0.3px' }}>
                              {cell.detail}
                            </div>
                            <div className="mt-1" style={{ fontSize: '0.66rem' }}>
                              <span className={isReminded ? 'text-success fw-bold' : 'text-muted'}>
                                <i className={`bi ${isReminded ? 'bi-bell-fill text-success' : 'bi-bell'} me-1`}></i>
                                {isReminded ? 'Reminder Set' : 'Remind'}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
