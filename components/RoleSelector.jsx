'use client';

import React, { useState } from 'react';
import { ROLE_INFO, ROLES } from '@/lib/authContext';

const AVAILABLE_ROLES = [
  { value: 'admin', label: 'Administrator', badge: 'bg-danger text-white' },
  { value: 'staff', label: 'Staff Member', badge: 'bg-purple text-white' },
  { value: 'dev_modder', label: 'Dev | Modder', badge: 'text-white', style: { backgroundColor: '#0284c7' } },
  { value: 'convoy_lead', label: 'Convoy Lead', badge: 'bg-warning text-dark' },
  { value: 'dispatcher', label: 'Dispatcher', badge: 'bg-info text-dark' },
  { value: 'streamer', label: 'Official Streamer', badge: 'text-white', style: { backgroundColor: '#ec4899' } },
  { value: 'driver', label: 'Certified Driver', badge: 'bg-success text-white' },
];

/**
 * RoleSelector component modeled after NEETEL-AUTOSPARES pattern.
 * Provides a dedicated, responsive <select> dropdown with instant database/auth synchronization.
 */
export default function RoleSelector({
  driver,
  currentRole,
  isCurrentUser,
  isAdminUser,
  onRoleChange
}) {
  const [role, setRole] = useState(currentRole || driver?.role || 'driver');
  const [updating, setUpdating] = useState(false);

  // Sync state if driver prop changes externally
  React.useEffect(() => {
    if (driver?.role && driver.role !== role) {
      setRole(driver.role);
    }
  }, [driver?.role]);

  const handleChange = async (e) => {
    const newRole = e.target.value;
    if (!isAdminUser) return;
    setUpdating(true);
    setRole(newRole);

    try {
      if (onRoleChange) {
        await onRoleChange(driver.id, newRole, driver);
      }
    } catch (err) {
      console.error('Role update failed:', err);
      // Revert on failure
      setRole(currentRole || driver?.role || 'driver');
    } finally {
      setUpdating(false);
    }
  };

  const currentInfo = ROLE_INFO[role] || {
    label: role,
    badgeClass: 'badge bg-secondary',
    color: '#64748b'
  };

  // If viewer is not admin, render read-only badge
  if (!isAdminUser) {
    return (
      <span
        className={`${currentInfo.badgeClass || 'badge bg-secondary'} fw-bold px-2 py-1 shadow-xs`}
        style={{ fontSize: '0.75rem', ...(currentInfo.style || {}) }}
      >
        <i className={`${currentInfo.iconClass || 'bi bi-shield'} me-1`}></i>
        {currentInfo.label}
      </span>
    );
  }

  return (
    <div className="d-inline-flex align-items-center gap-2">
      {/* Live Badge Preview */}
      <span
        className={`${currentInfo.badgeClass || 'badge bg-secondary'} fw-bold px-2 py-1 shadow-xs`}
        style={{
          fontSize: '0.72rem',
          ...(currentInfo.style || {}),
          opacity: updating ? 0.6 : 1
        }}
      >
        {updating ? (
          <span className="spinner-border spinner-border-sm me-1" style={{ width: '0.65rem', height: '0.65rem' }}></span>
        ) : (
          <i className={`${currentInfo.iconClass || 'bi bi-shield'} me-1`}></i>
        )}
        {currentInfo.label}
      </span>

      {/* Dropdown Role Selector (NEETEL Pattern) */}
      <div className="position-relative">
        <select
          value={role}
          disabled={updating}
          onChange={handleChange}
          aria-label={`Role for ${driver?.name || driver?.id}`}
          className="form-select form-select-sm fw-bold border shadow-xs"
          style={{
            width: '155px',
            fontSize: '0.75rem',
            padding: '0.25rem 0.6rem',
            cursor: updating ? 'wait' : 'pointer',
            backgroundColor: '#ffffff',
            borderColor: updating ? '#f59e0b' : '#cbd5e1',
            color: '#1e293b'
          }}
        >
          {AVAILABLE_ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {isCurrentUser && (
        <span
          className="badge bg-light text-muted border small"
          style={{ fontSize: '0.65rem' }}
          title="This is your active account"
        >
          You
        </span>
      )}
    </div>
  );
}
