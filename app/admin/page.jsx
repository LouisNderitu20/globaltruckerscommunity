'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, ROLE_INFO, ROLES } from '@/lib/authContext';
import { DEFAULT_CONFIG, TIMETABLE_CONVOYS, buildConvoyFromSlot } from '@/lib/defaultConfig';
import DriverAccountModal from '@/components/DriverAccountModal';

export default function AdminDesk() {
  const {
    user,
    role,
    isAdmin,
    allDrivers,
    assignRole,
    toggleDriverRole,
    deleteDriverAccount,
    broadcastConvoyReminder,
    loginAccount,
    showToast
  } = useAuth();

  const [activeTab, setActiveTab] = useState('next-convoy');
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [broadcastTitle, setBroadcastTitle] = useState('Official Convoy Meetup in Progress');
  const [broadcastMsg, setBroadcastMsg] = useState('All drivers to your rigs! Room ID: GTC-CONVOY-778 is active on TruckersMP Sim 1. Radio channel 19.');

  const [searchDriver, setSearchDriver] = useState('');
  const [driverSortBy, setDriverSortBy] = useState('kms-desc');
  const [remoteSignups, setRemoteSignups] = useState([]);
  const [dayFilter, setDayFilter] = useState('ALL');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [mediaList, setMediaList] = useState([]);

  const [newsForm, setNewsForm] = useState({
    id: '',
    title: '',
    badge: 'Community',
    type: 'Official Announcement',
    date: 'October 2026',
    readTime: '3 min read',
    excerpt: '',
    image: '/images/about-trucks.jpg'
  });
  const [editingNewsId, setEditingNewsId] = useState(null);

  const [galleryForm, setGalleryForm] = useState({
    id: '',
    title: '',
    game: 'ETS 2',
    author: 'Bryan Gaming',
    src: '/images/about-trucks.jpg'
  });
  const [editingGalleryId, setEditingGalleryId] = useState(null);

  useEffect(() => {
    async function loadSiteConfig() {
      try {
        const res = await fetch('/api/content', { cache: 'no-store' });
        const json = await res.json();
        if (json?.success && json?.data) {
          setConfig({
            ...DEFAULT_CONFIG,
            ...json.data,
            nextConvoy: { ...DEFAULT_CONFIG.nextConvoy, ...(json.data.nextConvoy || {}) },
            stats: { ...DEFAULT_CONFIG.stats, ...(json.data.stats || {}) },
            planner: { ...DEFAULT_CONFIG.planner, ...(json.data.planner || {}) },
            timetableConvoys: json.data.timetableConvoys || DEFAULT_CONFIG.timetableConvoys,
            news: json.data.news || DEFAULT_CONFIG.news,
            gallery: json.data.gallery || DEFAULT_CONFIG.gallery,
          });
        }
      } catch (e) {
        console.warn('Admin load config fallback:', e);
      } finally {
        setLoading(false);
      }
    }

    async function loadMedia() {
      try {
        const res = await fetch('/api/media');
        const json = await res.json();
        if (json?.success && Array.isArray(json.images)) {
          setMediaList(json.images);
        }
      } catch (e) {}
    }

    async function loadSignups() {
      try {
        const res = await fetch('/api/signup', { cache: 'no-store' });
        const json = await res.json();
        if (json?.success && Array.isArray(json.signups)) {
          setRemoteSignups(json.signups);
        }
      } catch (e) {}
    }

    loadSiteConfig();
    loadMedia();
    loadSignups();
  }, [isAdmin]);

  const handleUploadImage = async (file) => {
    if (!file) return null;
    setUploadingImage(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (json?.success && json?.url) {
        showToast('Image uploaded successfully!', 'success');
        setMediaList((prev) => [
          { name: json.name || file.name, url: json.url, created_at: new Date().toISOString() },
          ...prev
        ]);
        return json.url;
      } else {
        showToast('Upload failed: ' + (json?.error || 'Unknown error'), 'error');
        return null;
      }
    } catch (e) {
      showToast('Upload error: ' + e.message, 'error');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const updateTimetableSlot = (slotIdx, field, val) => {
    setConfig((prev) => {
      const list = [...(prev.timetableConvoys || TIMETABLE_CONVOYS)];
      const updated = { ...list[slotIdx], [field]: val };
      list[slotIdx] = updated;

      const grid = { ...(prev.planner?.grid || {}) };
      const eatHourStr = updated.eatTime ? updated.eatTime.slice(0, 5) : '18:00';
      if (!grid[eatHourStr]) grid[eatHourStr] = {};
      grid[eatHourStr] = {
        ...grid[eatHourStr],
        [updated.dayShort]: {
          game: updated.game,
          detail: updated.detail,
          server: updated.server,
          roomId: updated.roomId
        }
      };

      return {
        ...prev,
        timetableConvoys: list,
        planner: {
          ...(prev.planner || {}),
          grid
        }
      };
    });
  };

  const featureSlotInCard = (slot) => {
    const convoyObj = buildConvoyFromSlot(slot);
    setConfig((prev) => ({
      ...prev,
      nextConvoyOverride: true,
      nextConvoy: {
        ...prev.nextConvoy,
        ...convoyObj
      }
    }));
    showToast(`Featured ${slot.day} ${slot.eatTime} in Next Convoy card!`, 'success');
  };

  const handleResetNextConvoy = () => {
    if (confirm('Reset Next Convoy card to standard timetable schedule?')) {
      setConfig((prev) => ({
        ...prev,
        nextConvoyOverride: false,
        nextConvoy: { ...DEFAULT_CONFIG.nextConvoy }
      }));
      showToast('Next Convoy card reset to timetable defaults.', 'info');
    }
  };

  const handleDeleteMedia = async (item) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        const res = await fetch(`/api/media?name=${encodeURIComponent(item.name)}&path=${encodeURIComponent(item.path || '')}`, { method: 'DELETE' });
        const json = await res.json();
        if (json?.success) {
          setMediaList((prev) => prev.filter((m) => m.name !== item.name && m.url !== item.url));
          showToast('Image deleted from storage', 'info');
        } else {
          showToast('Delete failed: ' + (json?.error || 'Error'), 'error');
        }
      } catch (e) {
        showToast('Delete error: ' + e.message, 'error');
      }
    }
  };

  const handleSaveNews = (e) => {
    e.preventDefault();
    if (!newsForm.title.trim()) {
      showToast('Article title is required', 'error');
      return;
    }

    setConfig((prev) => {
      const currentList = prev.news || [];
      if (editingNewsId) {
        return {
          ...prev,
          news: currentList.map((item) => (item.id === editingNewsId ? { ...newsForm, id: editingNewsId } : item))
        };
      } else {
        const newArticle = {
          ...newsForm,
          id: 'news-' + Date.now()
        };
        return {
          ...prev,
          news: [newArticle, ...currentList]
        };
      }
    });

    showToast(editingNewsId ? 'News article updated!' : 'News article created!', 'success');
    setNewsForm({
      id: '',
      title: '',
      badge: 'Community',
      type: 'Official Announcement',
      date: 'October 2026',
      readTime: '3 min read',
      excerpt: '',
      image: '/images/about-trucks.jpg'
    });
    setEditingNewsId(null);
  };

  const handleEditNews = (item) => {
    setNewsForm(item);
    setEditingNewsId(item.id);
    setActiveTab('news');
  };

  const handleDeleteNews = (id) => {
    if (confirm('Are you sure you want to delete this news article?')) {
      setConfig((prev) => ({
        ...prev,
        news: (prev.news || []).filter((n) => n.id !== id)
      }));
      showToast('Article deleted', 'info');
    }
  };

  const handleSaveGallery = (e) => {
    e.preventDefault();
    if (!galleryForm.title.trim() || !galleryForm.src.trim()) {
      showToast('Photo title and image are required', 'error');
      return;
    }

    setConfig((prev) => {
      const currentList = prev.gallery || [];
      if (editingGalleryId) {
        return {
          ...prev,
          gallery: currentList.map((item) => (item.id === editingGalleryId ? { ...galleryForm, id: editingGalleryId } : item))
        };
      } else {
        const newPhoto = {
          ...galleryForm,
          id: 'g-' + Date.now()
        };
        return {
          ...prev,
          gallery: [newPhoto, ...currentList]
        };
      }
    });

    showToast(editingGalleryId ? 'Gallery screenshot updated!' : 'Screenshot added to gallery!', 'success');
    setGalleryForm({
      id: '',
      title: '',
      game: 'ETS 2',
      author: user?.name || 'Bryan Gaming',
      src: '/images/about-trucks.jpg'
    });
    setEditingGalleryId(null);
  };

  const handleDeleteGallery = (id) => {
    if (confirm('Are you sure you want to remove this screenshot from the gallery?')) {
      setConfig((prev) => ({
        ...prev,
        gallery: (prev.gallery || []).filter((g) => g.id !== id)
      }));
      showToast('Photo removed from gallery', 'info');
    }
  };

  const handleSaveToSupabase = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: config })
      });

      const json = await res.json();
      if (json?.success) {
        setSaveSuccess(true);
        showToast('Published live to Supabase successfully!', 'success');
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        showToast('Publish failed: ' + (json?.error || 'Unknown error'), 'error');
      }
    } catch (err) {
      showToast('Connection error during publish: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleBroadcast = (e) => {
    e.preventDefault();
    broadcastConvoyReminder({
      title: broadcastTitle,
      message: broadcastMsg
    });
  };

  const updateNextConvoyField = (field, val) => {
    setConfig((prev) => ({
      ...prev,
      nextConvoyOverride: true,
      nextConvoy: {
        ...prev.nextConvoy,
        [field]: val
      }
    }));
  };

  const updateNextConvoyTruckField = (field, val) => {
    setConfig((prev) => ({
      ...prev,
      nextConvoyOverride: true,
      nextConvoy: {
        ...prev.nextConvoy,
        truck: {
          ...prev.nextConvoy.truck,
          [field]: val
        }
      }
    }));
  };

  const mergedAdminDrivers = React.useMemo(() => {
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

  const countryBreakdown = React.useMemo(() => {
    const map = {};
    mergedAdminDrivers.forEach((d) => {
      const c = d.country?.trim() || 'International';
      if (!map[c]) map[c] = { name: c, count: 0, drivers: [] };
      map[c].count += 1;
      map[c].drivers.push(d);
    });
    return Object.values(map).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [mergedAdminDrivers]);

  const liveStats = React.useMemo(() => {
    const totalMembers = mergedAdminDrivers.length;
    const countriesCount = countryBreakdown.length;
    const staffOnline = mergedAdminDrivers.filter((d) => {
      const roles = d.roles && d.roles.length > 0 ? d.roles : [d.role || 'driver'];
      return roles.some((r) => ['admin', 'staff', 'convoy_lead', 'dispatcher', 'dev_modder'].includes(r));
    }).length;
    const driversOnline = mergedAdminDrivers.filter((d) => {
      const roles = d.roles && d.roles.length > 0 ? d.roles : [d.role || 'driver'];
      return roles.includes('driver') || roles.includes('streamer') || !roles.length;
    }).length;
    const kmsCovered = mergedAdminDrivers.reduce((acc, d) => acc + (Number(d.kms) || 0), 0);
    const deliveriesCompleted = mergedAdminDrivers.reduce((acc, d) => acc + (Number(d.deliveries) || 0), 0);

    return {
      totalMembers,
      countriesCount,
      staffOnline,
      driversOnline,
      kmsCovered,
      deliveriesCompleted
    };
  }, [mergedAdminDrivers, countryBreakdown]);

  const filteredDrivers = mergedAdminDrivers
    .filter((d) => {
      const q = searchDriver.toLowerCase().trim();
      if (!q) return true;
      return (
        d.name?.toLowerCase().includes(q) ||
        d.id?.toLowerCase().includes(q) ||
        (d.vtc && d.vtc.toLowerCase().includes(q)) ||
        (d.country && d.country.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (driverSortBy === 'kms-desc') return (Number(b.kms) || 0) - (Number(a.kms) || 0);
      if (driverSortBy === 'kms-asc') return (Number(a.kms) || 0) - (Number(b.kms) || 0);
      if (driverSortBy === 'jobs-desc') return (Number(b.deliveries) || 0) - (Number(a.deliveries) || 0);
      if (driverSortBy === 'jobs-asc') return (Number(a.deliveries) || 0) - (Number(b.deliveries) || 0);
      if (driverSortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      if (driverSortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '');
      if (driverSortBy === 'role') return (a.role || '').localeCompare(b.role || '');
      if (driverSortBy === 'id') return (a.id || '').localeCompare(b.id || '');
      return 0;
    });

  if (!isAdmin) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center p-3" style={{ background: '#f8fafc' }}>
        <div className="card glass p-4 p-md-5 shadow-lg text-center" style={{ maxWidth: '460px', width: '100%', borderColor: '#ef4444' }}>
          <div className="rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-3 mx-auto" style={{ width: '70px', height: '70px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <i className="bi bi-shield-lock-fill fs-1"></i>
          </div>
          <h2 className="h4 fw-bold text-dark mb-2">Administrator Access Required</h2>
          <p className="text-secondary small mb-4">
            The GTC CMS Content Desk is strictly restricted to verified <strong>Administrator</strong> accounts. Passcode bypasses have been disabled for security.
          </p>

          {user ? (
            <div className="alert alert-warning small text-start mb-4 py-2 px-3 border-0">
              <i className="bi bi-person-fill-exclamation me-1"></i> Logged in as: <strong>{user.name}</strong> ({user.role || 'Driver'}). This account does not possess Administrator privileges.
            </div>
          ) : (
            <div className="alert alert-secondary small text-start mb-4 py-2 px-3 border-0">
              <i className="bi bi-info-circle me-1"></i> You are currently not signed in. Please sign in with an Administrator credential to manage the community.
            </div>
          )}

          <div className="d-flex flex-column gap-2">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="btn btn-warning w-100 fw-bold shadow-sm"
            >
              <i className="bi bi-box-arrow-in-right me-1"></i> Sign In to Administrator Account
            </button>
            <Link
              href="/"
              className="btn btn-outline-secondary w-100 fw-bold"
            >
              <i className="bi bi-arrow-left me-1"></i> Return to Homepage
            </Link>
          </div>
        </div>

        <DriverAccountModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialTab="signin"
        />
      </div>
    );
  }

  return (
    <div className="min-vh-100 pb-5" style={{ background: '#f8fafc' }}>
      
      <header className="navbar navbar-light bg-white border-bottom px-4 py-2 sticky-top shadow-sm" style={{ borderColor: '#e2e8f0' }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center gap-3">
            <Link href="/" className="text-secondary text-decoration-none small hover-gold">
              &larr; Back to Site
            </Link>
            <div className="vr text-secondary"></div>
            <span className="fw-bold text-dark fs-6">
              <i className="bi bi-award-fill me-1" style={{ color: '#0284c7' }}></i> GTC Content Desk &amp; CMS
            </span>
            <span className="badge badge-gold small">ADMIN MODE</span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              onClick={handleSaveToSupabase}
              disabled={saving}
              className="btn btn-warning btn-sm fw-bold shadow-sm"
            >
              <i className="bi bi-cloud-arrow-up-fill me-1"></i>
              {saving ? 'Publishing...' : 'Save & Publish Live'}
            </button>
          </div>
        </div>
      </header>

      <div className="container mt-4">
        {saveSuccess && (
          <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
            <i className="bi bi-check-circle-fill fs-5"></i>
            <div>Changes successfully published to Supabase database (<code>site_content</code> table)!</div>
          </div>
        )}

        <div className="d-flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveTab('next-convoy')}
            className={`btn btn-sm fw-bold ${activeTab === 'next-convoy' ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={activeTab === 'next-convoy' ? { backgroundColor: '#0284c7', borderColor: '#0284c7' } : {}}
          >
            <i className="bi bi-truck me-1"></i> Next Convoy Card
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`btn btn-sm fw-bold ${activeTab === 'timetable' ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={activeTab === 'timetable' ? { backgroundColor: '#0284c7', borderColor: '#0284c7' } : {}}
          >
            <i className="bi bi-calendar3 me-1"></i> Timetable Editor (21 Runs)
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`btn btn-sm fw-bold ${activeTab === 'news' ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={activeTab === 'news' ? { backgroundColor: '#0284c7', borderColor: '#0284c7' } : {}}
          >
            <i className="bi bi-newspaper me-1"></i> News &amp; Dispatches
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`btn btn-sm fw-bold ${activeTab === 'gallery' ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={activeTab === 'gallery' ? { backgroundColor: '#0284c7', borderColor: '#0284c7' } : {}}
          >
            <i className="bi bi-images me-1"></i> Gallery Showcase
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`btn btn-sm fw-bold ${activeTab === 'media' ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={activeTab === 'media' ? { backgroundColor: '#0284c7', borderColor: '#0284c7' } : {}}
          >
            <i className="bi bi-camera me-1"></i> Media &amp; Visualizer
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`btn btn-sm fw-bold ${activeTab === 'roles' ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={activeTab === 'roles' ? { backgroundColor: '#0284c7', borderColor: '#0284c7' } : {}}
          >
            <i className="bi bi-people-fill me-1"></i> Driver Roles
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`btn btn-sm fw-bold ${activeTab === 'broadcast' ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={activeTab === 'broadcast' ? { backgroundColor: '#0284c7', borderColor: '#0284c7' } : {}}
          >
            <i className="bi bi-megaphone-fill me-1"></i> Broadcast
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`btn btn-sm fw-bold ${activeTab === 'stats' ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={activeTab === 'stats' ? { backgroundColor: '#0284c7', borderColor: '#0284c7' } : {}}
          >
            <i className="bi bi-speedometer2 me-1"></i> Fleet Stats
          </button>
        </div>

        {activeTab === 'next-convoy' && (
          <div className="card glass p-4 p-md-5 shadow-sm">
            <h3 className="h5 fw-bold text-dark mb-1">
              <i className="bi bi-truck me-2" style={{ color: '#0284c7' }}></i> Next Convoy Detailed Card Configuration
            </h3>
            <p className="text-secondary small mb-4">
              Set the map preview, game site, truck specifications, DLC cargo status, waiting card times, and Convoy Room ID.
            </p>

            <div className="p-3 mb-4 rounded-3 bg-light border" style={{ borderColor: '#0284c7' }}>
              <label className="form-label small fw-bold text-dark d-block mb-1">
                <i className="bi bi-calendar-check-fill me-1" style={{ color: '#0284c7' }}></i> Quick Sync with Official Timetable Slot (21 Runs)
              </label>
              <span className="small text-secondary d-block mb-2">
                Select an official weekly schedule run to instantly fill simulator, map DLC, room ID, and departure timings:
              </span>
              <select
                className="form-select form-select-sm"
                style={{ borderColor: '#0284c7' }}
                onChange={(e) => {
                  const idx = parseInt(e.target.value, 10);
                  if (!isNaN(idx) && TIMETABLE_CONVOYS[idx]) {
                    const generated = buildConvoyFromSlot(TIMETABLE_CONVOYS[idx]);
                    setConfig((prev) => ({
                      ...prev,
                      nextConvoy: { ...prev.nextConvoy, ...generated }
                    }));
                    showToast(`Synced with ${TIMETABLE_CONVOYS[idx].day} ${TIMETABLE_CONVOYS[idx].time} slot!`, 'success');
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>-- Select a Timetable Run to Auto-Fill --</option>
                {TIMETABLE_CONVOYS.map((slot, idx) => (
                  <option key={idx} value={idx}>
                    {slot.day} {slot.time} UTC &bull; {slot.game} ({slot.detail}) &bull; {slot.server}
                  </option>
                ))}
              </select>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-12 col-md-6">
                <label className="form-label small text-secondary fw-bold">Convoy Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={config.nextConvoy?.title || ''}
                  onChange={(e) => updateNextConvoyField('title', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small text-secondary fw-bold">Sub-Title / Theme</label>
                <input
                  type="text"
                  className="form-control"
                  value={config.nextConvoy?.subTitle || ''}
                  onChange={(e) => updateNextConvoyField('subTitle', e.target.value)}
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-12 col-md-4">
                <label className="form-label small text-secondary fw-bold">Simulator</label>
                <select
                  className="form-select"
                  value={config.nextConvoy?.game || 'ETS 2'}
                  onChange={(e) => updateNextConvoyField('game', e.target.value)}
                >
                  <option value="ETS 2">Euro Truck Simulator 2</option>
                  <option value="ATS">American Truck Simulator</option>
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small text-secondary fw-bold">Site / Server Being Played On</label>
                <input
                  type="text"
                  className="form-control"
                  value={config.nextConvoy?.site || ''}
                  onChange={(e) => updateNextConvoyField('site', e.target.value)}
                  placeholder="e.g. TruckersMP Simulation 1 or SCS Dedicated"
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold" style={{ color: '#0284c7' }}>
                  <i className="bi bi-key-fill me-1"></i> Convoy Room ID (Editable by Admin)
                </label>
                <input
                  type="text"
                  className="form-control fw-bold"
                  style={{ color: '#0284c7', borderColor: '#0284c7' }}
                  value={config.nextConvoy?.roomId || ''}
                  onChange={(e) => updateNextConvoyField('roomId', e.target.value)}
                  placeholder="e.g. GTC-CONVOY-778"
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-12 col-md-4">
                <label className="form-label small text-secondary fw-bold">Meetup &amp; Staging Time</label>
                <input
                  type="text"
                  className="form-control"
                  value={config.nextConvoy?.meetupTime || ''}
                  onChange={(e) => updateNextConvoyField('meetupTime', e.target.value)}
                  placeholder="e.g. 17:30 UTC"
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small text-secondary fw-bold">Departure ISO Timestamp</label>
                <input
                  type="text"
                  className="form-control"
                  value={config.nextConvoy?.departureTime || ''}
                  onChange={(e) => updateNextConvoyField('departureTime', e.target.value)}
                  placeholder="2026-10-12T18:00:00Z"
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small text-secondary fw-bold">Lead Driver &amp; Radio</label>
                <input
                  type="text"
                  className="form-control"
                  value={config.nextConvoy?.leadDriver || ''}
                  onChange={(e) => updateNextConvoyField('leadDriver', e.target.value)}
                  placeholder="Bryan Gaming (Convoy Lead)"
                />
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-12 col-md-6">
                <label className="form-label small text-secondary fw-bold">Departure Location</label>
                <input
                  type="text"
                  className="form-control"
                  value={config.nextConvoy?.departureLocation || ''}
                  onChange={(e) => updateNextConvoyField('departureLocation', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small text-secondary fw-bold">Destination Location</label>
                <input
                  type="text"
                  className="form-control"
                  value={config.nextConvoy?.destinationLocation || ''}
                  onChange={(e) => updateNextConvoyField('destinationLocation', e.target.value)}
                />
              </div>
            </div>

            <div className="border-top pt-3 mb-4" style={{ borderColor: '#e2e8f0' }}>
              <h4 className="h6 fw-bold text-dark mb-3">
                <i className="bi bi-truck me-1" style={{ color: '#0284c7' }}></i> Truck &amp; Cargo Details
              </h4>
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="form-label small text-secondary fw-bold">Recommended Truck</label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.nextConvoy?.truck?.recommended || ''}
                    onChange={(e) => updateNextConvoyTruckField('recommended', e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label small text-secondary fw-bold">Min Engine Power</label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.nextConvoy?.truck?.minPower || ''}
                    onChange={(e) => updateNextConvoyTruckField('minPower', e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label small text-secondary fw-bold">Livery Guidelines</label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.nextConvoy?.truck?.livery || ''}
                    onChange={(e) => updateNextConvoyTruckField('livery', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="border-top pt-3 mb-4" style={{ borderColor: '#e2e8f0' }}>
              <h4 className="h6 fw-bold text-dark mb-3">
                <i className="bi bi-box-seam me-1 text-warning"></i> Cargo &amp; DLC Cargo Classification
              </h4>
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small text-secondary fw-bold">Cargo Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.nextConvoy?.cargo || ''}
                    onChange={(e) => updateNextConvoyField('cargo', e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-6 d-flex align-items-end">
                  <div className="form-check pb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isDlcCargoCheck"
                      checked={config.nextConvoy?.isDlcCargo || false}
                      onChange={(e) => updateNextConvoyField('isDlcCargo', e.target.checked)}
                    />
                    <label className="form-check-label fw-bold small" htmlFor="isDlcCargoCheck" style={{ color: '#0284c7' }}>
                      Requires DLC Cargo (Heavy Cargo / High Power pack)
                    </label>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small text-secondary fw-bold">DLC Details / Alternatives</label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.nextConvoy?.dlcDetails || ''}
                    onChange={(e) => updateNextConvoyField('dlcDetails', e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small text-secondary fw-bold">Next Convoy Visualizer Map / Picture</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. /images/about-trucks.jpg or uploaded URL"
                      value={config.nextConvoy?.mapImage || ''}
                      onChange={(e) => updateNextConvoyField('mapImage', e.target.value)}
                    />
                    <label className="btn btn-outline-primary mb-0 fw-bold d-flex align-items-center">
                      <i className="bi bi-upload me-1"></i> {uploadingImage ? 'Uploading...' : 'Upload File'}
                      <input
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleUploadImage(file);
                            if (url) updateNextConvoyField('mapImage', url);
                          }
                        }}
                      />
                    </label>
                  </div>
                  {config.nextConvoy?.mapImage && (
                    <div className="mt-2 p-2 bg-light border rounded-2 d-flex align-items-center gap-2">
                      <img
                        src={config.nextConvoy.mapImage}
                        alt="Visualizer preview"
                        className="rounded object-fit-cover border"
                        style={{ width: '64px', height: '42px' }}
                      />
                      <div className="small text-muted text-truncate flex-grow-1">
                        Active visualizer preview
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => updateNextConvoyField('mapImage', '')}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="d-flex flex-column flex-sm-row gap-2">
              <button
                onClick={handleSaveToSupabase}
                disabled={saving}
                className="btn btn-warning flex-grow-1 fw-bold shadow-sm"
              >
                <i className="bi bi-cloud-arrow-up-fill me-1"></i> {saving ? 'Publishing to Database...' : 'Save & Publish Next Convoy Live'}
              </button>
              <button
                type="button"
                onClick={handleResetNextConvoy}
                className="btn btn-outline-secondary fw-bold"
                title="Reset card to standard timetable schedule"
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i> Reset to Timetable
              </button>
            </div>
          </div>
        )}

        {activeTab === 'timetable' && (
          <div className="card glass p-4 p-md-5 shadow-sm border" style={{ borderColor: '#0284c7' }}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 pb-3 border-bottom">
              <div>
                <h3 className="h5 fw-bold text-dark mb-1">
                  <i className="bi bi-calendar3 text-primary me-2"></i> Weekly Timetable Editor (21 Official Runs)
                </h3>
                <p className="text-secondary small mb-0">
                  Edit all 21 weekly convoy slots across Monday through Sunday. Convoys run strictly at <strong>18:00 EAT</strong>, <strong>20:00 EAT</strong>, and <strong>22:00 EAT</strong>.
                </p>
              </div>
              <button
                onClick={handleSaveToSupabase}
                disabled={saving}
                className="btn btn-warning fw-bold shadow-sm"
              >
                <i className="bi bi-cloud-arrow-up-fill me-1"></i> {saving ? 'Publishing...' : 'Save & Publish Timetable Live'}
              </button>
            </div>

            <div className="d-flex flex-wrap gap-2 mb-4">
              {['ALL', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((dayKey) => (
                <button
                  key={dayKey}
                  type="button"
                  onClick={() => setDayFilter(dayKey)}
                  className={`btn btn-sm fw-bold ${dayFilter === dayKey ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={dayFilter === dayKey ? { backgroundColor: '#0284c7', borderColor: '#0284c7' } : {}}
                >
                  {dayKey === 'ALL' ? 'All 21 Runs' : dayKey}
                </button>
              ))}
            </div>

            <div className="row g-3">
              {(config.timetableConvoys || TIMETABLE_CONVOYS)
                .map((slot, idx) => ({ ...slot, originalIndex: idx }))
                .filter((slot) => dayFilter === 'ALL' || slot.dayShort === dayFilter)
                .map((slot) => (
                  <div key={slot.id || slot.originalIndex} className="col-12 col-lg-6 col-xl-4">
                    <div className="p-3 bg-light rounded-2 border h-100 d-flex flex-column justify-content-between shadow-sm">
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="badge bg-dark fw-bold">
                            {slot.day} &bull; Run #{slot.slotNumber}
                          </span>
                          <span className="badge" style={{ backgroundColor: '#0284c7', color: '#fff' }}>
                            <i className="bi bi-clock me-1"></i> {slot.eatTime}
                          </span>
                        </div>

                        <div className="mb-2">
                          <label className="form-label small text-secondary fw-semibold mb-1">Game Platform</label>
                          <select
                            className="form-select form-select-sm fw-bold"
                            value={slot.game || 'ETS 2'}
                            onChange={(e) => updateTimetableSlot(slot.originalIndex, 'game', e.target.value)}
                          >
                            <option value="ETS 2">ETS 2 (Euro Truck Simulator 2)</option>
                            <option value="ATS">ATS (American Truck Simulator)</option>
                          </select>
                        </div>

                        <div className="mb-2">
                          <label className="form-label small text-secondary fw-semibold mb-1">Map DLC &amp; Route Detail</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={slot.detail || ''}
                            onChange={(e) => updateTimetableSlot(slot.originalIndex, 'detail', e.target.value)}
                            placeholder="e.g. Scandinavia DLC | Oslo to Bergen"
                          />
                        </div>

                        <div className="row g-2 mb-2">
                          <div className="col-6">
                            <label className="form-label small text-secondary fw-semibold mb-1">Server</label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={slot.server || ''}
                              onChange={(e) => updateTimetableSlot(slot.originalIndex, 'server', e.target.value)}
                              placeholder="e.g. Sim 1"
                            />
                          </div>
                          <div className="col-6">
                            <label className="form-label small text-secondary fw-semibold mb-1">Room ID</label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={slot.roomId || ''}
                              onChange={(e) => updateTimetableSlot(slot.originalIndex, 'roomId', e.target.value)}
                              placeholder="e.g. GTC-MON-1"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-top mt-2 d-flex justify-content-between align-items-center">
                        <span className="small text-muted">ID: {slot.id}</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-warning fw-bold"
                          onClick={() => featureSlotInCard(slot)}
                          title="Set this slot details as the Next Convoy card"
                        >
                          <i className="bi bi-star-fill me-1"></i> Feature on Card
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="mt-4 pt-3 border-top">
              <button
                onClick={handleSaveToSupabase}
                disabled={saving}
                className="btn btn-warning w-100 fw-bold shadow-sm"
              >
                <i className="bi bi-cloud-arrow-up-fill me-1"></i> {saving ? 'Publishing Changes...' : 'Save & Publish Timetable Live'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <div className="card glass p-4 p-md-5 shadow-sm border" style={{ borderColor: '#0284c7' }}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 pb-3 border-bottom">
              <div>
                <h3 className="h5 fw-bold text-dark mb-1">
                  <i className="bi bi-newspaper text-primary me-2"></i> Community News &amp; Dispatch Articles
                </h3>
                <p className="text-secondary small mb-0">
                  Publish official news, community updates, convoy recaps, and driver notices with custom images.
                </p>
              </div>
              <button
                onClick={handleSaveToSupabase}
                disabled={saving}
                className="btn btn-warning fw-bold shadow-sm"
              >
                <i className="bi bi-cloud-arrow-up-fill me-1"></i> {saving ? 'Publishing...' : 'Save & Publish Live'}
              </button>
            </div>

            <div className="card p-3 p-md-4 mb-4 border bg-light shadow-sm">
              <h4 className="h6 fw-bold text-dark mb-3">
                <i className="bi bi-pencil-square text-primary me-2"></i>
                {editingNewsId ? 'Edit Article' : 'Write New Community Article'}
              </h4>

              <form onSubmit={handleSaveNews}>
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-8">
                    <label className="form-label small text-secondary fw-bold">Article Title</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. GTC Fleet Expansion & Monthly Convoy Trophy"
                      value={newsForm.title}
                      onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label small text-secondary fw-bold">Category Badge</label>
                    <select
                      className="form-select fw-bold"
                      value={newsForm.badge}
                      onChange={(e) => setNewsForm({ ...newsForm, badge: e.target.value })}
                    >
                      <option value="Community">Community</option>
                      <option value="Announcement">Announcement</option>
                      <option value="Update">Update</option>
                      <option value="Convoy">Convoy</option>
                      <option value="Modding">Modding / Dev</option>
                      <option value="Event">Special Event</option>
                    </select>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-4">
                    <label className="form-label small text-secondary fw-bold">Notice Type</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Official Announcement"
                      value={newsForm.type}
                      onChange={(e) => setNewsForm({ ...newsForm, type: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label small text-secondary fw-bold">Date Display</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. October 2026"
                      value={newsForm.date}
                      onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label small text-secondary fw-bold">Read Time</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 3 min read"
                      value={newsForm.readTime}
                      onChange={(e) => setNewsForm({ ...newsForm, readTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small text-secondary fw-bold">Article Excerpt / Story Body</label>
                  <textarea
                    rows={3}
                    required
                    className="form-control"
                    placeholder="Enter the news story or briefing summary..."
                    value={newsForm.excerpt}
                    onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small text-secondary fw-bold">Article Featured Image</label>
                  <div className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Image URL or upload a file directly"
                      value={newsForm.image}
                      onChange={(e) => setNewsForm({ ...newsForm, image: e.target.value })}
                    />
                    <label className="btn btn-outline-primary mb-0 fw-bold d-flex align-items-center">
                      <i className="bi bi-upload me-1"></i> {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleUploadImage(file);
                            if (url) setNewsForm((prev) => ({ ...prev, image: url }));
                          }
                        }}
                      />
                    </label>
                  </div>
                  {newsForm.image && (
                    <div className="d-flex align-items-center gap-2 p-2 bg-white rounded border">
                      <img
                        src={newsForm.image}
                        alt="Article preview"
                        className="rounded object-fit-cover"
                        style={{ width: '80px', height: '50px' }}
                      />
                      <span className="small text-muted text-truncate flex-grow-1">{newsForm.image}</span>
                    </div>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary fw-bold" style={{ backgroundColor: '#0284c7', borderColor: '#0284c7' }}>
                    <i className="bi bi-check2-circle me-1"></i> {editingNewsId ? 'Update Article' : '+ Save Article to News List'}
                  </button>
                  {editingNewsId && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary fw-bold"
                      onClick={() => {
                        setEditingNewsId(null);
                        setNewsForm({
                          id: '',
                          title: '',
                          badge: 'Community',
                          type: 'Official Announcement',
                          date: 'October 2026',
                          readTime: '3 min read',
                          excerpt: '',
                          image: '/images/about-trucks.jpg'
                        });
                      }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>

            <h4 className="h6 fw-bold text-dark mb-3">Published Articles ({(config.news || []).length})</h4>
            <div className="row g-3">
              {(config.news || []).map((item) => (
                <div key={item.id} className="col-12 col-md-6 col-lg-4">
                  <div className="card h-100 border bg-light shadow-sm overflow-hidden d-flex flex-column justify-content-between">
                    <div>
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-100 object-fit-cover"
                          style={{ height: '140px' }}
                        />
                      )}
                      <div className="p-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="badge" style={{ backgroundColor: '#0284c7', color: '#fff' }}>
                            {item.badge}
                          </span>
                          <span className="small text-muted">{item.date}</span>
                        </div>
                        <h5 className="h6 fw-bold text-dark mb-2">{item.title}</h5>
                        <p className="small text-secondary mb-0" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.excerpt}
                        </p>
                      </div>
                    </div>
                    <div className="p-3 pt-0 border-top mt-2 d-flex justify-content-between align-items-center">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary fw-bold"
                        onClick={() => handleEditNews(item)}
                      >
                        <i className="bi bi-pencil me-1"></i> Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger fw-bold"
                        onClick={() => handleDeleteNews(item.id)}
                      >
                        <i className="bi bi-trash me-1"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-top">
              <button
                onClick={handleSaveToSupabase}
                disabled={saving}
                className="btn btn-warning w-100 fw-bold shadow-sm"
              >
                <i className="bi bi-cloud-arrow-up-fill me-1"></i> {saving ? 'Publishing Changes...' : 'Save & Publish All Content Live'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="card glass p-4 p-md-5 shadow-sm border" style={{ borderColor: '#0284c7' }}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 pb-3 border-bottom">
              <div>
                <h3 className="h5 fw-bold text-dark mb-1">
                  <i className="bi bi-images text-primary me-2"></i> Community Gallery Showcase
                </h3>
                <p className="text-secondary small mb-0">
                  Upload and feature member convoy screenshots, rig photography, and community highlights.
                </p>
              </div>
              <button
                onClick={handleSaveToSupabase}
                disabled={saving}
                className="btn btn-warning fw-bold shadow-sm"
              >
                <i className="bi bi-cloud-arrow-up-fill me-1"></i> {saving ? 'Publishing...' : 'Save & Publish Live'}
              </button>
            </div>

            <div className="card p-3 p-md-4 mb-4 border bg-light shadow-sm">
              <h4 className="h6 fw-bold text-dark mb-3">
                <i className="bi bi-cloud-upload text-primary me-2"></i>
                Upload Screenshot to Gallery
              </h4>

              <form onSubmit={handleSaveGallery}>
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-5">
                    <label className="form-label small text-secondary fw-bold">Photo Title / Caption</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Sunset Convoy through Norway Fjords"
                      value={galleryForm.title}
                      onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-3">
                    <label className="form-label small text-secondary fw-bold">Game</label>
                    <select
                      className="form-select fw-bold"
                      value={galleryForm.game}
                      onChange={(e) => setGalleryForm({ ...galleryForm, game: e.target.value })}
                    >
                      <option value="ETS 2">ETS 2</option>
                      <option value="ATS">ATS</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label small text-secondary fw-bold">Driver / Photographer</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Bryan Gaming"
                      value={galleryForm.author}
                      onChange={(e) => setGalleryForm({ ...galleryForm, author: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small text-secondary fw-bold">Screenshot Image</label>
                  <div className="input-group mb-2">
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="Image URL or upload screenshot file directly"
                      value={galleryForm.src}
                      onChange={(e) => setGalleryForm({ ...galleryForm, src: e.target.value })}
                    />
                    <label className="btn btn-outline-primary mb-0 fw-bold d-flex align-items-center">
                      <i className="bi bi-upload me-1"></i> {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleUploadImage(file);
                            if (url) setGalleryForm((prev) => ({ ...prev, src: url }));
                          }
                        }}
                      />
                    </label>
                  </div>
                  {galleryForm.src && (
                    <div className="d-flex align-items-center gap-2 p-2 bg-white rounded border">
                      <img
                        src={galleryForm.src}
                        alt="Gallery preview"
                        className="rounded object-fit-cover"
                        style={{ width: '80px', height: '50px' }}
                      />
                      <span className="small text-muted text-truncate flex-grow-1">{galleryForm.src}</span>
                    </div>
                  )}
                </div>

                <button type="submit" className="btn btn-primary fw-bold" style={{ backgroundColor: '#0284c7', borderColor: '#0284c7' }}>
                  <i className="bi bi-plus-circle-fill me-1"></i> Add Screenshot to Gallery
                </button>
              </form>
            </div>

            <h4 className="h6 fw-bold text-dark mb-3">Current Gallery Items ({(config.gallery || []).length})</h4>
            <div className="row g-3">
              {(config.gallery || []).map((photo) => (
                <div key={photo.id} className="col-12 col-sm-6 col-lg-4">
                  <div className="card h-100 border bg-light shadow-sm overflow-hidden d-flex flex-column justify-content-between">
                    <div>
                      <img
                        src={photo.src}
                        alt={photo.title}
                        className="w-100 object-fit-cover"
                        style={{ height: '160px' }}
                      />
                      <div className="p-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="badge bg-dark">{photo.game}</span>
                          <span className="small text-secondary">by <strong>{photo.author}</strong></span>
                        </div>
                        <h6 className="fw-bold text-dark mb-0">{photo.title}</h6>
                      </div>
                    </div>
                    <div className="p-2 px-3 border-top bg-white d-flex justify-content-between align-items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary fw-bold text-nowrap"
                        onClick={() => {
                          updateNextConvoyField('mapImage', photo.src);
                          showToast('Set as Next Convoy Visualizer Map image!', 'success');
                        }}
                        title="Use this photo in the Next Convoy card"
                      >
                        <i className="bi bi-pin-map-fill me-1"></i> Set as Visualizer
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger fw-bold"
                        onClick={() => handleDeleteGallery(photo.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-top">
              <button
                onClick={handleSaveToSupabase}
                disabled={saving}
                className="btn btn-warning w-100 fw-bold shadow-sm"
              >
                <i className="bi bi-cloud-arrow-up-fill me-1"></i> {saving ? 'Publishing Changes...' : 'Save & Publish Gallery Live'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="card glass p-4 p-md-5 shadow-sm border" style={{ borderColor: '#0284c7' }}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 pb-3 border-bottom">
              <div>
                <h3 className="h5 fw-bold text-dark mb-1">
                  <i className="bi bi-camera text-primary me-2"></i> Media &amp; Site Pictures Hub
                </h3>
                <p className="text-secondary small mb-0">
                  Upload images and assign them with 1-click to the Convoy Visualizer, News, or Gallery.
                </p>
              </div>
              <button
                onClick={handleSaveToSupabase}
                disabled={saving}
                className="btn btn-warning fw-bold shadow-sm"
              >
                <i className="bi bi-cloud-arrow-up-fill me-1"></i> {saving ? 'Publishing...' : 'Save & Publish All Live'}
              </button>
            </div>

            <div className="p-4 rounded-3 border bg-light text-center mb-4 shadow-sm" style={{ borderStyle: 'dashed', borderWidth: '2px', borderColor: '#0284c7' }}>
              <i className="bi bi-cloud-arrow-up-fill display-5 text-primary mb-2"></i>
              <h5 className="fw-bold text-dark mb-1">Upload Site Pictures</h5>
              <p className="text-secondary small mb-3">
                Select JPG, PNG, WebP or GIF images (up to 8MB). Images are stored securely and accessible across all site sections.
              </p>
              <label className="btn btn-primary fw-bold px-4" style={{ backgroundColor: '#0284c7', borderColor: '#0284c7' }}>
                <i className="bi bi-plus-lg me-1"></i> {uploadingImage ? 'Uploading Image...' : 'Choose File to Upload'}
                <input
                  type="file"
                  accept="image/*"
                  className="d-none"
                  disabled={uploadingImage}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      await handleUploadImage(file);
                    }
                  }}
                />
              </label>
            </div>

            <h4 className="h6 fw-bold text-dark mb-3">
              Uploaded Media Library ({mediaList.length} files)
            </h4>

            {mediaList.length === 0 ? (
              <div className="p-4 text-center text-muted bg-light rounded border">
                No uploaded media found yet. Upload a picture above to use it across the site!
              </div>
            ) : (
              <div className="row g-3">
                {mediaList.map((item, idx) => (
                  <div key={item.path || idx} className="col-12 col-sm-6 col-lg-4">
                    <div className="card h-100 border bg-light shadow-sm overflow-hidden d-flex flex-column justify-content-between">
                      <div>
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-100 object-fit-cover"
                          style={{ height: '160px' }}
                        />
                        <div className="p-2 px-3">
                          <div className="small fw-bold text-dark text-truncate">{item.name}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Site file'}
                          </div>
                        </div>
                      </div>

                      <div className="p-2 border-top bg-white d-flex flex-column gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary fw-bold text-start"
                          onClick={() => {
                            updateNextConvoyField('mapImage', item.url);
                            showToast('Selected as Next Convoy Visualizer Map!', 'success');
                          }}
                        >
                          <i className="bi bi-pin-map-fill me-1"></i> Use in Convoy Visualizer
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary fw-bold text-start"
                          onClick={() => {
                            setGalleryForm((prev) => ({ ...prev, src: item.url }));
                            setActiveTab('gallery');
                            showToast('Prefilled image in Gallery Form', 'info');
                          }}
                        >
                          <i className="bi bi-images me-1"></i> Add to Gallery Showcase
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary fw-bold text-start"
                          onClick={() => {
                            setNewsForm((prev) => ({ ...prev, image: item.url }));
                            setActiveTab('news');
                            showToast('Prefilled image in News Form', 'info');
                          }}
                        >
                          <i className="bi bi-newspaper me-1"></i> Use in News Article
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-light border text-start"
                          onClick={() => {
                            navigator.clipboard.writeText(item.url);
                            showToast('Image URL copied to clipboard!', 'info');
                          }}
                        >
                          <i className="bi bi-clipboard me-1"></i> Copy Image URL
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger fw-bold text-start"
                          onClick={() => handleDeleteMedia(item)}
                        >
                          <i className="bi bi-trash me-1"></i> Delete Image
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-3 border-top">
              <button
                onClick={handleSaveToSupabase}
                disabled={saving}
                className="btn btn-warning w-100 fw-bold shadow-sm"
              >
                <i className="bi bi-cloud-arrow-up-fill me-1"></i> {saving ? 'Publishing Changes...' : 'Save & Publish All Live'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="card glass p-4 p-md-5 shadow-sm">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
              <div>
                <h3 className="h5 fw-bold text-dark mb-0">
                  <i className="bi bi-people-fill text-primary me-2"></i> Driver Roster &amp; Role Management
                </h3>
                <p className="text-secondary small mb-0">Assign roles to member accounts: Driver, Dispatcher, Convoy Lead, Staff, and Admin.</p>
              </div>

              <div className="d-flex align-items-center gap-2 flex-wrap">
                <input
                  type="text"
                  placeholder="Search callsign, ID or VTC..."
                  className="form-control form-control-sm w-auto"
                  value={searchDriver}
                  onChange={(e) => setSearchDriver(e.target.value)}
                />
                <select
                  className="form-select form-select-sm w-auto fw-bold"
                  value={driverSortBy}
                  onChange={(e) => setDriverSortBy(e.target.value)}
                >
                  <option value="kms-desc">Distance: Highest First</option>
                  <option value="kms-asc">Distance: Lowest First</option>
                  <option value="jobs-desc">Jobs: Highest First</option>
                  <option value="jobs-asc">Jobs: Lowest First</option>
                  <option value="name-asc">Callsign: A to Z</option>
                  <option value="name-desc">Callsign: Z to A</option>
                  <option value="role">Sort by Role</option>
                  <option value="id">Sort by ID</option>
                </select>
              </div>
            </div>

            <div className="d-flex flex-column gap-3">
              {filteredDrivers.map((driver) => (
                <div key={driver.id} className="p-3 rounded-2 bg-light border d-flex flex-wrap align-items-center justify-content-between gap-3 shadow-sm" style={{ borderColor: '#0284c7' }}>
                  <div className="d-flex align-items-center gap-3">
                    {driver.avatar ? (
                      <img
                        src={driver.avatar}
                        alt={driver.name}
                        className="rounded-circle object-fit-cover border shadow-sm"
                        style={{ width: '42px', height: '42px', borderColor: '#0284c7' }}
                      />
                    ) : (
                      <div className="rounded-circle d-flex align-items-center justify-content-center p-2 fs-5" style={{ width: '42px', height: '42px', backgroundColor: '#0284c7', color: '#ffffff' }}>
                        <i className="bi bi-person-fill"></i>
                      </div>
                    )}
                    <div>
                      <div className="fw-bold text-dark">
                        {driver.name} <span className="text-secondary small">({driver.id})</span>
                      </div>
                      <div className="small text-secondary">
                        VTC: <strong className="text-dark">{driver.vtc}</strong> &bull; Distance: <strong style={{ color: '#0284c7' }}>{(driver.kms || 0).toLocaleString()} km</strong> &bull; Jobs: <strong className="text-success">{driver.deliveries || 0}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex flex-column gap-2 align-items-start align-items-md-end">
                    <div className="d-flex align-items-center gap-1 flex-wrap">
                      <span className="small text-secondary fw-semibold me-1">Roles:</span>
                      {[
                        { key: 'driver', label: 'Driver', color: '#10b981' },
                        { key: 'streamer', label: 'Streamer', color: '#ec4899' },
                        { key: 'dev_modder', label: 'Dev | Modder', color: '#0284c7' },
                        { key: 'dispatcher', label: 'Dispatcher', color: '#0ea5e9' },
                        { key: 'convoy_lead', label: 'Convoy Lead', color: '#f59e0b' },
                        { key: 'staff', label: 'Staff', color: '#a855f7' },
                        { key: 'admin', label: 'Admin', color: '#ef4444' }
                      ].map(({ key: rKey, label: rLabel, color: rColor }) => {
                        const driverRoles = driver.roles && driver.roles.length > 0 ? driver.roles : [driver.role || 'driver'];
                        const isActive = driverRoles.includes(rKey);

                        return (
                          <button
                            key={rKey}
                            type="button"
                            onClick={() => toggleDriverRole(driver.id, rKey)}
                            className={`btn btn-sm py-0 px-2 fw-bold transition ${isActive ? 'text-white shadow-sm' : 'btn-outline-secondary'}`}
                            style={{
                              fontSize: '0.72rem',
                              backgroundColor: isActive ? rColor : 'transparent',
                              borderColor: isActive ? rColor : '#cbd5e1',
                              color: isActive ? (rKey === 'convoy_lead' ? '#0f172a' : '#ffffff') : '#64748b'
                            }}
                            title={`Toggle ${rLabel} role for ${driver.name}`}
                          >
                            {isActive ? `✓ ${rLabel}` : `+ ${rLabel}`}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger fw-bold ms-2 py-0 px-2"
                        style={{ fontSize: '0.72rem' }}
                        onClick={() => {
                          if (confirm(`Remove driver ${driver.name} (${driver.id}) from the system?`)) {
                            deleteDriverAccount(driver.id);
                          }
                        }}
                        title="Delete driver from system"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'broadcast' && (
          <div className="card glass p-4 p-md-5 shadow-sm mx-auto" style={{ maxWidth: '720px' }}>
            <h3 className="h5 fw-bold text-dark mb-1">
              <i className="bi bi-megaphone-fill text-warning me-2"></i> Broadcast Convoy Reminder to All Accounts
            </h3>
            <p className="text-secondary small mb-4">
              Push an instant alert into all member account inboxes and send simulated email notifications.
            </p>

            <form onSubmit={handleBroadcast}>
              <div className="mb-3">
                <label className="form-label small text-secondary fw-bold">Notification Alert Headline</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small text-secondary fw-bold">Reminder Message Body &amp; Instructions</label>
                <textarea
                  rows={4}
                  required
                  className="form-control"
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-warning w-100 fw-bold shadow-sm">
                <i className="bi bi-broadcast me-1"></i> Send Broadcast to All Member Accounts &amp; Emails
              </button>
            </form>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="card glass p-4 p-md-5 shadow-sm">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
              <div>
                <h3 className="h5 fw-bold text-dark mb-1">
                  <i className="bi bi-shield-check text-success me-2"></i> Verified Community Fleet Telemetry
                </h3>
                <p className="text-secondary small mb-0">
                  Real-time statistics computed directly from all registered members, verified deliveries, and active haul logs.
                </p>
              </div>
              <div className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-bold">
                <i className="bi bi-lock-fill me-1"></i> Data Source: Read-Only Live Database
              </div>
            </div>

            <div className="alert alert-info d-flex align-items-center gap-2 mb-4" role="alert" style={{ backgroundColor: '#f0f9ff', borderColor: '#bae6fd', color: '#0369a1' }}>
              <i className="bi bi-info-circle-fill fs-5"></i>
              <div className="small">
                <strong>Authenticity Protected:</strong> Manual editing of fleet statistics is permanently disabled. All metrics, nationality counts, and distance totals are automatically calculated from live user accounts and verified driver log hauls to ensure 100% truthful data.
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-12 col-sm-6 col-md-4">
                <div className="p-3 bg-white rounded border shadow-sm h-100">
                  <div className="text-secondary small fw-bold text-uppercase">Total Community Members</div>
                  <div className="fs-3 fw-bold text-dark my-1">{liveStats.totalMembers}</div>
                  <div className="small text-muted">All registered drivers &amp; staff</div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-md-4">
                <div className="p-3 bg-white rounded border shadow-sm h-100">
                  <div className="text-secondary small fw-bold text-uppercase">Drivers Online</div>
                  <div className="fs-3 fw-bold text-primary my-1">{liveStats.driversOnline}</div>
                  <div className="small text-muted">Active haulers &amp; streamers</div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-md-4">
                <div className="p-3 bg-white rounded border shadow-sm h-100">
                  <div className="text-secondary small fw-bold text-uppercase">Staff on Radio</div>
                  <div className="fs-3 fw-bold text-danger my-1">{liveStats.staffOnline}</div>
                  <div className="small text-muted">Leads, dispatchers &amp; admins</div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-md-4">
                <div className="p-3 bg-white rounded border shadow-sm h-100">
                  <div className="text-secondary small fw-bold text-uppercase">Countries Represented</div>
                  <div className="fs-3 fw-bold text-info my-1">{liveStats.countriesCount}</div>
                  <div className="small text-muted">Global nationalities verified</div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-md-4">
                <div className="p-3 bg-white rounded border shadow-sm h-100">
                  <div className="text-secondary small fw-bold text-uppercase">Total Fleet Distance</div>
                  <div className="fs-3 fw-bold my-1" style={{ color: '#0284c7' }}>
                    {liveStats.kmsCovered.toLocaleString()} <span className="fs-6 text-secondary">km</span>
                  </div>
                  <div className="small text-muted">Sum of verified driver logs</div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-md-4">
                <div className="p-3 bg-white rounded border shadow-sm h-100">
                  <div className="text-secondary small fw-bold text-uppercase">Deliveries Completed</div>
                  <div className="fs-3 fw-bold text-success my-1">{liveStats.deliveriesCompleted.toLocaleString()}</div>
                  <div className="small text-muted">Total cargo consignments</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded border shadow-sm">
              <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                <h4 className="h6 fw-bold text-dark mb-0">
                  <i className="bi bi-globe me-2 text-primary"></i> Live Member Nations Breakdown ({countryBreakdown.length})
                </h4>
                <span className="small text-secondary">Dynamically grouped by registered country</span>
              </div>

              <div className="row g-2">
                {countryBreakdown.map((item) => (
                  <div key={item.name} className="col-12 col-sm-6 col-md-4 col-lg-3">
                    <div className="p-2 px-3 rounded border bg-light d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-geo-alt-fill text-primary"></i>
                        <span className="fw-semibold text-dark small">{item.name}</span>
                      </div>
                      <span className="badge bg-primary rounded-pill px-2 py-1">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <DriverAccountModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab="signin"
      />
    </div>
  );
}
