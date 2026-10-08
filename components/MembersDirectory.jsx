'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, ROLE_INFO } from '@/lib/authContext';

export default function MembersDirectory() {
  const { allDrivers } = useAuth();
  const [remoteSignups, setRemoteSignups] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [directorySort, setDirectorySort] = useState('kms-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
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
          role: s.role || (s.driver_type === 'Official Streamer' ? 'streamer' : 'driver'),
          roles: Array.isArray(s.roles) && s.roles.length > 0 ? s.roles : [s.role || (s.driver_type === 'Official Streamer' ? 'streamer' : 'driver')],
          country: s.country || 'Kenya',
          vtc: s.vtc || s.driver_type || 'Independent Solo Driver',
          truck: s.truck_brand || 'Scania S730 V8',
          kms: Number(s.kms) || 0,
          deliveries: Number(s.deliveries) || 0,
          avatar: s.avatar || null,
          licenseNumber: s.license_number || s.licenseNumber,
          joinedAt: s.joined_at || s.joinedAt,
          stream: s.stream_url || s.stream,
          tmp: s.truckers_mp_id || s.tmp,
          isStreamer: Boolean(s.stream_url) || s.role === 'streamer' || (Array.isArray(s.roles) && s.roles.includes('streamer'))
        });
        existingIds.add(s.id);
      }
    });

    return list;
  }, [allDrivers, remoteSignups]);

  const filtered = mergedDrivers
    .filter((d) => {
      const term = search.toLowerCase().trim();
      const matchSearch =
        !term ||
        d.name?.toLowerCase().includes(term) ||
        d.vtc?.toLowerCase().includes(term) ||
        d.country?.toLowerCase().includes(term) ||
        d.truck?.toLowerCase().includes(term) ||
        d.id?.toLowerCase().includes(term);

      const driverRoles = Array.isArray(d.roles) && d.roles.length > 0 ? d.roles : [d.role || 'driver'];
      const matchRole =
        roleFilter === 'ALL' ||
        (roleFilter === 'streamer' && (driverRoles.includes('streamer') || d.isStreamer)) ||
        (roleFilter === 'dev_modder' && (driverRoles.includes('dev_modder') || d.isDevModder)) ||
        (roleFilter === 'convoy_lead' && driverRoles.includes('convoy_lead')) ||
        (roleFilter === 'staff' && (driverRoles.includes('staff') || driverRoles.includes('admin'))) ||
        (roleFilter === 'driver' && driverRoles.includes('driver'));

      return matchSearch && matchRole;
    })
    .sort((a, b) => {
      if (directorySort === 'newest') {
        const idA = parseInt(String(a.id || '').replace(/\D/g, ''), 10) || 0;
        const idB = parseInt(String(b.id || '').replace(/\D/g, ''), 10) || 0;
        return idB - idA;
      }
      if (directorySort === 'kms-desc') {
        const diff = (Number(b.kms) || 0) - (Number(a.kms) || 0);
        if (diff !== 0) return diff;
        const idA = parseInt(String(a.id || '').replace(/\D/g, ''), 10) || 0;
        const idB = parseInt(String(b.id || '').replace(/\D/g, ''), 10) || 0;
        return idB - idA;
      }
      if (directorySort === 'kms-asc') return (Number(a.kms) || 0) - (Number(b.kms) || 0);
      if (directorySort === 'jobs-desc') return (Number(b.deliveries) || 0) - (Number(a.deliveries) || 0);
      if (directorySort === 'jobs-asc') return (Number(a.deliveries) || 0) - (Number(b.deliveries) || 0);
      if (directorySort === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      if (directorySort === 'name-desc') return (b.name || '').localeCompare(a.name || '');
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const currentItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleRoleChange = (role) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  return (
    <section id="members" className="py-5" style={{ backgroundColor: '#ffffff' }}>
      <div className="container">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
          <div>
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1 mb-2 rounded-1 fw-bold text-uppercase" style={{ backgroundColor: 'rgba(2, 132, 199, 0.08)', color: '#0284c7', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              <i className="bi bi-people-fill"></i> Community Roster
            </div>
            <h2 className="display-6 fw-bold text-dark mb-1">
              Active Drivers &amp; Members Directory
            </h2>
            <p className="text-secondary small mb-0" style={{ maxWidth: '600px' }}>
              Search certified truckers, dispatchers, streamers, and modders across our global virtual fleet.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap" style={{ minWidth: '280px' }}>
            <div className="input-group shadow-sm flex-grow-1" style={{ minWidth: '200px' }}>
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search callsign, VTC, country..."
                value={search}
                onChange={handleSearchChange}
              />
              {search && (
                <button
                  className="btn btn-outline-secondary border-start-0 bg-white"
                  type="button"
                  onClick={() => setSearch('')}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>

            <select
              className="form-select form-select-sm w-auto fw-bold shadow-sm"
              value={directorySort}
              onChange={(e) => {
                setDirectorySort(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="newest">Newest Members First</option>
              <option value="kms-desc">Distance: High to Low</option>
              <option value="kms-asc">Distance: Low to High</option>
              <option value="jobs-desc">Jobs: High to Low</option>
              <option value="jobs-asc">Jobs: Low to High</option>
              <option value="name-asc">Callsign: A to Z</option>
              <option value="name-desc">Callsign: Z to A</option>
            </select>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-4 pb-2 border-bottom">
          {[
            { key: 'ALL', label: `All (${mergedDrivers.length})` },
            { key: 'driver', label: 'Drivers' },
            { key: 'streamer', label: 'Streamers' },
            { key: 'dev_modder', label: 'Dev | Modder' },
            { key: 'convoy_lead', label: 'Convoy Leads' },
            { key: 'staff', label: 'Staff & Admin' }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleRoleChange(tab.key)}
              className={`btn btn-sm fw-bold ${roleFilter === tab.key ? 'btn-primary' : 'btn-outline-secondary'}`}
              style={roleFilter === tab.key ? { backgroundColor: '#0284c7', borderColor: '#0284c7' } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {currentItems.length === 0 ? (
          <div className="p-5 text-center text-secondary bg-light rounded-2 border">
            <i className="bi bi-person-x display-6 text-muted mb-2 d-block"></i>
            <h5 className="fw-bold">No drivers found</h5>
            <p className="small mb-0">Try adjusting your search criteria or role filters.</p>
          </div>
        ) : (
          <div className="row g-3">
            {currentItems.map((driver) => {
              const roleMeta = ROLE_INFO[driver.role] || ROLE_INFO.driver;
              return (
                <div key={driver.id} className="col-12 col-md-6 col-lg-4">
                  <div className="card h-100 border p-3 bg-light shadow-sm d-flex flex-column justify-content-between rounded-2">
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                          {driver.avatar ? (
                            <img
                              src={driver.avatar}
                              alt={driver.name}
                              className="rounded-circle object-fit-cover border"
                              style={{ width: '40px', height: '40px' }}
                            />
                          ) : (
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                              style={{ width: '40px', height: '40px', backgroundColor: '#0284c7', fontSize: '0.85rem' }}
                            >
                              {driver.name ? driver.name.slice(0, 2).toUpperCase() : 'DR'}
                            </div>
                          )}
                          <div>
                            <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '140px' }}>
                              {driver.name}
                            </div>
                            <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                              {driver.id}
                            </div>
                          </div>
                        </div>

                        <div className="d-flex flex-wrap gap-1 justify-content-end" style={{ maxWidth: '140px' }}>
                          {((driver.roles && driver.roles.length > 0) ? driver.roles : [driver.role || 'driver']).map((rKey) => {
                            const rMeta = ROLE_INFO[rKey] || ROLE_INFO.driver;
                            return (
                              <span
                                key={rKey}
                                className="badge text-white fw-bold text-uppercase"
                                style={{
                                  backgroundColor: rMeta.color,
                                  fontSize: '0.62rem',
                                  color: rKey === 'convoy_lead' ? '#0f172a' : '#ffffff'
                                }}
                              >
                                {rMeta.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div className="small text-secondary mb-2">
                        <div>
                          <i className="bi bi-buildings text-muted me-1"></i>
                          VTC: <strong className="text-dark">{driver.vtc || 'Independent'}</strong>
                        </div>
                        <div>
                          <i className="bi bi-geo-alt text-muted me-1"></i>
                          Region: <strong className="text-dark">{driver.country || 'Global'}</strong>
                        </div>
                        {driver.truck && (
                          <div>
                            <i className="bi bi-truck text-muted me-1"></i>
                            Rig: <span className="text-dark">{driver.truck}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-top d-flex justify-content-between align-items-center small text-secondary">
                      <span>
                        <strong style={{ color: '#0284c7' }}>{(driver.kms || 0).toLocaleString()}</strong> km
                      </span>
                      <span>
                        <strong className="text-success">{driver.deliveries || 0}</strong> jobs
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-4 pt-3 border-top">
            <div className="small text-secondary">
              Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> &ndash; <strong>{Math.min(currentPage * pageSize, filtered.length)}</strong> of <strong>{filtered.length}</strong> members
            </div>

            <div className="d-flex align-items-center gap-1">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary fw-bold"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <i className="bi bi-chevron-left me-1"></i> Prev
              </button>
              <span className="px-2 small fw-bold text-dark">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary fw-bold"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <i className="bi bi-chevron-right ms-1"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
