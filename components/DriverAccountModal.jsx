'use client';

import React, { useState } from 'react';
import { useAuth, ROLE_INFO, ROLES } from '@/lib/authContext';
import { GTC_COUNTRIES, GTC_TRUCKS, isValidStreamerUrl } from '@/lib/defaultConfig';
import PhotoCustomizerModal from './PhotoCustomizerModal';

export default function DriverAccountModal({ isOpen, onClose, initialTab = 'profile' }) {
  const {
    user,
    role,
    roleInfo,
    notifications,
    unreadCount,
    loginAccount,
    registerAccount,
    logoutAccount,
    markNotificationRead,
    clearNotifications,
    logHaul,
    updateUserAvatar,
    updateUserProfile
  } = useAuth();

  const [activeTab, setActiveTab] = useState(user ? initialTab : 'login');

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    country: user?.country || 'Kenya',
    vtc: user?.vtc || '',
    truck: user?.truck || 'Scania S730 V8',
    games: user?.games || ['ETS 2'],
    tmpId: user?.tmpId || '',
    steamId: user?.steamId || '',
    bio: user?.bio || '',
    isStreamer: Boolean(user?.isStreamer),
    streamerPlatform: user?.streamerPlatform || 'TikTok',
    streamerUrl: user?.streamerUrl || '',
    isDevModder: Boolean(user?.isDevModder),
    devSpecialty: user?.devSpecialty || ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  React.useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        country: user.country || 'Kenya',
        vtc: user.vtc || '',
        truck: user.truck || 'Scania S730 V8',
        games: user.games || ['ETS 2'],
        tmpId: user.tmpId || '',
        steamId: user.steamId || '',
        bio: user.bio || '',
        isStreamer: Boolean(user.isStreamer),
        streamerPlatform: user.streamerPlatform || 'TikTok',
        streamerUrl: user.streamerUrl || '',
        isDevModder: Boolean(user.isDevModder),
        devSpecialty: user.devSpecialty || ''
      });
    }
  }, [user]);

  const [loginForm, setLoginForm] = useState({
    emailOrCallsign: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'Kenya',
    truck: 'Scania S730 V8',
    tmpId: '',
    isStreamer: false,
    streamerPlatform: 'TikTok',
    streamerUrl: ''
  });
  const [registerError, setRegisterError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [customizerSource, setCustomizerSource] = useState('');

  const [haulForm, setHaulForm] = useState({
    route: 'Timetable Scheduled Convoy',
    kms: '850',
    cargo: 'Regional Freight',
    game: 'ETS 2'
  });

  if (!isOpen) return null;

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');

    if (profileForm.isStreamer) {
      if (!profileForm.streamerUrl?.trim() || !isValidStreamerUrl(profileForm.streamerUrl, profileForm.streamerPlatform)) {
        setProfileError(`A valid link to your ${profileForm.streamerPlatform} account or channel (e.g. https://www.tiktok.com/@yourchannel or https://www.youtube.com/@channel) is required to confirm streamer status.`);
        return;
      }
    }

    setIsSavingProfile(true);
    try {
      const res = await updateUserProfile(profileForm);
      if (res?.success) {
        setActiveTab('profile');
      } else if (res?.error) {
        setProfileError(res.error);
      }
    } catch (err) {
      setProfileError('Failed to save profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be smaller than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result;
      if (dataUrl) {
        setCustomizerSource(dataUrl);
        setIsCustomizerOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenCustomizer = () => {
    if (user?.avatar) {
      setCustomizerSource(user.avatar);
      setIsCustomizerOpen(true);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = loginAccount({
        emailOrCallsign: loginForm.emailOrCallsign,
        password: loginForm.password
      });
      if (res.success) {
        setLoginForm({ emailOrCallsign: '', password: '' });
        setActiveTab('profile');
      } else {
        setLoginError(res.error || 'Invalid credentials');
      }
    } catch (err) {
      setLoginError('Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }

    if (registerForm.isStreamer) {
      if (!registerForm.streamerUrl?.trim() || !isValidStreamerUrl(registerForm.streamerUrl, registerForm.streamerPlatform)) {
        setRegisterError(`A valid link to your ${registerForm.streamerPlatform} account or channel (e.g. https://www.tiktok.com/@yourchannel or https://www.youtube.com/@channel) is required to verify streamer status.`);
        return;
      }
    }

    setIsRegistering(true);
    try {
      const res = await registerAccount({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        country: registerForm.country,
        truck: registerForm.truck,
        tmpId: registerForm.tmpId?.trim() || '',
        isStreamer: registerForm.isStreamer,
        streamerPlatform: registerForm.isStreamer ? registerForm.streamerPlatform : '',
        streamerUrl: registerForm.isStreamer ? registerForm.streamerUrl : '',
        isDevModder: registerForm.isDevModder,
        devSpecialty: registerForm.isDevModder ? registerForm.devSpecialty : ''
      });

      if (res.success) {
        setActiveTab('profile');
      } else {
        setRegisterError(res.error || 'Registration failed');
      }
    } catch (err) {
      setRegisterError('Registration failed. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogHaulSubmit = (e) => {
    e.preventDefault();
    logHaul(haulForm);
    setActiveTab('profile');
  };

  const handleLogout = () => {
    logoutAccount();
    setActiveTab('login');
  };

  return (
    <div className="modal-backdrop-custom" onClick={onClose}>
      <div className="modal-content-custom mx-auto" onClick={(e) => e.stopPropagation()}>
        
        <div className="p-3 p-sm-4 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: '#e2e8f0' }}>
          <div className="d-flex align-items-center gap-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="rounded-circle border object-fit-cover shadow-sm"
                style={{ width: '42px', height: '42px', borderColor: '#e2e8f0' }}
              />
            ) : (
              <i className="bi bi-person-badge-fill fs-4" style={{ color: '#0284c7' }}></i>
            )}
            <div>
              <h3 className="h5 fw-bold text-dark mb-0">
                {user ? user.name : 'Driver Access Portal'}
              </h3>
              {user ? (
                <div className="d-flex align-items-center gap-1 mt-1 flex-wrap">
                  {((user.roles && user.roles.length > 0) ? user.roles : [user.role || 'driver']).map((rKey) => {
                    const rInfo = ROLE_INFO[rKey] || ROLE_INFO.driver;
                    return (
                      <span key={rKey} className={`badge ${rInfo.badgeClass}`} style={rInfo.style}>
                        <i className={`${rInfo.iconClass} me-1`}></i> {rInfo.label}
                      </span>
                    );
                  })}
                  <span className="small text-secondary ms-1">ID: {user.id}</span>
                </div>
              ) : (
                <span className="small text-secondary">Secure Driver Authentication</span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>

        <div className="d-flex border-bottom bg-light px-2 px-sm-3 flex-nowrap overflow-x-auto text-nowrap" style={{ borderColor: '#e2e8f0' }}>
          {user ? (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`btn btn-link text-decoration-none py-3 px-3 fw-bold small ${activeTab === 'profile' ? 'border-bottom border-2' : 'text-secondary'}`}
                style={{ color: activeTab === 'profile' ? '#0284c7' : undefined, borderColor: activeTab === 'profile' ? '#0284c7' : undefined }}
              >
                <i className="bi bi-person-vcard me-1"></i> Driver License
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`btn btn-link text-decoration-none py-3 px-3 fw-bold small ${activeTab === 'edit' ? 'border-bottom border-2' : 'text-secondary'}`}
                style={{ color: activeTab === 'edit' ? '#0284c7' : undefined, borderColor: activeTab === 'edit' ? '#0284c7' : undefined }}
              >
                <i className="bi bi-pencil-square me-1"></i> Edit Profile
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notifications')}
                className={`btn btn-link text-decoration-none py-3 px-3 fw-bold small position-relative ${activeTab === 'notifications' ? 'border-bottom border-2' : 'text-secondary'}`}
                style={{ color: activeTab === 'notifications' ? '#0284c7' : undefined, borderColor: activeTab === 'notifications' ? '#0284c7' : undefined }}
              >
                <i className="bi bi-bell-fill me-1"></i> Reminders &amp; Inbox
                {unreadCount > 0 && (
                  <span className="badge rounded-1 bg-danger ms-1">{unreadCount}</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('loghaul')}
                className={`btn btn-link text-decoration-none py-3 px-3 fw-bold small ${activeTab === 'loghaul' ? 'border-bottom border-2' : 'text-secondary'}`}
                style={{ color: activeTab === 'loghaul' ? '#0284c7' : undefined, borderColor: activeTab === 'loghaul' ? '#0284c7' : undefined }}
              >
                <i className="bi bi-plus-circle-fill me-1"></i> Log Delivery
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`btn btn-link text-decoration-none py-3 px-3 fw-bold small ${activeTab === 'security' ? 'border-bottom border-2' : 'text-secondary'}`}
                style={{ color: activeTab === 'security' ? '#0284c7' : undefined, borderColor: activeTab === 'security' ? '#0284c7' : undefined }}
              >
                <i className="bi bi-shield-lock me-1"></i> Security &amp; Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`btn btn-link text-decoration-none py-3 px-3 fw-bold small ${activeTab === 'login' ? 'border-bottom border-2' : 'text-secondary'}`}
                style={{ color: activeTab === 'login' ? '#0284c7' : undefined, borderColor: activeTab === 'login' ? '#0284c7' : undefined }}
              >
                <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className={`btn btn-link text-decoration-none py-3 px-3 fw-bold small ${activeTab === 'signup' ? 'border-bottom border-2' : 'text-secondary'}`}
                style={{ color: activeTab === 'signup' ? '#0284c7' : undefined, borderColor: activeTab === 'signup' ? '#0284c7' : undefined }}
              >
                <i className="bi bi-person-plus-fill me-1"></i> Create Account
              </button>
            </>
          )}
        </div>

        <div className="p-3 p-sm-4">
          
          {!user && activeTab === 'login' && (
            <div>
              <div className="text-center mb-4">
                <i className="bi bi-truck fs-1" style={{ color: '#0284c7' }}></i>
                <h4 className="fw-bold text-dark mt-2 mb-1">Sign In to Driver Portal</h4>
                <p className="text-secondary small">
                  Access your digital driver license, personal convoy alerts, and hauling records.
                </p>
              </div>

              {loginError && (
                <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-circle-fill"></i>
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit}>
                <div className="mb-3">
                  <label className="form-label small text-secondary fw-bold">Callsign, Email, or GTC ID</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-person-fill"></i></span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bryan Gaming or GTC-1001"
                      className="form-control"
                      value={loginForm.emailOrCallsign}
                      onChange={(e) => setLoginForm({ ...loginForm, emailOrCallsign: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small text-secondary fw-bold">Password</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
                    <input
                      type="password"
                      required
                      placeholder="Enter your password"
                      className="form-control"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="btn btn-warning w-100 fw-bold py-2 shadow-sm mb-3"
                >
                  {isLoggingIn ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-1"></i> Sign In to Account
                    </>
                  )}
                </button>

                <div className="text-center small text-secondary">
                  Don&apos;t have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('signup')}
                    className="btn btn-link p-0 fw-bold text-decoration-none"
                    style={{ color: '#0284c7' }}
                  >
                    Register here &rarr;
                  </button>
                </div>
              </form>
            </div>
          )}

          {!user && activeTab === 'signup' && (
            <div>
              <div className="text-center mb-3">
                <h4 className="fw-bold text-dark mb-1">Create Driver Account</h4>
                <p className="text-secondary small mb-0">
                  Join the Global Truckers Community with your official credentials.
                </p>
              </div>

              {registerError && (
                <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-circle-fill"></i>
                  <span>{registerError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label small text-secondary fw-bold">Driver Callsign / Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bryan_Hauler"
                      className="form-control"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label small text-secondary fw-bold">Email Address</label>
                    <input
                      type="email"
                      placeholder="driver@example.com"
                      className="form-control"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label small text-secondary fw-bold">Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Create a password"
                      className="form-control"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label small text-secondary fw-bold">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter password"
                      className="form-control"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-3 bg-light border mb-3" style={{ borderColor: '#e2e8f0' }}>
                  <div className="form-check form-switch mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="modalStreamerCheck"
                      checked={registerForm.isStreamer}
                      onChange={(e) => setRegisterForm({ ...registerForm, isStreamer: e.target.checked })}
                    />
                    <label className="form-check-label fw-bold text-dark small" htmlFor="modalStreamerCheck">
                      <i className="bi bi-camera-video-fill text-danger me-1"></i> Are you a Content Creator or Live Streamer?
                    </label>
                  </div>
                  <span className="small text-secondary d-block">
                    Streamers automatically receive the verified <strong>Official Streamer</strong> role and badge on GTC!
                  </span>

                  {registerForm.isStreamer && (
                    <div className="row g-2 mt-2 pt-2 border-top" style={{ borderColor: '#cbd5e1' }}>
                      <div className="col-12 col-sm-4">
                        <label className="form-label small text-secondary fw-bold mb-1">Platform</label>
                        <select
                          className="form-select form-select-sm"
                          value={registerForm.streamerPlatform}
                          onChange={(e) => setRegisterForm({ ...registerForm, streamerPlatform: e.target.value })}
                        >
                          <option value="TikTok">TikTok</option>
                          <option value="YouTube">YouTube</option>
                          <option value="Twitch">Twitch</option>
                          <option value="Kick">Kick</option>
                          <option value="Facebook">Facebook Gaming</option>
                        </select>
                      </div>
                      <div className="col-12 col-sm-8">
                        <label className="form-label small text-secondary fw-bold mb-1">Channel / Profile Link *</label>
                        <input
                          type="text"
                          required={registerForm.isStreamer}
                          className="form-control form-control-sm"
                          placeholder="e.g. https://www.tiktok.com/@bryangaming"
                          value={registerForm.streamerUrl}
                          onChange={(e) => setRegisterForm({ ...registerForm, streamerUrl: e.target.value })}
                        />
                        <span className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>
                          <i className="bi bi-shield-check text-success me-1"></i> Required: active streaming link (e.g. https://www.tiktok.com/@yourchannel or https://www.youtube.com/@channel)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label small text-secondary fw-bold">Country</label>
                    <select
                      className="form-select"
                      value={registerForm.country}
                      onChange={(e) => setRegisterForm({ ...registerForm, country: e.target.value })}
                    >
                      {GTC_COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label small text-secondary fw-bold">Truck Preference</label>
                    <select
                      className="form-select"
                      value={registerForm.truck}
                      onChange={(e) => setRegisterForm({ ...registerForm, truck: e.target.value })}
                    >
                      {GTC_TRUCKS.map((trk) => (
                        <option key={trk} value={trk}>{trk}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small text-secondary fw-bold">TruckersMP ID (Optional)</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-hdd-network"></i></span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 1928374 or Profile ID (leave empty if none)"
                      value={registerForm.tmpId}
                      onChange={(e) => setRegisterForm({ ...registerForm, tmpId: e.target.value })}
                    />
                  </div>
                  <span className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>
                    Enter your genuine TruckersMP user ID. Leave blank if you don&apos;t have one yet.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="btn btn-warning w-100 fw-bold py-2 shadow-sm mb-3"
                >
                  {isRegistering ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Registering Account...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle-fill me-1"></i> Register &amp; Issue Driver License
                    </>
                  )}
                </button>

                <div className="text-center small text-secondary">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="btn btn-link p-0 fw-bold text-decoration-none"
                    style={{ color: '#0284c7' }}
                  >
                    Sign In here &rarr;
                  </button>
                </div>
              </form>
            </div>
          )}

          {user && activeTab === 'profile' && (
            <div className="d-flex flex-column gap-4">
              <div className="driver-license-card">
                <div className="license-hologram-strip"></div>

                <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom" style={{ borderColor: '#e2e8f0' }}>
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-truck fs-4 text-warning"></i>
                    <div>
                      <div className="fw-extrabold text-dark small lh-1">GLOBAL TRUCKERS COMMUNITY</div>
                      <div className="fw-bold text-uppercase" style={{ fontSize: '0.65rem', color: '#0284c7' }}>
                        OFFICIAL DRIVER CREDENTIAL
                      </div>
                    </div>
                  </div>
                  <i className="bi bi-patch-check-fill fs-5" style={{ color: '#0284c7' }}></i>
                </div>

                <div className="row g-3 align-items-center mb-3">
                  <div className="col-12 col-sm-4 col-md-3 text-center mb-2 mb-sm-0">
                    <div
                      className="rounded-2 border overflow-hidden mx-auto shadow-sm position-relative d-flex align-items-center justify-content-center"
                      style={{ width: '84px', height: '84px', backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
                    >
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-100 h-100 object-fit-cover" />
                      ) : (
                        <i className="bi bi-person fs-1" style={{ color: '#0284c7' }}></i>
                      )}
                    </div>

                    <div className="d-flex flex-column gap-1 mt-2">
                      <label className="btn btn-outline-warning btn-sm fw-bold w-100 py-1" style={{ fontSize: '0.68rem' }}>
                        <i className="bi bi-camera-fill me-1"></i> {user.avatar ? 'Change Photo' : 'Upload Photo'}
                        <input
                          type="file"
                          accept="image/*"
                          className="d-none"
                          onChange={handleAvatarChange}
                        />
                      </label>
                      {user.avatar && (
                        <button
                          type="button"
                          onClick={handleOpenCustomizer}
                          className="btn btn-outline-primary btn-sm fw-bold w-100 py-1"
                          style={{ fontSize: '0.68rem' }}
                        >
                          <i className="bi bi-crop me-1"></i> Crop &amp; Adjust
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="col-12 col-sm-8 col-md-9 text-center text-sm-start">
                    <div className="row g-2">
                      <div className="col-6">
                        <span className="small text-muted d-block" style={{ fontSize: '0.7rem' }}>CALLSIGN</span>
                        <strong className="text-dark small d-block">{user.name}</strong>
                      </div>
                      <div className="col-6">
                        <span className="small text-muted d-block" style={{ fontSize: '0.7rem' }}>ROLE</span>
                        <div className="d-flex flex-wrap gap-1">
                          {((user.roles && user.roles.length > 0) ? user.roles : [user.role || 'driver']).map((rKey) => {
                            const rInfo = ROLE_INFO[rKey] || ROLE_INFO.driver;
                            return (
                              <span key={rKey} className={`badge ${rInfo.badgeClass} small`} style={rInfo.style}>
                                <i className={`${rInfo.iconClass} me-1`}></i> {rInfo.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <div className="col-6">
                        <span className="small text-muted d-block" style={{ fontSize: '0.7rem' }}>LICENSE NO.</span>
                        <span className="fw-bold small text-dark">{user.licenseNumber || 'GTC-DL-2026-001'}</span>
                      </div>
                      <div className="col-6">
                        <span className="small text-muted d-block" style={{ fontSize: '0.7rem' }}>TRUCKERSMP ID</span>
                        <span className="small fw-semibold text-dark">{user.tmpId || 'Not Linked'}</span>
                      </div>
                      <div className="col-6">
                        <span className="small text-muted d-block" style={{ fontSize: '0.7rem' }}>COUNTRY</span>
                        <span className="small fw-semibold text-dark">{user.country || 'Kenya'}</span>
                      </div>
                      <div className="col-6">
                        <span className="small text-muted d-block" style={{ fontSize: '0.7rem' }}>TRUCK</span>
                        <span className="small text-secondary">{user.truck || 'Scania S730'}</span>
                      </div>
                      <div className="col-6">
                        <span className="small text-muted d-block" style={{ fontSize: '0.7rem' }}>STATUS</span>
                        <span className="badge bg-success small">Verified Active</span>
                      </div>
                    </div>
                  </div>
                </div>

                {user.isStreamer && user.streamerUrl && isValidStreamerUrl(user.streamerUrl, user.streamerPlatform) && (
                  <div className="p-2 rounded-2 bg-light border mb-3 d-flex align-items-center justify-content-between" style={{ borderColor: '#ec4899' }}>
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-broadcast text-danger fs-5"></i>
                      <div>
                        <strong className="small text-dark d-block">Verified Community Streamer</strong>
                        <span className="small text-secondary">{user.streamerPlatform || 'Streaming Partner'}</span>
                      </div>
                    </div>
                    {user.streamerUrl && (
                      <a href={user.streamerUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-danger py-0 px-2 small">
                        View Channel
                      </a>
                    )}
                  </div>
                )}

                {(user.isDevModder || user.role === 'dev_modder') && (
                  <div className="p-2 rounded-2 bg-light border mb-3 d-flex align-items-center justify-content-between" style={{ borderColor: '#e2e8f0' }}>
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-code-slash text-primary fs-5"></i>
                      <div>
                        <strong className="small text-dark d-block">Verified Dev | Modder</strong>
                        <span className="small text-secondary">{user.devSpecialty || 'Community Tools & Modding Contributor'}</span>
                      </div>
                    </div>
                    <span className="badge text-white rounded-1" style={{ backgroundColor: '#0284c7' }}>
                      Mod Specialist
                    </span>
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center pt-2 border-top small text-secondary">
                  <span>Issued: {user.joinedAt || '2026'}</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className="btn btn-sm btn-outline-primary py-0 px-2 fw-bold"
                    style={{ borderColor: '#0284c7', color: '#0284c7', fontSize: '0.75rem' }}
                  >
                    <i className="bi bi-pencil-square me-1"></i> Edit Profile Details
                  </button>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-6">
                  <div className="p-3 rounded-3 bg-white border text-center shadow-sm" style={{ borderColor: '#e2e8f0' }}>
                    <span className="small text-secondary fw-bold text-uppercase d-block mb-1">Total Hauled</span>
                    <span className="fs-4 fw-extrabold text-dark">{((user.kms || 0)).toLocaleString()} km</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 rounded-3 bg-white border text-center shadow-sm" style={{ borderColor: '#e2e8f0' }}>
                    <span className="small text-secondary fw-bold text-uppercase d-block mb-1">Deliveries</span>
                    <span className="fs-4 fw-extrabold text-dark">{user.deliveries || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {user && activeTab === 'edit' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom" style={{ borderColor: '#e2e8f0' }}>
                <div>
                  <h4 className="h6 fw-bold text-dark mb-0">
                    <i className="bi bi-pencil-square text-primary me-1"></i> Edit Driver Profile &amp; Credentials
                  </h4>
                  <span className="text-secondary small">Changes apply directly to your Driver License, Roster, and Community Dossier.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="btn btn-sm btn-outline-secondary"
                >
                  Cancel
                </button>
              </div>

              {profileError && (
                <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label small text-secondary fw-bold">Driver Callsign / Name *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label small text-secondary fw-bold">Country / Nationality</label>
                    <select
                      className="form-select"
                      value={profileForm.country}
                      onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                    >
                      {GTC_COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label small text-secondary fw-bold">VTC Affiliation</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileForm.vtc}
                      onChange={(e) => setProfileForm({ ...profileForm, vtc: e.target.value })}
                      placeholder="e.g. GTC Logistics, Euro Haulers"
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label small text-secondary fw-bold">Truck Rig / Model</label>
                    <select
                      className="form-select"
                      value={profileForm.truck}
                      onChange={(e) => setProfileForm({ ...profileForm, truck: e.target.value })}
                    >
                      {GTC_TRUCKS.map((trk) => (
                        <option key={trk} value={trk}>{trk}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label small text-secondary fw-bold">TruckersMP ID</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileForm.tmpId}
                      onChange={(e) => setProfileForm({ ...profileForm, tmpId: e.target.value })}
                      placeholder="e.g. TMP-883921"
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label small text-secondary fw-bold">Steam ID / Profile</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileForm.steamId}
                      onChange={(e) => setProfileForm({ ...profileForm, steamId: e.target.value })}
                      placeholder="e.g. bryan_gaming_live"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small text-secondary fw-bold">Simulators</label>
                  <div className="d-flex gap-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="editGameETS2"
                        checked={profileForm.games?.includes('ETS 2')}
                        onChange={(e) => {
                          const current = profileForm.games || [];
                          const updated = e.target.checked
                            ? [...current, 'ETS 2']
                            : current.filter((g) => g !== 'ETS 2');
                          setProfileForm({ ...profileForm, games: updated });
                        }}
                      />
                      <label className="form-check-label small fw-bold" htmlFor="editGameETS2">
                        Euro Truck Simulator 2
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="editGameATS"
                        checked={profileForm.games?.includes('ATS')}
                        onChange={(e) => {
                          const current = profileForm.games || [];
                          const updated = e.target.checked
                            ? [...current, 'ATS']
                            : current.filter((g) => g !== 'ATS');
                          setProfileForm({ ...profileForm, games: updated });
                        }}
                      />
                      <label className="form-check-label small fw-bold" htmlFor="editGameATS">
                        American Truck Simulator
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2 bg-light border mb-3" style={{ borderColor: '#e2e8f0' }}>
                  <div className="form-check form-switch mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="editStreamerCheck"
                      checked={profileForm.isStreamer}
                      onChange={(e) => setProfileForm({ ...profileForm, isStreamer: e.target.checked })}
                    />
                    <label className="form-check-label fw-bold text-dark small" htmlFor="editStreamerCheck">
                      <i className="bi bi-camera-video-fill text-danger me-1"></i> Content Creator / Live Streamer
                    </label>
                  </div>
                  {profileForm.isStreamer && (
                    <div className="row g-2 mt-1">
                      <div className="col-12 col-sm-4">
                        <select
                          className="form-select form-select-sm"
                          value={profileForm.streamerPlatform}
                          onChange={(e) => setProfileForm({ ...profileForm, streamerPlatform: e.target.value })}
                        >
                          <option value="TikTok">TikTok</option>
                          <option value="YouTube">YouTube</option>
                          <option value="Twitch">Twitch</option>
                          <option value="Kick">Kick</option>
                          <option value="Facebook">Facebook Gaming</option>
                        </select>
                      </div>
                      <div className="col-12 col-sm-8">
                        <label className="form-label small text-secondary fw-bold mb-1">Channel / Profile Link *</label>
                        <input
                          type="text"
                          required={profileForm.isStreamer}
                          className="form-control form-control-sm"
                          placeholder="e.g. https://www.tiktok.com/@bryangaming"
                          value={profileForm.streamerUrl}
                          onChange={(e) => setProfileForm({ ...profileForm, streamerUrl: e.target.value })}
                        />
                        <span className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>
                          <i className="bi bi-shield-check text-success me-1"></i> Required: active streaming link (e.g. https://www.tiktok.com/@yourchannel or https://www.youtube.com/@channel)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label small text-secondary fw-bold">Driver Motto / Bio</label>
                  <textarea
                    rows={2}
                    className="form-control"
                    placeholder="Brief driver bio or personal motto..."
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  ></textarea>
                </div>

                <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="btn btn-outline-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="btn btn-warning btn-sm fw-bold px-4 shadow-sm"
                  >
                    {isSavingProfile ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1"></span> Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2-circle me-1"></i> Save Profile Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {user && activeTab === 'notifications' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="h6 fw-bold text-dark mb-0">
                  <i className="bi bi-bell-fill text-warning me-1"></i> Personal Convoy Alerts &amp; Inbox
                </h4>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={clearNotifications}
                    className="btn btn-sm btn-link text-secondary text-decoration-none p-0 small"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-5 text-secondary">
                  <i className="bi bi-bell-slash fs-1 d-block mb-2 text-muted"></i>
                  <p className="small mb-1">No alerts or notifications yet.</p>
                  <span className="small text-muted">Book convoys from the timetable below to receive departure alerts!</span>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 rounded-3 border d-flex gap-3 align-items-start transition shadow-sm ${n.read ? 'bg-light' : 'bg-white'}`}
                      style={{
                        borderColor: n.read ? '#cbd5e1' : '#0284c7',
                        cursor: 'pointer'
                      }}
                    >
                      <i className={`${n.iconClass || 'bi bi-bell-fill'} fs-4`} style={{ color: '#0284c7' }}></i>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <strong className="text-dark small">{n.title}</strong>
                          <span className="text-muted" style={{ fontSize: '0.7rem' }}>{n.time}</span>
                        </div>
                        <p className="small text-secondary mb-0">{n.message}</p>
                      </div>
                      {!n.read && (
                        <span className="badge rounded-1 bg-danger" style={{ width: '8px', height: '8px', padding: 0 }}></span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {user && activeTab === 'loghaul' && (
            <form onSubmit={handleLogHaulSubmit}>
              <h4 className="h6 fw-bold text-dark mb-1">
                <i className="bi bi-plus-circle-fill text-warning me-1"></i> Log Driver Telemetry
              </h4>
              <p className="text-secondary small mb-3">
                Record your convoy runs to increase your certified kilometers and delivery count.
              </p>

              <div className="mb-3">
                <label className="form-label small text-secondary fw-bold">Convoy / Delivery Route</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-geo-alt"></i></span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wednesday Scheduled Convoy"
                    className="form-control"
                    value={haulForm.route}
                    onChange={(e) => setHaulForm({ ...haulForm, route: e.target.value })}
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label small text-secondary fw-bold">Kilometers Logged</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-speedometer2"></i></span>
                    <input
                      type="number"
                      required
                      className="form-control"
                      value={haulForm.kms}
                      onChange={(e) => setHaulForm({ ...haulForm, kms: e.target.value })}
                    />
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label small text-secondary fw-bold">Simulator</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-controller"></i></span>
                    <select
                      className="form-select"
                      value={haulForm.game}
                      onChange={(e) => setHaulForm({ ...haulForm, game: e.target.value })}
                    >
                      <option value="ETS 2">Euro Truck Simulator 2</option>
                      <option value="ATS">American Truck Simulator</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small text-secondary fw-bold">Cargo Hauled</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-box-seam"></i></span>
                  <input
                    type="text"
                    placeholder="e.g. Heavy Industrial Machinery"
                    className="form-control"
                    value={haulForm.cargo}
                    onChange={(e) => setHaulForm({ ...haulForm, cargo: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-warning w-100 fw-bold shadow-sm"
              >
                <i className="bi bi-check-circle-fill me-1"></i> Commit Haul to Driver License
              </button>
            </form>
          )}

          {user && activeTab === 'security' && (
            <div>
              <h4 className="h6 fw-bold text-dark mb-1">
                <i className="bi bi-shield-check text-success me-1"></i> Account Security &amp; Session
              </h4>
              <p className="text-secondary small mb-4">
                Manage your authenticated driver session. Account switching is disabled for security.
              </p>

              <div className="p-3 rounded-3 bg-light border mb-4" style={{ borderColor: '#e2e8f0' }}>
                <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                  <span className="small text-secondary">Logged in Callsign:</span>
                  <strong className="text-dark small">{user.name}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                  <span className="small text-secondary">Driver ID:</span>
                  <span className="small fw-bold" style={{ color: '#0284c7' }}>{user.id}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                  <span className="small text-secondary">Registered Email:</span>
                  <span className="small text-dark">{user.email || 'N/A'}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                  <span className="small text-secondary">Assigned Role:</span>
                  <span className={`badge ${roleInfo.badgeClass}`} style={roleInfo.style}>
                    <i className={`${roleInfo.iconClass} me-1`}></i> {roleInfo.label}
                  </span>
                </div>
                {user.isStreamer && (
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-secondary">Streaming Channel:</span>
                    <span className="small text-dark fw-bold">{user.streamerPlatform}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline-danger w-100 fw-bold py-2 shadow-sm"
              >
                <i className="bi bi-box-arrow-right me-2"></i> Log Out of Driver Portal
              </button>
            </div>
          )}
        </div>

        <PhotoCustomizerModal
          isOpen={isCustomizerOpen}
          imageSrc={customizerSource}
          onClose={() => setIsCustomizerOpen(false)}
          onSave={(croppedUrl) => {
            if (croppedUrl && updateUserAvatar) {
              updateUserAvatar(croppedUrl);
            }
          }}
        />
      </div>
    </div>
  );
}
