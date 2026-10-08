'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth, ROLE_INFO } from '@/lib/authContext';

export default function Navbar({ onOpenAccountModal, onOpenNotifModal }) {
  const { user, role, isAdmin, unreadCount, logoutAccount } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCommunityOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setCommunityOpen(false);
  };

  return (
    <header className="sticky-top bg-white border-bottom shadow-sm" style={{ zIndex: 1030 }}>
      <nav className="navbar navbar-expand-xl py-2" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          
          <Link href="/" className="navbar-brand d-flex align-items-center gap-2 py-0 me-3" onClick={closeMenus}>
            <svg
              viewBox="0 0 256 256"
              width="38"
              height="38"
              className="rounded-2 shadow-sm flex-shrink-0"
              role="img"
              aria-label="GTC Logo"
            >
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
              <span className="fw-bold fs-6 text-dark lh-1" style={{ letterSpacing: '-0.02em' }}>
                Global Truckers
              </span>
              <span className="fw-bold text-uppercase" style={{ color: '#0284c7', fontSize: '0.62rem', letterSpacing: '0.06em' }}>
                ETS 2 &bull; ATS Community
              </span>
            </div>
          </Link>

          <button
            className="navbar-toggler border-0 p-2 text-dark shadow-none"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
            style={{ borderRadius: '8px' }}
          >
            <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'} fs-4 text-dark`}></i>
          </button>

          <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show mt-3 mt-xl-0 pt-2 pt-xl-0' : ''}`}>
            
            <ul className="navbar-nav mx-auto align-items-xl-center gap-xl-1 mb-3 mb-xl-0">
              <li className="nav-item">
                <a
                  className="nav-link px-2 py-1 text-secondary fw-semibold"
                  style={{ fontSize: '0.9rem' }}
                  href="/#next-convoy"
                  onClick={closeMenus}
                >
                  Next Convoy
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link px-2 py-1 text-secondary fw-semibold"
                  style={{ fontSize: '0.9rem' }}
                  href="/#schedule"
                  onClick={closeMenus}
                >
                  Schedule
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link px-2 py-1 text-secondary fw-semibold"
                  style={{ fontSize: '0.9rem' }}
                  href="/#members"
                  onClick={closeMenus}
                >
                  Drivers
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link px-2 py-1 text-secondary fw-semibold"
                  style={{ fontSize: '0.9rem' }}
                  href="/#gallery"
                  onClick={closeMenus}
                >
                  Gallery
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link px-2 py-1 text-secondary fw-semibold"
                  style={{ fontSize: '0.9rem' }}
                  href="/#news"
                  onClick={closeMenus}
                >
                  News
                </a>
              </li>

              <li className="nav-item dropdown position-relative" ref={dropdownRef}>
                <button
                  type="button"
                  className="nav-link px-2 py-1 text-secondary fw-semibold bg-transparent border-0 d-flex align-items-center gap-1 shadow-none"
                  style={{ fontSize: '0.9rem' }}
                  onClick={() => setCommunityOpen(!communityOpen)}
                >
                  More <i className={`bi bi-chevron-${communityOpen ? 'up' : 'down'} small text-muted`}></i>
                </button>
                {communityOpen && (
                  <ul
                    className="dropdown-menu show shadow-sm border py-1 position-absolute"
                    style={{
                      borderRadius: '8px',
                      borderColor: '#e2e8f0',
                      minWidth: '180px',
                      zIndex: 1050,
                      top: '100%',
                      left: 0
                    }}
                  >
                    <li>
                      <a
                        className="dropdown-item py-2 d-flex align-items-center gap-2 small fw-semibold text-secondary"
                        href="/#discord"
                        onClick={closeMenus}
                      >
                        <i className="bi bi-discord text-primary"></i> Discord Server
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item py-2 d-flex align-items-center gap-2 small fw-semibold text-secondary"
                        href="/#stats"
                        onClick={closeMenus}
                      >
                        <i className="bi bi-speedometer2 text-info"></i> Fleet Stats
                      </a>
                    </li>
                    <li>
                      <hr className="dropdown-divider my-1" />
                    </li>
                    <li>
                      <Link
                        href="/stats"
                        className="dropdown-item py-2 d-flex align-items-center gap-2 small fw-semibold text-secondary"
                        onClick={closeMenus}
                      >
                        <i className="bi bi-bar-chart-line text-success"></i> Telemetry &amp; Logs
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              <li className="nav-item ms-xl-1">
                <a
                  className="nav-link px-3 py-1 rounded-2 fw-bold text-nowrap d-inline-block"
                  style={{
                    backgroundColor: 'rgba(2, 132, 199, 0.08)',
                    color: '#0284c7',
                    fontSize: '0.86rem'
                  }}
                  href="/#signup"
                  onClick={closeMenus}
                >
                  <i className="bi bi-truck me-1"></i> Recruitment
                </a>
              </li>
            </ul>

            <div className="d-flex align-items-center flex-wrap gap-2 pt-2 pt-xl-0">
              
              {user && isAdmin && (
                <Link
                  href="/admin"
                  className="btn btn-sm btn-outline-primary fw-bold d-flex align-items-center gap-1 shadow-sm"
                  style={{ borderColor: '#0284c7', color: '#0284c7', fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                  title="Admin Content Desk"
                  onClick={closeMenus}
                >
                  <i className="bi bi-gear-fill"></i> CMS Desk
                </Link>
              )}

              {user && (
                <button
                  className="btn btn-sm btn-light border position-relative p-2 rounded-2 d-flex align-items-center justify-content-center"
                  style={{ width: '34px', height: '34px', borderColor: '#e2e8f0' }}
                  onClick={() => {
                    closeMenus();
                    onOpenNotifModal();
                  }}
                  title="Convoy Reminders & Notifications"
                  aria-label="Notifications"
                >
                  <i className="bi bi-bell text-secondary"></i>
                  {unreadCount > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger p-1"
                      style={{ fontSize: '0.6rem' }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}

              {user ? (
                <>
                  <div
                    className="d-flex align-items-center gap-2 px-2 py-1 rounded-2 border bg-light shadow-sm"
                    onClick={() => {
                      closeMenus();
                      onOpenAccountModal('profile');
                    }}
                    role="button"
                    tabIndex={0}
                    style={{ cursor: 'pointer', borderColor: '#e2e8f0' }}
                    title="View Driver Profile & License"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="rounded-circle object-fit-cover border"
                        style={{ width: '28px', height: '28px', borderColor: '#0284c7' }}
                      />
                    ) : (
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white"
                        style={{
                          width: '28px',
                          height: '28px',
                          backgroundColor: ROLE_INFO[user?.role || role]?.color || '#0284c7',
                          fontSize: '0.8rem'
                        }}
                      >
                        <i className={ROLE_INFO[user?.role || role]?.iconClass || 'bi bi-person-fill'}></i>
                      </div>
                    )}
                    <div className="d-flex flex-column text-start">
                      <span className="fw-bold text-dark lh-1" style={{ fontSize: '0.82rem' }}>
                        {user.name}
                      </span>
                      <span
                        className="fw-bold text-uppercase"
                        style={{
                          fontSize: '0.64rem',
                          color: ROLE_INFO[user?.role || role]?.color || '#0284c7',
                          letterSpacing: '0.04em'
                        }}
                      >
                        {user?.roles && user.roles.length > 1
                          ? `${ROLE_INFO[user.roles[0]]?.label || user.roles[0]} +${user.roles.length - 1}`
                          : (ROLE_INFO[user?.role || role]?.label || user?.role || 'Member')}
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn btn-sm btn-outline-danger p-2 rounded-2 d-flex align-items-center justify-content-center"
                    style={{ width: '34px', height: '34px' }}
                    onClick={() => {
                      closeMenus();
                      logoutAccount();
                    }}
                    title="Log Out"
                    aria-label="Log Out"
                  >
                    <i className="bi bi-box-arrow-right"></i>
                  </button>
                </>
              ) : (
                <div className="d-flex align-items-center gap-2 w-100 w-xl-auto">
                  <button
                    className="btn btn-sm btn-outline-secondary fw-bold flex-grow-1 flex-xl-grow-0"
                    onClick={() => {
                      closeMenus();
                      onOpenAccountModal('login');
                    }}
                    style={{ fontSize: '0.84rem', padding: '0.35rem 0.85rem' }}
                  >
                    Sign In
                  </button>
                  <button
                    className="btn btn-sm btn-primary fw-bold flex-grow-1 flex-xl-grow-0 shadow-sm"
                    onClick={() => {
                      closeMenus();
                      onOpenAccountModal('signup');
                    }}
                    style={{
                      backgroundColor: '#0284c7',
                      borderColor: '#0284c7',
                      color: '#ffffff',
                      fontSize: '0.84rem',
                      padding: '0.35rem 0.85rem'
                    }}
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
