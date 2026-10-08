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

  return (
    <section id="schedule" className="py-4">
      <div className="container">
        
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <div>
            <h2 className="h4 fw-extrabold text-dark mb-0">Official Convoy Timetable</h2>
            <span className="small text-secondary">
              Official weekly schedule reproduced directly from the GTC Convoys Planner in Kenyan Time (EAT, UTC+3) and UTC.
            </span>
          </div>

          <a
            href={pdfUrl}
            download="GTC-Convoys-Planner.pdf"
            className="btn btn-sm btn-outline-secondary fw-bold"
          >
            <i className="bi bi-download me-1"></i> Download PDF
          </a>
        </div>

        <div className="card shadow-sm overflow-hidden mb-4" style={{ border: '1.5px solid #0284c7', borderRadius: '10px' }}>
          
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
                borderColor: '#cbdfe9',
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
                      borderRight: '1px solid #cbdfe9'
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
                        borderRight: '1px solid #cbdfe9'
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
                          borderRight: '1px solid #cbdfe9'
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
                                borderRight: '1px solid #cbdfe9'
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
                              borderRight: '1px solid #cbdfe9',
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
