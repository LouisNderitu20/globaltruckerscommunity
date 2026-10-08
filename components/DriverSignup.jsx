'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import PhotoCustomizerModal from './PhotoCustomizerModal';

export default function DriverSignup({ onSignupSuccess }) {
  const { registerAccount } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'Kenya',
    truck: 'Scania S730 V8',
    vtc: 'Independent Solo Driver',
    tmpId: '',
    steamId: '',
    games: ['ETS 2'],
    avatar: '',
    isStreamer: false,
    streamerPlatform: 'TikTok',
    streamerUrl: ''
  });

  const [passwordError, setPasswordError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [photoMode, setPhotoMode] = useState('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [customizerSource, setCustomizerSource] = useState('');

  const PRESET_AVATARS = [
    { label: 'Scania Gold', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80' },
    { label: 'Highway Captain', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80' },
    { label: 'Road Pilot', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80' },
    { label: 'Freight Master', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=256&q=80' }
  ];

  const countries = [
    'Kenya',
    'United Kingdom',
    'Germany',
    'United States',
    'Sweden',
    'Netherlands',
    'France',
    'Poland',
    'Australia',
    'Brazil',
    'Canada',
    'South Africa',
    'Italy',
    'Turkey'
  ];

  const handleGameToggle = (game) => {
    const current = [...formData.games];
    const idx = current.indexOf(game);
    if (idx > -1) {
      if (current.length > 1) current.splice(idx, 1);
    } else {
      current.push(game);
    }
    setFormData({ ...formData, games: current });
  };

  const handleFileUpload = (e) => {
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
        setFormData((prev) => ({ ...prev, avatar: dataUrl }));
        setCustomizerSource(dataUrl);
        setIsCustomizerOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setFormData((prev) => ({ ...prev, avatar: urlInput.trim() }));
      setUrlInput('');
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, avatar: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordError('');

    setSubmitting(true);
    try {
      const res = await registerAccount(formData);
      if (res?.success && onSignupSuccess) {
        onSignupSuccess(res.driver);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="signup" className="py-4">
      <div className="container">

        <div className="text-center mb-4">
          <span className="badge badge-gold text-uppercase fw-bold px-3 py-2 mb-2">
            <i className="bi bi-person-plus-fill me-1"></i> Join the Fleet
          </span>
          <h2 className="display-6 fw-extrabold text-dark mb-1">Driver &amp; VTC Recruitment</h2>
          <p className="text-secondary mx-auto mb-0" style={{ maxWidth: '650px' }}>
            Get your official GTC Digital Driver License, receive convoy reminders in your account &amp; email, and track your telemetry across all community drives.
          </p>
        </div>

        <div className="row g-4 g-lg-5 align-items-start">

          <div className="col-12 col-lg-7">
            <div className="card glass p-4 p-md-5 shadow-lg">
              <h3 className="h5 fw-bold text-dark mb-1">
                <i className="bi bi-card-checklist text-warning me-2"></i> Driver Application Form
              </h3>
              <p className="text-secondary small mb-4">
                Solo drivers, VTC company members, and streamers from any virtual trucking background are welcome.
              </p>

              <form onSubmit={handleSubmit}>

                <div className="mb-3">
                  <label className="form-label small text-secondary fw-bold">In-Game Callsign / Driver Name *</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-person-fill"></i></span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bryan_Hauler or RoadRunner99"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mb-4 p-3 rounded-3 bg-light border" style={{ borderColor: '#e2e8f0' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label small fw-bold mb-0 text-dark">
                      <i className="bi bi-camera-fill me-1" style={{ color: '#0284c7' }}></i> Driver Photo / License Portrait (Optional)
                    </label>
                    <div className="d-flex align-items-center gap-2">
                      {formData.avatar && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomizerSource(formData.avatar);
                            setIsCustomizerOpen(true);
                          }}
                          className="btn btn-sm btn-outline-primary py-0 px-2 fw-bold"
                          style={{ fontSize: '0.75rem' }}
                        >
                          <i className="bi bi-crop me-1"></i> Resize / Crop
                        </button>
                      )}
                      {formData.avatar && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="btn btn-link text-danger p-0 text-decoration-none small"
                        >
                          <i className="bi bi-trash-fill me-1"></i> Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-secondary small mb-3">
                    Upload your picture to customize and resize it on your official GTC Digital Driver License.
                  </p>

                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div
                      className="rounded-3 overflow-hidden border d-flex align-items-center justify-content-center bg-white shadow-sm flex-shrink-0"
                      style={{ width: '70px', height: '70px', borderColor: '#0284c7' }}
                    >
                      {formData.avatar ? (
                        <img src={formData.avatar} alt="Driver preview" className="w-100 h-100 object-fit-cover" />
                      ) : (
                        <i className="bi bi-person-circle fs-1 text-secondary"></i>
                      )}
                    </div>

                    <div className="flex-grow-1">
                      <div className="btn-group btn-group-sm w-100 mb-2">
                        <button
                          type="button"
                          onClick={() => setPhotoMode('upload')}
                          className={`btn ${photoMode === 'upload' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        >
                          <i className="bi bi-upload me-1"></i> Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhotoMode('url')}
                          className={`btn ${photoMode === 'url' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        >
                          <i className="bi bi-link-45deg me-1"></i> Image URL
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhotoMode('presets')}
                          className={`btn ${photoMode === 'presets' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        >
                          <i className="bi bi-grid-fill me-1"></i> Quick Presets
                        </button>
                      </div>

                      {photoMode === 'upload' && (
                        <div>
                          <label className="btn btn-outline-warning btn-sm w-100 fw-bold">
                            <i className="bi bi-folder-plus me-1"></i> Choose Photo from Device
                            <input
                              type="file"
                              accept="image/*"
                              className="d-none"
                              onChange={handleFileUpload}
                            />
                          </label>
                          <div className="text-secondary mt-1" style={{ fontSize: '0.72rem' }}>
                            Supports PNG, JPG, WebP up to 5MB.
                          </div>
                        </div>
                      )}

                      {photoMode === 'url' && (
                        <div className="input-group input-group-sm">
                          <input
                            type="url"
                            placeholder="https://example.com/my-photo.jpg"
                            className="form-control"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                          />
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleApplyUrl}
                          >
                            Apply
                          </button>
                        </div>
                      )}

                      {photoMode === 'presets' && (
                        <div className="d-flex flex-wrap gap-2">
                          {PRESET_AVATARS.map((p) => (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, avatar: p.url }))}
                              className={`btn btn-sm py-1 px-2 ${formData.avatar === p.url ? 'btn-warning' : 'btn-outline-secondary'}`}
                              style={{ fontSize: '0.75rem' }}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small text-secondary fw-bold">Email Address (For Convoy Reminders)</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-envelope-fill"></i></span>
                    <input
                      type="email"
                      placeholder="driver@example.com"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label small text-secondary fw-bold">Create Account Password *</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
                      <input
                        type="password"
                        required
                        placeholder="At least 4 characters"
                        className="form-control"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label small text-secondary fw-bold">Confirm Password *</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-shield-lock-fill"></i></span>
                      <input
                        type="password"
                        required
                        placeholder="Re-enter password"
                        className="form-control"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {passwordError && (
                  <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="p-3 rounded-3 bg-light border mb-3" style={{ borderColor: '#e2e8f0' }}>
                  <div className="form-check form-switch mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="signupStreamerCheck"
                      checked={formData.isStreamer}
                      onChange={(e) => setFormData({ ...formData, isStreamer: e.target.checked })}
                    />
                    <label className="form-check-label fw-bold text-dark small" htmlFor="signupStreamerCheck">
                      <i className="bi bi-camera-video-fill text-danger me-1"></i> Are you a Content Creator or Live Streamer?
                    </label>
                  </div>
                  <p className="small text-secondary mb-0">
                    Check this if you stream ETS 2 or ATS on TikTok, YouTube, Twitch, Kick, or Facebook. Streamers receive the verified <strong>Official Streamer</strong> role and badge on their driver license!
                  </p>

                  {formData.isStreamer && (
                    <div className="row g-2 mt-2 pt-2 border-top" style={{ borderColor: '#cbd5e1' }}>
                      <div className="col-12 col-sm-4">
                        <label className="form-label small text-secondary fw-bold mb-1">Streaming Platform</label>
                        <select
                          className="form-select form-select-sm"
                          value={formData.streamerPlatform}
                          onChange={(e) => setFormData({ ...formData, streamerPlatform: e.target.value })}
                        >
                          <option value="TikTok">TikTok</option>
                          <option value="YouTube">YouTube</option>
                          <option value="Twitch">Twitch</option>
                          <option value="Kick">Kick</option>
                          <option value="Facebook">Facebook Gaming</option>
                        </select>
                      </div>
                      <div className="col-12 col-sm-8">
                        <label className="form-label small text-secondary fw-bold mb-1">Channel URL / Handle</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. https://www.tiktok.com/@bryangaming__"
                          value={formData.streamerUrl}
                          onChange={(e) => setFormData({ ...formData, streamerUrl: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label small text-secondary fw-bold">Country / Nationality</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-globe2"></i></span>
                      <select
                        className="form-select"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      >
                        {countries.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label small text-secondary fw-bold">Primary Truck</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-truck"></i></span>
                      <select
                        className="form-select"
                        value={formData.truck}
                        onChange={(e) => setFormData({ ...formData, truck: e.target.value })}
                      >
                        <option value="Scania S730 V8">Scania S730 / R-Series</option>
                        <option value="Volvo FH16 750">Volvo FH16 750</option>
                        <option value="Mercedes Actros MP4">Mercedes-Benz Actros</option>
                        <option value="MAN TGX Individual">MAN TGX Individual</option>
                        <option value="DAF XG+">DAF XG / XF</option>
                        <option value="Peterbilt 389">Peterbilt 389 (ATS)</option>
                        <option value="Kenworth W900">Kenworth W900 (ATS)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small text-secondary fw-bold">VTC Affiliation or Status</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-buildings-fill"></i></span>
                    <input
                      type="text"
                      placeholder="e.g. Independent Solo Driver, or VTC Name"
                      className="form-control"
                      value={formData.vtc}
                      onChange={(e) => setFormData({ ...formData, vtc: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small text-secondary fw-bold d-block">Simulators Driven</label>
                  <div className="d-flex gap-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="checkETS2"
                        checked={formData.games.includes('ETS 2')}
                        onChange={() => handleGameToggle('ETS 2')}
                      />
                      <label className="form-check-label text-dark small" htmlFor="checkETS2">
                        Euro Truck Simulator 2
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="checkATS"
                        checked={formData.games.includes('ATS')}
                        onChange={() => handleGameToggle('ATS')}
                      />
                      <label className="form-check-label text-dark small" htmlFor="checkATS">
                        American Truck Simulator
                      </label>
                    </div>
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-6">
                    <label className="form-label small text-secondary fw-bold">TruckersMP ID (Optional)</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-hdd-network"></i></span>
                      <input
                        type="text"
                        placeholder="e.g. 1928374"
                        className="form-control"
                        value={formData.tmpId}
                        onChange={(e) => setFormData({ ...formData, tmpId: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label small text-secondary fw-bold">Steam Profile (Optional)</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-steam"></i></span>
                      <input
                        type="text"
                        placeholder="Steam Name or URL"
                        className="form-control"
                        value={formData.steamId}
                        onChange={(e) => setFormData({ ...formData, steamId: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-warning btn-lg w-100 fw-bold shadow-sm mb-3"
                >
                  <i className="bi bi-person-badge-fill me-2"></i>
                  {submitting ? 'Issuing Driver Credentials...' : 'Issue GTC Digital Driver License'}
                </button>

                <div className="text-center small text-secondary">
                  Already registered with GTC?{' '}
                  <a
                    href="#top"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onSignupSuccess) onSignupSuccess();
                    }}
                    className="fw-bold text-decoration-none"
                    style={{ color: '#0284c7' }}
                  >
                    Sign In to Driver Portal &rarr;
                  </a>
                </div>
              </form>
            </div>
          </div>

          <div className="col-12 col-lg-5">
            <span className="badge badge-gold text-uppercase fw-bold mb-3 d-inline-block">
              <i className="bi bi-eye me-1"></i> Live Digital License Preview
            </span>

            <div className="driver-license-card mb-3">
              <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom" style={{ borderColor: '#e2e8f0' }}>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-truck fs-4 text-warning"></i>
                  <div>
                    <div className="fw-extrabold text-dark small lh-1">GLOBAL TRUCKERS COMMUNITY</div>
                    <div className="fw-bold text-uppercase" style={{ fontSize: '0.65rem', color: '#0284c7' }}>
                      VERIFIED DRIVER IDENTIFICATION
                    </div>
                  </div>
                </div>
                <i className="bi bi-patch-check-fill text-warning fs-5"></i>
              </div>

              <div className="row g-3 align-items-center mb-3">
                <div className="col-4 col-sm-3 text-center">
                  <div
                    className="rounded-2 bg-light border d-flex align-items-center justify-content-center overflow-hidden mx-auto shadow-sm"
                    style={{ width: '84px', height: '84px', borderColor: '#0284c7' }}
                  >
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="Driver Photo Preview"
                        className="w-100 h-100 object-fit-cover"
                      />
                    ) : (
                      <i className="bi bi-person fs-1" style={{ color: '#0284c7' }}></i>
                    )}
                  </div>
                  {formData.avatar && (
                    <span className="badge bg-success-subtle text-success mt-1" style={{ fontSize: '0.62rem' }}>
                      <i className="bi bi-check-circle me-1"></i> Photo Set
                    </span>
                  )}
                </div>

                <div className="col-8 col-sm-9">
                  <div className="h5 fw-extrabold text-dark mb-0">{formData.name || 'YOUR CALLSIGN'}</div>
                  <div className="small fw-bold" style={{ color: '#0284c7' }}>VTC: {formData.vtc || 'Independent Solo'}</div>

                  <div className="small text-secondary mt-1">
                    <i className="bi bi-geo-alt me-1"></i> Nationality: <strong className="text-dark">{formData.country}</strong>
                  </div>
                  <div className="small text-secondary">
                    <i className="bi bi-truck me-1"></i> Rig: <strong className="text-dark">{formData.truck}</strong>
                  </div>
                  <div className="small text-secondary">
                    <i className="bi bi-controller me-1"></i> Sims: <strong className="text-dark">{formData.games.join(', ')}</strong>
                  </div>
                  {formData.isStreamer && (
                    <div className="mt-1">
                      <span className="badge text-white rounded-1" style={{ backgroundColor: '#ec4899', fontSize: '0.68rem' }}>
                        <i className="bi bi-camera-video-fill me-1"></i> Official Streamer ({formData.streamerPlatform})
                      </span>
                    </div>
                  )}
                  {formData.isDevModder && (
                    <div className="mt-1">
                      <span className="badge text-white rounded-1" style={{ backgroundColor: '#0284c7', fontSize: '0.68rem' }}>
                        <i className="bi bi-code-slash me-1"></i> Dev | Modder {formData.devSpecialty ? `(${formData.devSpecialty})` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between pt-3 border-top small text-secondary" style={{ borderColor: 'rgba(2, 132, 199, 0.35)' }}>
                <div>
                  <span className="d-block text-uppercase" style={{ fontSize: '0.62rem' }}>License Class</span>
                  <strong style={{ color: '#0284c7' }}>CLASS-A HEAVY HAUL</strong>
                </div>

                <div className="text-end">
                  <span className="d-block text-uppercase" style={{ fontSize: '0.62rem' }}>Status</span>
                  <span className="badge badge-gold small"><i className="bi bi-check-circle-fill me-1"></i> CERTIFIED</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-3 bg-white border small text-secondary shadow-sm" style={{ borderColor: '#e2e8f0' }}>
              <i className="bi bi-shield-lock-fill text-warning me-2"></i>
              <strong>Account Integration:</strong> Upon registration, your profile is immediately active. Your customized photo is rendered on your Digital Driver License and you can log deliveries, view leaderboards and receive personal convoy alerts in your inbox.
            </div>

            <PhotoCustomizerModal
              isOpen={isCustomizerOpen}
              imageSrc={customizerSource}
              onClose={() => setIsCustomizerOpen(false)}
              onSave={(croppedUrl) => {
                setFormData((prev) => ({ ...prev, avatar: croppedUrl }));
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
