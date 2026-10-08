'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';

export default function CommunityStats({ onOpenLogHaulModal }) {
  const { user, allDrivers } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [remoteSignups, setRemoteSignups] = useState([]);

  React.useEffect(() => {
    async function loadSignups() {
      try {
        const res = await fetch('/api/signup', { cache: 'no-store' });
        const json = await res.json();
        if (json?.success && Array.isArray(json.signups)) {
          setRemoteSignups(json.signups);
        }
      } catch (e) {}
    }
    loadSignups();
  }, []);

  const mergedDrivers = React.useMemo(() => {
    const list = [...(allDrivers || [])];
    const existingIds = new Set(list.map((d) => d.id));

    remoteSignups.forEach((s) => {
      if (!existingIds.has(s.id)) {
        list.push({
          id: s.id,
          name: s.name,
          role: s.driver_type === 'Official Streamer' ? 'streamer' : (s.role || 'driver'),
          roles: s.roles || (s.role ? [s.role] : [s.driver_type === 'Official Streamer' ? 'streamer' : 'driver']),
          country: s.country || 'International',
          vtc: s.vtc || 'Independent Solo Driver',
          truck: s.truck_brand || 'Scania',
          kms: Number(s.kms) || 0,
          deliveries: Number(s.deliveries) || 0,
          avatar: s.avatar || null
        });
        existingIds.add(s.id);
      }
    });

    return list;
  }, [allDrivers, remoteSignups]);

  const countryStats = React.useMemo(() => {
    const map = {};
    mergedDrivers.forEach((d) => {
      const cName = d.country?.trim() || 'International';
      if (!map[cName]) {
        map[cName] = { name: cName, count: 0, members: [] };
      }
      map[cName].count += 1;
      map[cName].members.push(d);
    });

    return Object.values(map).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [mergedDrivers]);

  const totalMembers = mergedDrivers.length;
  const countriesRepresented = countryStats.length;
  const staffOnline = mergedDrivers.filter((d) => {
    const roles = d.roles && d.roles.length > 0 ? d.roles : [d.role || 'driver'];
    return roles.some((r) => ['admin', 'staff', 'convoy_lead', 'dispatcher', 'dev_modder'].includes(r));
  }).length;
  const driversOnline = mergedDrivers.filter((d) => {
    const roles = d.roles && d.roles.length > 0 ? d.roles : [d.role || 'driver'];
    return roles.includes('driver') || roles.includes('streamer') || !roles.length;
  }).length;
  const kmsCovered = mergedDrivers.reduce((acc, d) => acc + (Number(d.kms) || 0), 0);
  const deliveriesCompleted = mergedDrivers.reduce((acc, d) => acc + (Number(d.deliveries) || 0), 0);

  const selectedCountryData = selectedCountry
    ? countryStats.find((c) => c.name === selectedCountry)
    : null;

  const [recentHauls, setRecentHauls] = React.useState([]);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('gtc_community_hauls');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentHauls(parsed.slice(0, 5));
        }
      }
    } catch (e) {}
  }, []);

  return (
    <section id="stats" className="py-4">
      <div className="container">

        <div className="text-center mb-4">
          <span className="badge badge-gold text-uppercase fw-bold px-3 py-2 mb-2">
            <i className="bi bi-broadcast me-1"></i> Live Telemetry &amp; Fleet Data
          </span>
          <h2 className="display-6 fw-extrabold text-dark mb-1">Global Community Statistics</h2>
          <p className="text-secondary mx-auto mb-0" style={{ maxWidth: '650px' }}>
            Live verified activity across all servers, member presence across nations and collective fleet mileage computed directly from active driver licenses.
          </p>
        </div>

        <div className="row g-3 mb-4">

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card glass p-4 h-100 shadow-sm">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <i className="bi bi-globe2 fs-2 text-warning"></i>
                <span className="badge badge-gold small">Worldwide</span>
              </div>
              <div className="fs-2 fw-bold text-dark mb-0">
                {countriesRepresented}
              </div>
              <div className="fw-semibold text-dark small mb-1">Countries Represented</div>
              <div className="text-secondary small" style={{ fontSize: '0.78rem' }}>Haulers across active nations</div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card glass p-4 h-100 shadow-sm">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <i className="bi bi-truck fs-2 text-success"></i>
                <span className="badge bg-success-subtle text-success small d-flex align-items-center gap-1 rounded-1">
                  Live Now
                </span>
              </div>
              <div className="fs-2 fw-bold text-dark mb-0">
                {driversOnline}
              </div>
              <div className="fw-semibold text-dark small mb-1">Drivers Online</div>
              <div className="text-secondary small" style={{ fontSize: '0.78rem' }}>Active on TMP &amp; SCS Convoy</div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card glass p-4 h-100 shadow-sm">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <i className="bi bi-shield-fill-check fs-2 text-danger"></i>
                <span className="badge bg-danger-subtle text-danger small">On Radio</span>
              </div>
              <div className="fs-2 fw-bold text-dark mb-0">
                {staffOnline}
              </div>
              <div className="fw-semibold text-dark small mb-1">Staff Online</div>
              <div className="text-secondary small" style={{ fontSize: '0.78rem' }}>Convoy Leads &amp; Monitors</div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card glass p-4 h-100 shadow-sm">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <i className="bi bi-people-fill fs-2 text-primary"></i>
                <span className="badge bg-primary-subtle text-primary small">Registered</span>
              </div>
              <div className="fs-2 fw-bold text-dark mb-0">
                {totalMembers}
              </div>
              <div className="fw-semibold text-dark small mb-1">Total Members</div>
              <div className="text-secondary small" style={{ fontSize: '0.78rem' }}>VTC &amp; Solo drivers</div>
            </div>
          </div>
        </div>

        <div className="card glass p-4 mb-4">
          <div className="row align-items-center g-4">
            <div className="col-12 col-md-4">
              <span className="small text-uppercase fw-bold d-block mb-1" style={{ color: '#0284c7' }}>
                <i className="bi bi-speedometer2 me-1"></i> Collective Fleet Distance
              </span>
              <div className="fs-2 fw-extrabold text-dark">
                {kmsCovered.toLocaleString()} <span className="fs-6 text-secondary fw-normal">KM</span>
              </div>
              <span className="text-secondary small">Driven across European &amp; American routes</span>
            </div>

            <div className="col-12 col-md-4">
              <span className="small text-success text-uppercase fw-bold d-block mb-1">
                <i className="bi bi-box-seam-fill me-1"></i> Deliveries Completed
              </span>
              <div className="fs-2 fw-extrabold text-dark">
                {deliveriesCompleted.toLocaleString()} <span className="fs-6 text-secondary fw-normal">Jobs</span>
              </div>
              <span className="text-secondary small">Cargo safely delivered to destination</span>
            </div>

            <div className="col-12 col-md-4 text-md-end">
              <button
                onClick={onOpenLogHaulModal}
                className="btn btn-warning w-100 w-md-auto fw-bold"
              >
                <i className="bi bi-clipboard-plus me-1"></i> Log Your Delivery
              </button>
              <div className="small text-secondary mt-1">
                Add completed km to your driver license
              </div>
            </div>
          </div>
        </div>

        <div className="card glass p-4 mb-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div>
              <h4 className="fw-bold text-dark fs-5 mb-0">
                <i className="bi bi-globe me-2 text-warning"></i> Member Nations
              </h4>
              <p className="text-secondary small mb-0">Member presence by nationality &bull; Real count of registered community drivers</p>
            </div>
            {selectedCountry && (
              <button
                onClick={() => setSelectedCountry(null)}
                className="btn btn-sm btn-outline-warning"
              >
                Clear Selection
              </button>
            )}
          </div>

          <div className="d-flex flex-wrap gap-2">
            {countryStats.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelectedCountry(selectedCountry === c.name ? null : c.name)}
                className={`btn btn-sm ${selectedCountry === c.name ? 'btn-warning shadow-sm' : 'btn-outline-secondary'} d-flex align-items-center gap-2`}
              >
                <i className="bi bi-geo-alt-fill text-warning"></i>
                <span className="fw-semibold">{c.name}</span>
                <span className="badge badge-gold">{c.count}</span>
              </button>
            ))}
          </div>

          {selectedCountryData && (
            <div className="mt-3 p-3 rounded-2 bg-light border shadow-sm" style={{ borderColor: '#e2e8f0' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small text-secondary fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                  <i className="bi bi-people-fill text-primary me-1"></i> Drivers Registered from {selectedCountryData.name} ({selectedCountryData.count}):
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-link p-0 text-secondary text-decoration-none small"
                  onClick={() => setSelectedCountry(null)}
                >
                  <i className="bi bi-x-circle"></i>
                </button>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {selectedCountryData.members.map((m) => (
                  <div key={m.id} className="badge bg-white text-dark border p-2 d-flex align-items-center gap-2 shadow-sm">
                    {m.avatar ? (
                      <img src={m.avatar} alt={m.name} className="rounded-circle object-fit-cover" style={{ width: '20px', height: '20px' }} />
                    ) : (
                      <i className="bi bi-person-fill text-primary"></i>
                    )}
                    <strong style={{ color: '#0284c7' }}>{m.name}</strong>
                    <span className="text-secondary small">({m.truck || 'Scania'})</span>
                    <span className="badge bg-light text-secondary border small">{m.id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="row g-4">

          <div className="col-12 col-lg-6">
            <div className="card glass p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                <span className="fw-bold text-dark small">
                  <i className="bi bi-speedometer2 text-warning me-2"></i> Verified Driver Hauls
                </span>
                <span className="badge bg-light border text-secondary small">Authentic Telemetry</span>
              </div>

              {recentHauls.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {recentHauls.map((h) => (
                    <div key={h.id} className="p-2 rounded-2 bg-light border d-flex align-items-center justify-content-between">
                      <div>
                        <div className="fw-bold text-dark small">
                          {h.driver} <span className="badge badge-gold ms-1" style={{ fontSize: '0.68rem' }}>{h.role}</span>
                        </div>
                        <div className="small text-secondary">
                          {h.route} &bull; <strong className="text-dark">{h.cargo}</strong> ({h.game})
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold small" style={{ color: '#0284c7' }}>+{h.kms} km</div>
                        <div className="text-secondary" style={{ fontSize: '0.72rem' }}>{h.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-secondary">
                  <i className="bi bi-clock-history fs-3 d-block mb-2 text-muted"></i>
                  <p className="small mb-1 fw-bold text-dark">No delivery logs submitted yet</p>
                  <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                    Drivers log authenticated deliveries from the Driver Portal to publish certified runs here.
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card glass p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                  <span className="fw-bold text-dark small">
                    <i className="bi bi-person-badge-fill text-warning me-2"></i> Your Driver Telemetry
                  </span>
                  <span className="small fw-bold" style={{ color: '#0284c7' }}>
                    {user ? user.licenseNumber : 'Guest Hauler'}
                  </span>
                </div>

                {user ? (
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-3 text-white d-flex align-items-center justify-content-center p-3 fs-3" style={{ backgroundColor: '#0284c7' }}>
                        <i className="bi bi-truck"></i>
                      </div>
                      <div>
                        <div className="fs-5 fw-bold text-dark">{user.name}</div>
                        <div className="text-secondary small">
                          VTC: <strong className="text-dark">{user.vtc}</strong> &bull; Truck: <strong className="text-dark">{user.truck}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="row g-2 text-center p-2 rounded-3 bg-light border">
                      <div className="col-6">
                        <span className="text-secondary small text-uppercase fw-bold d-block">Personal Mileage</span>
                        <div className="fs-4 fw-bold" style={{ color: '#0284c7' }}>
                          {(user.kms || 0).toLocaleString()} <span className="fs-6 text-secondary">KM</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <span className="text-secondary small text-uppercase fw-bold d-block">Jobs Logged</span>
                        <div className="fs-4 fw-bold text-success">
                          {user.deliveries || 0} <span className="fs-6 text-secondary">Deliveries</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-secondary small my-3">
                    Sign in or register your driver callsign to track your personal kilometers, deliveries, and rank in the GTC community.
                  </p>
                )}
              </div>

              <div className="pt-3">
                <button
                  onClick={onOpenLogHaulModal}
                  className="btn btn-warning w-100 fw-bold"
                >
                  <i className="bi bi-plus-circle me-1"></i> Log a Completed Delivery Haul
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
