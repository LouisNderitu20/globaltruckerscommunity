'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DriverAccountModal from '@/components/DriverAccountModal';
import { DEFAULT_CONFIG } from '@/lib/defaultConfig';
import { useAuth, ROLE_INFO } from '@/lib/authContext';

export default function StatsPage() {
  const { allDrivers } = useAuth();
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('kms');
  const [sortOrder, setSortOrder] = useState('desc');
  const [remoteSignups, setRemoteSignups] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountModalTab, setAccountModalTab] = useState('profile');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/content', { cache: 'no-store' });
        const json = await res.json();
        if (json?.success && json?.data) {
          setConfig({
            ...DEFAULT_CONFIG,
            ...json.data,
            stats: { ...DEFAULT_CONFIG.stats, ...(json.data.stats || {}) }
          });
        }
      } catch (e) {}

      try {
        const sRes = await fetch('/api/signup', { cache: 'no-store' });
        const sJson = await sRes.json();
        if (sJson?.success && Array.isArray(sJson.signups)) {
          setRemoteSignups(sJson.signups);
        }
      } catch (e) {}
    }
    loadData();
  }, []);

  const mergedDrivers = React.useMemo(() => {
    const list = [...(allDrivers || [])];
    const existingIds = new Set(list.map((d) => d.id));

    remoteSignups.forEach((s) => {
      if (!existingIds.has(s.id)) {
        list.push({
          id: s.id,
          name: s.name,
          role: s.role || (s.driver_type === 'Official Streamer' ? 'streamer' : 'driver'),
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

  const liveTotalMembers = mergedDrivers.length;
  const liveDriversOnline = React.useMemo(() => {
    return mergedDrivers.filter((d) => {
      const roles = d.roles && d.roles.length > 0 ? d.roles : [d.role || 'driver'];
      return roles.includes('driver') || roles.includes('streamer') || !roles.length;
    }).length;
  }, [mergedDrivers]);
  const liveTotalKms = React.useMemo(() => {
    return mergedDrivers.reduce((acc, d) => acc + (Number(d.kms) || 0), 0);
  }, [mergedDrivers]);
  const liveTotalDeliveries = React.useMemo(() => {
    return mergedDrivers.reduce((acc, d) => acc + (Number(d.deliveries) || 0), 0);
  }, [mergedDrivers]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredDrivers = mergedDrivers
    .filter((d) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        d.name?.toLowerCase().includes(q) ||
        (d.country && d.country.toLowerCase().includes(q)) ||
        (d.vtc && d.vtc.toLowerCase().includes(q)) ||
        (d.truck && d.truck.toLowerCase().includes(q)) ||
        (d.id && d.id.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'deliveries') {
        comparison = (Number(b.deliveries) || 0) - (Number(a.deliveries) || 0);
      } else if (sortBy === 'kms') {
        comparison = (Number(b.kms) || 0) - (Number(a.kms) || 0);
      } else if (sortBy === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (sortBy === 'vtc') {
        comparison = (a.vtc || '').localeCompare(b.vtc || '');
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });

  return (
    <div className="min-vh-100" style={{ background: '#f8fafc' }}>
      <Navbar
        onOpenAccountModal={() => {
          setAccountModalTab('profile');
          setIsAccountModalOpen(true);
        }}
        onOpenNotifModal={() => {
          setAccountModalTab('notifications');
          setIsAccountModalOpen(true);
        }}
      />

      <div className="container py-4">
        
        <div className="text-center mb-4">
          <span className="badge badge-gold text-uppercase fw-bold px-3 py-2 mb-2">
            <i className="bi bi-speedometer2 me-1"></i> Fleet Telemetry Hub
          </span>
          <h1 className="display-6 fw-extrabold text-dark mb-2">Driver Roster &amp; Distance Leaderboard</h1>
          <p className="text-secondary mx-auto mb-0" style={{ maxWidth: '650px' }}>
            Official registered driver telemetry across European motorways and American interstates.
          </p>
        </div>

        <div className="row g-3 g-md-4 mb-4">
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card glass p-4 h-100 shadow-sm" style={{ borderColor: '#0284c7' }}>
              <div className="fs-3 fw-bold text-dark mb-1">
                {liveTotalMembers.toLocaleString()}
              </div>
              <div className="text-secondary small fw-semibold">Registered Fleet Members</div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card glass p-4 h-100 shadow-sm" style={{ borderColor: '#0284c7' }}>
              <div className="fs-3 fw-bold text-dark mb-1">
                {liveDriversOnline.toLocaleString()}
              </div>
              <div className="text-secondary small fw-semibold">Drivers Online Now</div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card glass p-4 h-100 shadow-sm" style={{ borderColor: '#0284c7' }}>
              <div className="fs-3 fw-bold mb-1" style={{ color: '#0284c7' }}>
                {liveTotalKms.toLocaleString()} <span className="fs-6 text-secondary">km</span>
              </div>
              <div className="text-secondary small fw-semibold">Total Fleet Distance</div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card glass p-4 h-100 shadow-sm" style={{ borderColor: '#0284c7' }}>
              <div className="fs-3 fw-bold text-dark mb-1">
                {liveTotalDeliveries.toLocaleString()}
              </div>
              <div className="text-secondary small fw-semibold">Deliveries Logged</div>
            </div>
          </div>
        </div>

        <div className="card glass p-3 mb-4 shadow-sm">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="input-group" style={{ maxWidth: '340px' }}>
              <span className="input-group-text"><i className="bi bi-search"></i></span>
              <input
                type="text"
                placeholder="Search driver callsign, country, or VTC..."
                className="form-control"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="small text-secondary fw-semibold">Sort By:</span>
              <div className="btn-group" role="group">
                <button
                  type="button"
                  onClick={() => handleSort('kms')}
                  className={`btn btn-sm ${sortBy === 'kms' ? 'btn-primary' : 'btn-outline-secondary'} fw-bold`}
                >
                  <i className="bi bi-speedometer2 me-1"></i> Distance {sortBy === 'kms' && (sortOrder === 'desc' ? '▼' : '▲')}
                </button>
                <button
                  type="button"
                  onClick={() => handleSort('deliveries')}
                  className={`btn btn-sm ${sortBy === 'deliveries' ? 'btn-primary' : 'btn-outline-secondary'} fw-bold`}
                >
                  <i className="bi bi-box-seam me-1"></i> Deliveries {sortBy === 'deliveries' && (sortOrder === 'desc' ? '▼' : '▲')}
                </button>
                <button
                  type="button"
                  onClick={() => handleSort('name')}
                  className={`btn btn-sm ${sortBy === 'name' ? 'btn-primary' : 'btn-outline-secondary'} fw-bold`}
                >
                  <i className="bi bi-person me-1"></i> Callsign {sortBy === 'name' && (sortOrder === 'desc' ? '▼' : '▲')}
                </button>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-light border fw-bold text-secondary"
                onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                title="Toggle High-to-Low or Low-to-High"
              >
                {sortOrder === 'desc' ? (
                  <><i className="bi bi-sort-down me-1"></i> Descending</>
                ) : (
                  <><i className="bi bi-sort-up me-1"></i> Ascending</>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="card glass shadow-sm overflow-hidden mb-5">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="bg-light">
                <tr className="small text-uppercase text-secondary border-bottom user-select-none" style={{ borderColor: '#e2e8f0' }}>
                  <th scope="col" className="py-3 px-4" style={{ width: '80px' }}>Rank</th>
                  <th scope="col" className="py-3 px-4" style={{ cursor: 'pointer' }} onClick={() => handleSort('name')} title="Sort by Callsign">
                    Driver / Callsign {sortBy === 'name' && (sortOrder === 'desc' ? '▼' : '▲')}
                  </th>
                  <th scope="col" className="py-3 px-4" style={{ cursor: 'pointer' }} onClick={() => handleSort('vtc')} title="Sort by VTC">
                    VTC Affiliation {sortBy === 'vtc' && (sortOrder === 'desc' ? '▼' : '▲')}
                  </th>
                  <th scope="col" className="py-3 px-4" style={{ cursor: 'pointer' }} onClick={() => handleSort('kms')} title="Sort by Distance">
                    Personal Mileage {sortBy === 'kms' && (sortOrder === 'desc' ? '▼' : '▲')}
                  </th>
                  <th scope="col" className="py-3 px-4 text-end" style={{ cursor: 'pointer' }} onClick={() => handleSort('deliveries')} title="Sort by Deliveries">
                    Deliveries {sortBy === 'deliveries' && (sortOrder === 'desc' ? '▼' : '▲')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((driver, index) => {
                  return (
                    <tr
                      key={driver.id || index}
                      onClick={() => setSelectedDriver(driver)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="py-3 px-4 fw-bold">
                        <span className={`badge ${index === 0 ? 'badge-gold' : index === 1 ? 'badge-blue' : index === 2 ? 'badge-green' : 'bg-light text-dark border'}`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="d-flex align-items-center gap-2">
                          {driver.avatar ? (
                            <img
                              src={driver.avatar}
                              alt={driver.name}
                              className="rounded-circle object-fit-cover border shadow-sm"
                              style={{ width: '32px', height: '32px', borderColor: '#0284c7' }}
                            />
                          ) : (
                            <i className="bi bi-person-circle fs-5" style={{ color: '#0284c7' }}></i>
                          )}
                          <div>
                            <div className="fw-bold text-dark">{driver.name}</div>
                            <span className="small text-secondary">{driver.country}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="small text-secondary fw-semibold">{driver.vtc || 'Independent Solo'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="fw-bold small" style={{ color: '#0284c7' }}>
                          {(driver.kms || 0).toLocaleString()} km
                        </span>
                      </td>
                      <td className="py-3 px-4 text-end">
                        <span className="badge badge-green small">
                          {(driver.deliveries || 0).toLocaleString()} jobs
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {selectedDriver && (
          <div className="modal-backdrop-custom" onClick={() => setSelectedDriver(null)}>
            <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: 'rgba(2, 132, 199, 0.35)' }}>
                <h4 className="h5 fw-bold text-dark mb-0">
                  <i className="bi bi-person-badge text-warning me-2"></i> Driver Profile Dossier
                </h4>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedDriver(null)}
                  aria-label="Close"
                ></button>
              </div>

              <div className="p-4">
                <div className="driver-license-card">
                  <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom" style={{ borderColor: 'rgba(2, 132, 199, 0.35)' }}>
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-truck fs-4 text-warning"></i>
                      <div>
                        <div className="fw-extrabold text-dark small lh-1">GLOBAL TRUCKERS COMMUNITY</div>
                        <div className="fw-bold text-uppercase" style={{ fontSize: '0.65rem', color: '#0284c7' }}>
                          VERIFIED TELEMETRY RECORD
                        </div>
                      </div>
                    </div>
                    <i className="bi bi-patch-check-fill fs-5" style={{ color: '#0284c7' }}></i>
                  </div>

                  <div className="row g-3 align-items-center mb-3">
                    <div className="col-4 col-sm-3 text-center">
                      <div
                        className="rounded-2 border overflow-hidden mx-auto shadow-sm d-flex align-items-center justify-content-center"
                        style={{ width: '84px', height: '84px', backgroundColor: '#f8fafc', borderColor: '#0284c7' }}
                      >
                        {selectedDriver.avatar ? (
                          <img
                            src={selectedDriver.avatar}
                            alt={selectedDriver.name}
                            className="w-100 h-100 object-fit-cover"
                          />
                        ) : (
                          <i className="bi bi-person fs-1" style={{ color: '#0284c7' }}></i>
                        )}
                      </div>
                    </div>

                    <div className="col-8 col-sm-9">
                      <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                        <div className="h5 fw-extrabold text-dark mb-0">{selectedDriver.name}</div>
                        {((selectedDriver.roles && selectedDriver.roles.length > 0) ? selectedDriver.roles : [selectedDriver.role || 'driver']).map((rKey) => {
                          const rInfo = ROLE_INFO[rKey] || ROLE_INFO.driver;
                          return (
                            <span
                              key={rKey}
                              className={`badge ${rInfo.badgeClass} small`}
                              style={rInfo.style}
                            >
                              {rInfo.label}
                            </span>
                          );
                        })}
                      </div>
                      <div className="small fw-bold" style={{ color: '#0284c7' }}>VTC: {selectedDriver.vtc}</div>

                      <div className="small text-secondary mt-1">
                        <i className="bi bi-geo-alt me-1"></i> Nationality: <strong className="text-dark">{selectedDriver.country}</strong>
                      </div>
                      <div className="small text-secondary">
                        <i className="bi bi-truck me-1"></i> Rig: <strong className="text-dark">{selectedDriver.truck || 'Scania S730'}</strong>
                      </div>
                      <div className="small text-secondary">
                        <i className="bi bi-hdd-network me-1"></i> TMP ID: <strong className="text-dark">{selectedDriver.tmpId || 'TMP-None'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between pt-3 border-top small text-secondary" style={{ borderColor: '#e2e8f0' }}>
                    <div>
                      <span className="d-block text-uppercase" style={{ fontSize: '0.62rem' }}>Total Distance</span>
                      <strong className="fs-5" style={{ color: '#0284c7' }}>
                        {(selectedDriver.kms || 0).toLocaleString()} KM
                      </strong>
                    </div>

                    <div className="text-end">
                      <span className="d-block text-uppercase" style={{ fontSize: '0.62rem' }}>Deliveries Completed</span>
                      <strong className="text-success fs-5">
                        {selectedDriver.deliveries || 0}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer config={config} />

      <DriverAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        initialTab={accountModalTab}
      />
    </div>
  );
}
