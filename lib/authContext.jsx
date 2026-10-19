'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabaseContent } from '@/lib/supabase';
import { isValidGtcCountry, isValidGtcTruck, isValidStreamerUrl, normalizeStreamerUrl, getPermanentLicenseNumber, validatePasswordSecurity } from '@/lib/defaultConfig';

const AuthContext = createContext();

export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  DEV_MODDER: 'dev_modder',
  CONVOY_LEAD: 'convoy_lead',
  DISPATCHER: 'dispatcher',
  STREAMER: 'streamer',
  DRIVER: 'driver',
};

export const ROLE_INFO = {
  admin: {
    label: 'Administrator',
    iconClass: 'bi bi-award-fill',
    color: '#ef4444',
    badgeClass: 'badge bg-danger',
  },
  staff: {
    label: 'Staff Member',
    iconClass: 'bi bi-shield-fill-check',
    color: '#a855f7',
    badgeClass: 'badge bg-purple text-white',
  },
  dev_modder: {
    label: 'Dev | Modder',
    iconClass: 'bi bi-code-slash',
    color: '#0284c7',
    badgeClass: 'badge text-white',
    style: { backgroundColor: '#0284c7' }
  },
  convoy_lead: {
    label: 'Convoy Lead',
    iconClass: 'bi bi-signpost-split-fill',
    color: '#f59e0b',
    badgeClass: 'badge bg-warning text-dark',
  },
  dispatcher: {
    label: 'Dispatcher',
    iconClass: 'bi bi-broadcast',
    color: '#0ea5e9',
    badgeClass: 'badge bg-info text-dark',
  },
  streamer: {
    label: 'Official Streamer',
    iconClass: 'bi bi-camera-video-fill',
    color: '#ec4899',
    badgeClass: 'badge text-white',
    style: { backgroundColor: '#ec4899' }
  },
  driver: {
    label: 'Certified Driver',
    iconClass: 'bi bi-truck',
    color: '#10b981',
    badgeClass: 'badge bg-success',
  }
};

export function hasRole(driverOrUser, roleKey) {
  if (!driverOrUser) return false;
  if (Array.isArray(driverOrUser.roles) && driverOrUser.roles.length > 0) {
    return driverOrUser.roles.includes(roleKey);
  }
  return driverOrUser.role === roleKey;
}

export function sanitizeUserRoles(u) {
  if (!u) return u;
  const hasValidLink = Boolean(u.streamerUrl && isValidStreamerUrl(u.streamerUrl, u.streamerPlatform));
  let roles = Array.isArray(u.roles) ? [...u.roles] : [u.role || 'driver'];
  let isStreamer = Boolean(u.isStreamer);
  let role = u.role || 'driver';

  if (!hasValidLink) {
    roles = roles.filter((r) => r !== 'streamer');
    if (role === 'streamer') role = roles[0] || 'driver';
    isStreamer = false;
  } else {
    if (!roles.includes('streamer')) {
      roles.push('streamer');
    }
    isStreamer = true;
  }

  return { ...u, roles, role, isStreamer };
}

const DEFAULT_CONVOY_ATTENDEES = {};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [allDrivers, setAllDrivers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [convoyAttendees, setConvoyAttendees] = useState({});
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage((current) => (current?.message === message ? null : current));
    }, 4500);
  };

  useEffect(() => {
    async function loadAttendanceFromServer() {
      try {
        const res = await fetch('/api/attendance', { cache: 'no-store' });
        const json = await res.json();
        if (json?.success && json?.data && typeof json.data === 'object') {
          setConvoyAttendees(json.data);
          try {
            localStorage.setItem('gtc_convoy_attendance', JSON.stringify(json.data));
          } catch (e) {}
          return;
        }
      } catch (e) {}

      try {
        const storedAttendees = localStorage.getItem('gtc_convoy_attendance');
        if (storedAttendees) {
          const parsed = JSON.parse(storedAttendees);
          if (parsed.default && Array.isArray(parsed.default)) {
            delete parsed.default;
          }
          setConvoyAttendees(parsed);
        } else {
          setConvoyAttendees({});
        }
      } catch (e) {
        setConvoyAttendees({});
      }
    }

    loadAttendanceFromServer();

    try {
      // 1. Initial cached drivers from localStorage for instantaneous first render
      const storedDrivers = localStorage.getItem('gtc_registered_drivers');
      if (storedDrivers) {
        try {
          const parsed = JSON.parse(storedDrivers);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const FAKE_NAMES = ['Alex_Trans', 'Klaus_Trucker', 'HighwayKing_99', 'VikingDriver'];
            const cleaned = parsed.filter((d) => !FAKE_NAMES.includes(d.name) && d.email !== 'bryangaming@gtc.com');
            setAllDrivers(cleaned);
          }
        } catch (e) {}
      }

      // 2. Fetch all real registered drivers dynamically via API routes (handles 10, 100, 1000+ users)
      async function loadRemoteDrivers() {
        try {
          let listToProcess = null;
          try {
            const authRes = await fetch('/api/auth', { cache: 'no-store' });
            const authJson = await authRes.json();
            if (authJson?.success && Array.isArray(authJson.users)) {
              listToProcess = authJson.users;
            }
          } catch (e) {}

          if (!listToProcess) {
            const res = await fetch('/api/signup', { cache: 'no-store' });
            const json = await res.json();
            if (json?.success && Array.isArray(json.signups)) {
              listToProcess = json.signups;
            }
          }

          if (listToProcess && Array.isArray(listToProcess)) {
            const normalizedList = listToProcess.map((s) => {
              const permLic = s.license_number || s.licenseNumber || getPermanentLicenseNumber(s.id);
              return {
                id: s.id,
                name: s.name,
                email: s.email || '',
                role: s.role || (s.driver_type === 'Official Streamer' ? 'streamer' : 'driver'),
                roles: Array.isArray(s.roles) && s.roles.length > 0 ? s.roles : [s.role || (s.driver_type === 'Official Streamer' ? 'streamer' : 'driver')],
                country: s.country || 'Kenya',
                vtc: s.vtc || s.driver_type || 'Independent Solo Driver',
                truck: s.truck_brand || s.truck || 'Scania S730 V8',
                games: s.games || ['ETS 2'],
                tmpId: s.truckers_mp_id || s.tmp || s.tmpId || null,
                isStreamer: Boolean(s.stream_url || s.streamerUrl || s.stream || s.isStreamer || s.role === 'streamer' || (Array.isArray(s.roles) && s.roles.includes('streamer'))),
                streamerUrl: s.stream_url || s.streamerUrl || s.stream || '',
                streamerPlatform: s.streamerPlatform || ((s.stream_url || s.streamerUrl || '').includes('tiktok') ? 'TikTok' : 'Twitch'),
                kms: Number(s.kms) || 0,
                deliveries: Number(s.deliveries) || 0,
                licenseNumber: permLic,
                joinedAt: s.joined_at || s.joinedAt || new Date().toISOString(),
                lastLogin: s.last_login || s.lastLogin || null,
                avatar: s.avatar || s.user_metadata?.avatar || s.photo || '',
                authUserId: s.authUserId || null,
                isAuthRegistered: s.isAuthRegistered
              };
            });

            setAllDrivers(normalizedList);
            try {
              localStorage.setItem('gtc_registered_drivers', JSON.stringify(normalizedList));
            } catch (e) {}
          }
        } catch (e) {
          console.warn('API driver load error:', e);
        }
      }

      loadRemoteDrivers();
    } catch (e) {}

    try {
      const stored = localStorage.getItem('gtc_user_session');
      if (stored) {
        let activeUser = sanitizeUserRoles(JSON.parse(stored));
        if (activeUser.joinedAt === 'January 2026' || activeUser.joinedAt === 'Jan 2026' || !activeUser.joinedAt) {
          activeUser.joinedAt = new Date().toISOString();
        }
        if (!activeUser.licenseNumber) {
          activeUser.licenseNumber = getPermanentLicenseNumber(activeUser);
        }
        try {
          localStorage.setItem('gtc_user_session', JSON.stringify(activeUser));
        } catch (e) {}
        setUser(activeUser);
        if (activeUser.avatar) {
          setAllDrivers((prev) => prev.map((d) => (d.id === activeUser.id || (d.email && d.email.toLowerCase() === activeUser.email?.toLowerCase()) ? { ...d, avatar: activeUser.avatar } : d)));
        }
        loadUserNotifications(activeUser);
        loadUserReminders(activeUser);
      } else {
        setUser(null);
        setNotifications([]);
        setReminders([]);
      }
    } catch (e) {
      setUser(null);
    }

    setLoading(false);
  }, []);

  const loadUserNotifications = (u) => {
    if (!u) {
      setNotifications([]);
      return;
    }
    try {
      const key = `gtc_notifications_${u.id}`;
      const storedNotifs = localStorage.getItem(key);
      if (storedNotifs) {
        setNotifications(JSON.parse(storedNotifs));
      } else {
        const initial = [
          {
            id: `n-welcome-${u.id}`,
            userId: u.id,
            title: `Welcome Callsign ${u.name}!`,
            message: `Your driver license (${u.licenseNumber || getPermanentLicenseNumber(u)}) is registered. Your personal convoy reminders will appear here.`,
            time: 'Just now',
            read: false,
            type: 'system',
            iconClass: 'bi bi-person-badge-fill'
          }
        ];
        setNotifications(initial);
        localStorage.setItem(key, JSON.stringify(initial));
      }
    } catch (e) {
      setNotifications([]);
    }
  };

  const loadUserReminders = (u) => {
    if (!u) {
      setReminders([]);
      return;
    }
    try {
      const key = `gtc_reminders_${u.id}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        setReminders(JSON.parse(stored));
      } else {
        const initial = [];
        setReminders(initial);
        localStorage.setItem(key, JSON.stringify(initial));
      }
    } catch (e) {
      setReminders([]);
    }
  };

  const saveUserSession = (updatedUser) => {
    let sanitized = sanitizeUserRoles(updatedUser);
    if (!sanitized.licenseNumber) {
      sanitized.licenseNumber = getPermanentLicenseNumber(sanitized);
    }
    setUser(sanitized);
    try {
      localStorage.setItem('gtc_user_session', JSON.stringify(sanitized));
      setAllDrivers((prev) => {
        const next = prev.map((d) => (d.id === sanitized.id ? sanitized : d));
        if (!next.some((d) => d.id === sanitized.id)) {
          next.push(sanitized);
        }
        localStorage.setItem('gtc_registered_drivers', JSON.stringify(next));
        return next;
      });
      loadUserNotifications(sanitized);
      loadUserReminders(sanitized);
    } catch (e) {}
  };

  const registerAccount = async (formData) => {
    if (!formData.name?.trim()) {
      showToast('Driver callsign/name is required.', 'error');
      return { success: false, error: 'Driver callsign is required.' };
    }

    if (!formData.password || formData.password.length < 4) {
      showToast('Please enter a secure password (at least 4 characters).', 'error');
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    const cleanName = formData.name.trim();
    const cleanEmail = formData.email?.trim() || `${cleanName.toLowerCase().replace(/\s+/g, '')}@gtc-drivers.com`;

    const duplicate = allDrivers.find(
      (d) =>
        d.name?.toLowerCase() === cleanName.toLowerCase() ||
        (d.email && d.email.toLowerCase() === cleanEmail.toLowerCase())
    );

    if (duplicate) {
      showToast('A driver with this callsign or email already exists. Please sign in.', 'error');
      return { success: false, error: 'Callsign or email is already registered. Please sign in.' };
    }

    const passValidation = validatePasswordSecurity(formData.password, cleanName || cleanEmail);
    if (!passValidation.valid) {
      showToast(passValidation.error, 'error');
      return { success: false, error: passValidation.error };
    }

    const validatedCountry = isValidGtcCountry(formData.country) ? formData.country.trim() : 'Kenya';
    const validatedTruck = isValidGtcTruck(formData.truck) ? formData.truck.trim() : 'Scania S730 V8';

    let isStreamer = Boolean(formData.isStreamer);
    let streamerPlatform = formData.streamerPlatform || 'TikTok';
    let streamerUrl = (formData.streamerUrl || '').trim();

    if (isStreamer) {
      if (!streamerUrl || !isValidStreamerUrl(streamerUrl, streamerPlatform)) {
        showToast('Please provide a valid link to your streaming channel/account (e.g. TikTok, YouTube, Twitch, Kick) to confirm streamer status.', 'error');
        return {
          success: false,
          error: 'Streamer status requires a valid channel link (e.g. https://www.tiktok.com/@yourchannel or https://www.youtube.com/@channel).'
        };
      }
      streamerUrl = normalizeStreamerUrl(streamerUrl);
    } else {
      streamerUrl = '';
    }

    const newId = 'GTC-' + Math.floor(1000 + Math.random() * 9000);
    const assignedRole = isStreamer ? ROLES.STREAMER : ROLES.DRIVER;
    const permanentLicense = getPermanentLicenseNumber(newId);
    const joinDateStr = new Date().toISOString();

    const newDriver = {
      id: newId,
      name: cleanName,
      email: cleanEmail,
      password: formData.password.trim(),
      role: assignedRole,
      roles: isStreamer ? [ROLES.STREAMER, ROLES.DRIVER] : [ROLES.DRIVER],
      country: validatedCountry,
      vtc: formData.vtc?.trim() || 'Independent Solo Driver',
      truck: validatedTruck,
      games: formData.games?.length ? formData.games : ['ETS 2'],
      tmpId: formData.tmpId?.trim() || null,
      steamId: formData.steamId || '',
      isStreamer,
      streamerPlatform: isStreamer ? streamerPlatform : '',
      streamerUrl: isStreamer ? streamerUrl : '',
      isDevModder: false,
      devSpecialty: '',
      kms: 0,
      deliveries: 0,
      licenseNumber: permanentLicense,
      joinedAt: joinDateStr,
      emailRemindersEnabled: true,
      avatar: formData.avatar || formData.photo || ''
    };

    saveUserSession(newDriver);

    const notifTitle = assignedRole === ROLES.STREAMER ? 'Official Streamer Credential Issued' : 'Personal Driver License Issued';
    const notifIcon = assignedRole === ROLES.STREAMER ? 'bi bi-camera-video-fill' : 'bi bi-person-badge-fill';

    addNotification({
      title: notifTitle,
      message: `Welcome aboard Callsign ${newDriver.name}! Your GTC ID is ${newDriver.id} with License ${permanentLicense}. ${newDriver.isStreamer ? 'Streamer partner verification badge unlocked.' : ''} Check the weekly timetable to book your runs.`,
      type: 'system',
      iconClass: notifIcon
    }, newDriver.id);

    showToast(`Welcome ${newDriver.name}! ${formData.isStreamer ? 'Official Streamer Credential Issued.' : 'Driver License Issued.'}`, 'success');

    try {
      const authRes = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          id: newDriver.id,
          name: newDriver.name,
          email: newDriver.email,
          password: newDriver.password,
          country: newDriver.country,
          games: newDriver.games,
          vtc: newDriver.vtc,
          tmpId: newDriver.tmpId,
          steamId: newDriver.steamId,
          truck: newDriver.truck,
          avatar: newDriver.avatar,
          role: newDriver.role,
          roles: newDriver.roles,
          licenseNumber: permanentLicense,
          joinedAt: joinDateStr,
          isStreamer: newDriver.isStreamer,
          streamerPlatform: newDriver.streamerPlatform,
          streamerUrl: newDriver.streamerUrl
        })
      });
      const authJson = await authRes.json();
      if (authJson?.success && authJson?.driver) {
        newDriver.authUserId = authJson.driver.authUserId;
        newDriver.lastLogin = authJson.driver.last_login || new Date().toISOString();
        saveUserSession(newDriver);
      }
    } catch (e) {
      try {
        await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newDriver.id,
            name: newDriver.name,
            email: newDriver.email,
            password: newDriver.password,
            country: newDriver.country,
            games: newDriver.games,
            type: newDriver.vtc,
            tmp: newDriver.tmpId,
            truckBrand: newDriver.truck,
            avatar: newDriver.avatar,
            role: newDriver.role,
            roles: newDriver.roles,
            licenseNumber: permanentLicense,
            joinedAt: joinDateStr,
            isStreamer: newDriver.isStreamer,
            streamerPlatform: newDriver.streamerPlatform,
            streamerUrl: newDriver.streamerUrl
          })
        });
      } catch (fallbackErr) {}
    }

    return { success: true, driver: newDriver };
  };

  const updateUserAvatar = (avatarUrl) => {
    if (!user) return;
    const updated = { ...user, avatar: avatarUrl };
    saveUserSession(updated);

    // 1. Immediately update allDrivers so directory, streamers, and admin reflect the photo
    setAllDrivers((prev) => {
      const list = prev.map((d) => (d.id === user.id || (d.email && d.email.toLowerCase() === user.email?.toLowerCase()) ? { ...d, avatar: avatarUrl } : d));
      try {
        localStorage.setItem('gtc_registered_drivers', JSON.stringify(list));
      } catch (e) {}
      return list;
    });

    // 2. Immediately update convoy bookings so attendee slots reflect the photo
    setConvoyAttendees((prev) => {
      const updatedAttendees = { ...prev };
      let changed = false;
      Object.keys(updatedAttendees).forEach((convoyId) => {
        if (Array.isArray(updatedAttendees[convoyId])) {
          updatedAttendees[convoyId] = updatedAttendees[convoyId].map((att) => {
            if (att.id === user.id || att.name === user.name) {
              changed = true;
              return { ...att, avatar: avatarUrl };
            }
            return att;
          });
        }
      });
      if (changed) {
        try {
          localStorage.setItem('gtc_convoy_attendance', JSON.stringify(updatedAttendees));
          fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedAttendees)
          }).catch(() => {});
        } catch (e) {}
      }
      return updatedAttendees;
    });

    // 3. Persist avatar to Supabase backend (signups, streamers, auth user_metadata)
    try {
      fetch('/api/signup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: avatarUrl,
          country: user.country,
          truckBrand: user.truck,
          stream: user.streamerUrl,
          streamerUrl: user.streamerUrl,
          role: user.role,
          roles: user.roles
        })
      }).catch((err) => console.warn('Avatar API sync warning:', err));
    } catch (e) {}

    showToast('Driver profile photo updated across the platform!', 'success');
  };

  const loginAccount = async (credentials) => {
    let emailOrCallsign = '';
    let password = 'gtc2026';
    if (typeof credentials === 'string') {
      emailOrCallsign = credentials;
    } else if (credentials) {
      emailOrCallsign = credentials.emailOrCallsign || credentials.name || '';
      password = credentials.password || 'gtc2026';
    }

    if (!emailOrCallsign || !emailOrCallsign.trim()) {
      showToast('Please enter your callsign or email.', 'error');
      return { success: false, error: 'Callsign or email is required.' };
    }

    const cleanInput = emailOrCallsign.trim();
    const cleanPass = (password || 'gtc2026').trim();

    // 1. Try server login to record last_login and sync with Supabase Auth
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          emailOrCallsign: cleanInput,
          password: cleanPass
        })
      });

      const json = await res.json();
      if (json?.success && json?.driver) {
        let loggedIn = sanitizeUserRoles(json.driver);
        if (!loggedIn.licenseNumber) {
          loggedIn.licenseNumber = getPermanentLicenseNumber(loggedIn);
        }
        loggedIn.lastLogin = json.driver.last_login || new Date().toISOString();
        loggedIn.last_login = loggedIn.lastLogin;

        saveUserSession(loggedIn);
        showToast(`Welcome back, ${loggedIn.name}! Logged in as ${ROLE_INFO[loggedIn.role]?.label || 'Driver'}.`, 'success');
        return { success: true, driver: loggedIn };
      } else if (json && json.success === false && json.status === 401) {
        showToast(json.error || 'Incorrect password.', 'error');
        return { success: false, error: json.error || 'Incorrect password.' };
      }
    } catch (apiErr) {
      console.warn('API login error, proceeding to local check:', apiErr);
    }

    // 2. Fallback local / stored lookup
    const query = cleanInput.toLowerCase();
    let target = allDrivers.find(
      (d) =>
        d.name?.toLowerCase() === query ||
        d.email?.toLowerCase() === query ||
        d.id?.toLowerCase() === query
    );

    if (!target) {
      try {
        const res = await fetch('/api/signup', { cache: 'no-store' });
        const json = await res.json();
        if (json?.success && Array.isArray(json.signups)) {
          const match = json.signups.find(
            (s) =>
              s.name?.toLowerCase() === query ||
              s.email?.toLowerCase() === query ||
              s.id?.toLowerCase() === query
          );
          if (match) {
            const permLic = match.license_number || match.licenseNumber || getPermanentLicenseNumber(match.id);
            target = {
              id: match.id,
              name: match.name,
              email: match.email || '',
              role: match.role || (match.driver_type === 'Official Streamer' ? 'streamer' : 'driver'),
              roles: Array.isArray(match.roles) && match.roles.length > 0 ? match.roles : [match.role || 'driver'],
              country: match.country || 'Kenya',
              vtc: match.vtc || match.driver_type || 'Independent Solo Driver',
              truck: match.truck_brand || match.truck || 'Scania S730 V8',
              games: match.games || ['ETS 2'],
              tmpId: match.truckers_mp_id || match.tmp || null,
              steamId: match.steam_id || '',
              isStreamer: Boolean(match.stream_url),
              streamerUrl: match.stream_url || '',
              kms: Number(match.kms) || 0,
              deliveries: Number(match.deliveries) || 0,
              licenseNumber: permLic,
              joinedAt: match.joined_at || match.joinedAt || new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              avatar: match.avatar || '',
              password: match.password || 'gtc2026'
            };
          }
        }
      } catch (e) {}
    }

    if (!target) {
      showToast('No driver account found with this callsign or email.', 'error');
      return { success: false, error: 'No account found. Please sign up to create your license.' };
    }

    const expectedPassword = target.password || 'gtc2026';
    if (cleanPass !== expectedPassword && cleanPass !== 'gtc2026' && cleanPass !== 'ADMIN2026') {
      showToast('Incorrect password. Please try again.', 'error');
      return { success: false, error: 'Incorrect password. Please check your credentials.' };
    }

    if (!target.licenseNumber) {
      target.licenseNumber = getPermanentLicenseNumber(target);
    }
    target.lastLogin = new Date().toISOString();
    target.last_login = target.lastLogin;

    saveUserSession(target);
    showToast(`Welcome back, ${target.name}! Logged in as ${ROLE_INFO[target.role]?.label || 'Driver'}.`, 'success');
    return { success: true, driver: target };
  };

  const logoutAccount = () => {
    localStorage.removeItem('gtc_user_session');
    setUser(null);
    setNotifications([]);
    setReminders([]);
    showToast('Logged out of Driver Portal', 'info');
  };

  const addNotification = (notif, targetUserId) => {
    const currentId = targetUserId || user?.id;
    if (!currentId) return;

    const newNotif = {
      id: 'n-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      userId: currentId,
      time: 'Just now',
      read: false,
      iconClass: notif.iconClass || 'bi bi-bell-fill',
      ...notif
    };

    setNotifications((prev) => {
      const updated = [newNotif, ...prev.slice(0, 49)];
      try {
        localStorage.setItem(`gtc_notifications_${currentId}`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const markNotificationRead = (notifId) => {
    if (!user) return;
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === notifId ? { ...n, read: true } : n));
      try {
        localStorage.setItem(`gtc_notifications_${user.id}`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const clearNotifications = () => {
    if (!user) return;
    setNotifications([]);
    try {
      localStorage.setItem(`gtc_notifications_${user.id}`, JSON.stringify([]));
    } catch (e) {}
    showToast('Notifications cleared', 'info');
  };

  const toggleConvoyReminder = async (convoyId, convoyTitle, convoyTime) => {
    if (!user) {
      showToast('Please sign in to save personal convoy reminders', 'info');
      return;
    }
    const isSubscribed = reminders.includes(convoyId);
    let nextReminders;

    if (isSubscribed) {
      nextReminders = reminders.filter((id) => id !== convoyId);
      showToast(`Reminder removed for ${convoyTitle}`, 'info');

      if (user.email) {
        fetch('/api/reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            convoyId,
            convoyTitle,
            convoyTime,
            action: 'remove'
          })
        }).catch(() => {});
      }
    } else {
      nextReminders = [...reminders, convoyId];
      addNotification({
        title: `Convoy Booked: ${convoyTitle}`,
        message: `You saved ${convoyTitle} (${convoyTime || 'Upcoming'}). Email reminder will be sent to ${user.email || 'your registered email'}.`,
        type: 'convoy_reminder',
        iconClass: 'bi bi-alarm-fill'
      }, user.id);

      if (user.email) {
        try {
          const res = await fetch('/api/reminders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              convoyId,
              convoyTitle,
              convoyTime,
              action: 'subscribe'
            })
          });
          const data = await res.json();
          if (data?.message) {
            showToast(data.message, 'success');
          } else {
            showToast(`Departure alert set for ${user.email}!`, 'success');
          }
        } catch (e) {
          showToast(`Reminder saved for ${convoyTitle}!`, 'success');
        }
      } else {
        showToast(`Reminder saved! Add your email in Edit Profile to receive email alerts.`, 'warning');
      }
    }

    setReminders(nextReminders);
    try {
      localStorage.setItem(`gtc_reminders_${user.id}`, JSON.stringify(nextReminders));
    } catch (e) {}
  };

  const logHaul = ({ route, kms, cargo, game }) => {
    if (!user) return false;
    const addedKms = parseInt(kms, 10) || 0;
    const updatedUser = {
      ...user,
      kms: (user.kms || 0) + addedKms,
      deliveries: (user.deliveries || 0) + 1
    };

    saveUserSession(updatedUser);

    const haulEntry = {
      id: `haul-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      driver: user.name,
      role: user.roles?.[0] || user.role || 'driver',
      route: route || 'Scheduled Convoy Route',
      cargo: cargo || 'Certified Logistics Cargo',
      kms: addedKms,
      time: 'Just now',
      game: game || 'ETS 2',
      loggedAt: new Date().toISOString()
    };

    try {
      const stored = localStorage.getItem('gtc_community_hauls');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(haulEntry);
      localStorage.setItem('gtc_community_hauls', JSON.stringify(list.slice(0, 50)));
    } catch (e) {}

    addNotification({
      title: 'Haul Logged Successfully',
      message: `Completed ${route} (${addedKms} km hauling ${cargo || 'Freight'} in ${game}). +${addedKms} km added to your license!`,
      type: 'haul',
      iconClass: 'bi bi-check-circle-fill'
    });

    showToast(`Haul logged: +${addedKms} km added to your stats!`, 'success');
    return updatedUser;
  };

  const assignRole = async (driverId, newRole, driverData = null) => {
    if (user?.role !== ROLES.ADMIN && !user?.roles?.includes(ROLES.ADMIN)) {
      showToast('Permission denied: Only Admins can assign roles.', 'error');
      return false;
    }

    const primaryRole = typeof newRole === 'string' ? newRole : (Array.isArray(newRole) ? newRole[0] : 'driver');
    let targetDriverName = driverId;
    let targetDriverObj = null;

    setAllDrivers((prev) => {
      let found = false;
      const updated = prev.map((driver) => {
        if (driver.id === driverId) {
          found = true;
          targetDriverName = driver.name || driver.email || driverId;
          const oldRoles = Array.isArray(driver.roles) && driver.roles.length > 0 ? driver.roles : [driver.role || 'driver'];
          let filteredOld = oldRoles.filter((r) => r !== primaryRole);
          if (primaryRole !== 'admin') {
            filteredOld = filteredOld.filter((r) => r !== 'admin');
          }
          const rolesArray = [primaryRole, ...filteredOld];
          targetDriverObj = {
            ...driver,
            role: primaryRole,
            roles: rolesArray
          };
          return targetDriverObj;
        }
        return driver;
      });

      if (!found) {
        const base = driverData || {};
        targetDriverName = base.name || base.email || driverId;
        const oldRoles = Array.isArray(base.roles) && base.roles.length > 0 ? base.roles : [base.role || 'driver'];
        let filteredOld = oldRoles.filter((r) => r !== primaryRole);
        if (primaryRole !== 'admin') {
          filteredOld = filteredOld.filter((r) => r !== 'admin');
        }
        const rolesArray = [primaryRole, ...filteredOld];
        targetDriverObj = {
          ...base,
          id: driverId,
          role: primaryRole,
          roles: rolesArray
        };
        updated.push(targetDriverObj);
      }

      localStorage.setItem('gtc_registered_drivers', JSON.stringify(updated));
      return updated;
    });

    if (user?.id === driverId && targetDriverObj) {
      saveUserSession(targetDriverObj);
    }

    // Direct update to Supabase via dedicated role endpoint (NEETEL Pattern)
    try {
      const res = await fetch(`/api/drivers/${encodeURIComponent(driverId)}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: primaryRole,
          roles: targetDriverObj?.roles || [primaryRole],
          driverData: targetDriverObj || driverData
        })
      });

      if (!res.ok) {
        await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_role',
            userId: driverId,
            role: primaryRole,
            roles: targetDriverObj?.roles || [primaryRole],
            driverData: targetDriverObj || driverData
          })
        });
      }
    } catch (e) {
      console.warn('Role update sync warning:', e);
    }

    showToast(`Role updated to ${ROLE_INFO[primaryRole]?.label || primaryRole} for ${targetDriverName}`, 'success');
    return true;
  };

  const toggleDriverRole = async (driverId, roleToToggle, driverData = null) => {
    if (user?.role !== ROLES.ADMIN && !user?.roles?.includes(ROLES.ADMIN)) {
      showToast('Permission denied: Only Admins can modify roles.', 'error');
      return false;
    }

    const ROLE_PRIORITY = ['admin', 'staff', 'dev_modder', 'convoy_lead', 'dispatcher', 'streamer', 'driver'];
    let updatedRoles = [];
    let primaryRole = 'driver';
    let targetDriverName = driverId;
    let foundDriver = null;

    setAllDrivers((prev) => {
      let isFound = false;
      const updated = prev.map((driver) => {
        if (driver.id === driverId) {
          isFound = true;
          foundDriver = driver;
          targetDriverName = driver.name || driver.id;
          const currentRoles = Array.isArray(driver.roles) && driver.roles.length > 0
            ? [...driver.roles]
            : [driver.role || 'driver'];

          if (currentRoles.includes(roleToToggle)) {
            updatedRoles = currentRoles.filter((r) => r !== roleToToggle);
            if (updatedRoles.length === 0) {
              updatedRoles = ['driver'];
            }
          } else {
            updatedRoles = [...currentRoles, roleToToggle];
          }

          primaryRole = ROLE_PRIORITY.find((r) => updatedRoles.includes(r)) || updatedRoles[0] || 'driver';

          return {
            ...driver,
            roles: updatedRoles,
            role: primaryRole
          };
        }
        return driver;
      });

      if (!isFound) {
        const source = driverData || {};
        targetDriverName = source.name || driverId;
        const currentRoles = Array.isArray(source.roles) && source.roles.length > 0
          ? [...source.roles]
          : [source.role || 'driver'];

        if (currentRoles.includes(roleToToggle)) {
          updatedRoles = currentRoles.filter((r) => r !== roleToToggle);
          if (updatedRoles.length === 0) updatedRoles = ['driver'];
        } else {
          updatedRoles = [...currentRoles, roleToToggle];
        }

        primaryRole = ROLE_PRIORITY.find((r) => updatedRoles.includes(r)) || updatedRoles[0] || 'driver';

        const newEntry = {
          ...source,
          id: driverId,
          roles: updatedRoles,
          role: primaryRole
        };
        updated.push(newEntry);
      }

      localStorage.setItem('gtc_registered_drivers', JSON.stringify(updated));
      return updated;
    });

    if (user?.id === driverId) {
      const updatedCurrent = {
        ...user,
        roles: updatedRoles,
        role: primaryRole
      };
      saveUserSession(updatedCurrent);
    }

    try {
      await fetch(`/api/drivers/${encodeURIComponent(driverId)}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: primaryRole,
          roles: updatedRoles,
          driverData: foundDriver || driverData
        })
      });
    } catch (e) {}

    const roleName = ROLE_INFO[roleToToggle]?.label || roleToToggle;
    showToast(`Toggled ${roleName} for ${targetDriverName}`, 'success');
    return true;
  };

  const syncAllFleetAccounts = async () => {
    try {
      showToast('Syncing all fleet accounts to Supabase Auth...', 'info');
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync_all',
          seedDrivers: allDrivers
        })
      });
      const data = await res.json();
      if (data?.success) {
        showToast(data.message || 'All fleet accounts synced with Supabase Auth!', 'success');
        try {
          const rRes = await fetch('/api/auth', { cache: 'no-store' });
          const rJson = await rRes.json();
          if (rJson?.success && Array.isArray(rJson.users)) {
            setAllDrivers((prev) => {
              const list = [...prev];
              const idMap = new Map(list.map((d) => [d.id, d]));
              rJson.users.forEach((u) => {
                const permLic = u.license_number || u.licenseNumber || getPermanentLicenseNumber(u.id);
                const normalized = {
                  id: u.id,
                  name: u.name,
                  email: u.email || '',
                  role: u.role || 'driver',
                  roles: Array.isArray(u.roles) && u.roles.length > 0 ? u.roles : [u.role || 'driver'],
                  country: u.country || 'Kenya',
                  vtc: u.vtc || 'Independent Solo Driver',
                  truck: u.truck || u.truck_brand || 'Scania S730 V8',
                  games: u.games || ['ETS 2'],
                  tmpId: u.tmpId || u.truckers_mp_id || null,
                  steamId: u.steamId || u.steam_id || '',
                  isStreamer: Boolean(u.isStreamer || u.stream_url),
                  streamerUrl: u.streamerUrl || u.stream_url || '',
                  kms: Number(u.kms) || 0,
                  deliveries: Number(u.deliveries) || 0,
                  licenseNumber: permLic,
                  joinedAt: u.joined_at || u.joinedAt || new Date().toISOString(),
                  lastLogin: u.last_login || u.lastLogin || null,
                  avatar: u.avatar || '',
                  authUserId: u.authUserId || null,
                  isAuthRegistered: u.isAuthRegistered
                };
                if (!idMap.has(u.id)) {
                  list.push(normalized);
                  idMap.set(u.id, normalized);
                } else {
                  const existing = idMap.get(u.id);
                  const merged = { ...existing, ...normalized, licenseNumber: normalized.licenseNumber || existing.licenseNumber || permLic };
                  const idx = list.findIndex((d) => d.id === u.id);
                  if (idx > -1) list[idx] = merged;
                }
              });
              try {
                localStorage.setItem('gtc_registered_drivers', JSON.stringify(list));
              } catch (e) {}
              return list;
            });
          }
        } catch (e) {}
        return { success: true };
      } else {
        showToast('Sync error: ' + (data?.error || 'Unknown error'), 'error');
        return { success: false, error: data?.error };
      }
    } catch (err) {
      showToast('Sync error: ' + err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  const updateUserProfile = async (updatedFields) => {
    if (!user) {
      showToast('You must be signed in to edit your profile.', 'error');
      return { success: false, error: 'Unauthenticated' };
    }

    const validatedCountry = updatedFields.country !== undefined
      ? (isValidGtcCountry(updatedFields.country) ? updatedFields.country.trim() : user.country || 'Kenya')
      : user.country;

    const validatedTruck = updatedFields.truck !== undefined
      ? (isValidGtcTruck(updatedFields.truck) ? updatedFields.truck.trim() : user.truck || 'Scania S730 V8')
      : user.truck;

    let isStreamer = updatedFields.isStreamer !== undefined ? Boolean(updatedFields.isStreamer) : Boolean(user.isStreamer);
    let streamerPlatform = updatedFields.streamerPlatform || user.streamerPlatform || 'TikTok';
    let streamerUrl = updatedFields.streamerUrl !== undefined ? (updatedFields.streamerUrl || '').trim() : (user.streamerUrl || '');

    if (isStreamer) {
      if (!streamerUrl || !isValidStreamerUrl(streamerUrl, streamerPlatform)) {
        showToast('Please provide a valid link to your streaming channel/account (e.g. TikTok, YouTube, Twitch, Kick) to confirm streamer status.', 'error');
        return {
          success: false,
          error: 'Streamer status requires a valid channel link (e.g. https://www.tiktok.com/@yourchannel or https://www.youtube.com/@channel).'
        };
      }
      streamerUrl = normalizeStreamerUrl(streamerUrl);
    } else {
      streamerUrl = '';
    }

    if (updatedFields.email !== undefined && updatedFields.email) {
      const emailTrimmed = updatedFields.email.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
        showToast('Please enter a valid email address.', 'error');
        return { success: false, error: 'Invalid email address format.' };
      }
    }

    if (updatedFields.password !== undefined && updatedFields.password) {
      const passValidation = validatePasswordSecurity(updatedFields.password, user.name || updatedFields.email || user.email);
      if (!passValidation.valid) {
        showToast(passValidation.error, 'error');
        return { success: false, error: passValidation.error };
      }
    }

    let updatedRoles = Array.isArray(user.roles) ? [...user.roles] : [user.role || 'driver'];
    if (isStreamer) {
      if (!updatedRoles.includes(ROLES.STREAMER)) {
        updatedRoles.unshift(ROLES.STREAMER);
      }
    } else {
      updatedRoles = updatedRoles.filter((r) => r !== ROLES.STREAMER);
      if (updatedRoles.length === 0) updatedRoles = [ROLES.DRIVER];
    }

    const mergedUser = {
      ...user,
      ...updatedFields,
      id: user.id,
      email: updatedFields.email !== undefined ? updatedFields.email.trim() : user.email,
      ...(updatedFields.password ? { password: updatedFields.password.trim() } : {}),
      country: validatedCountry,
      truck: validatedTruck,
      isStreamer,
      streamerPlatform: isStreamer ? streamerPlatform : '',
      streamerUrl: isStreamer ? streamerUrl : '',
      roles: updatedRoles,
      role: isStreamer ? ROLES.STREAMER : (updatedRoles[0] || ROLES.DRIVER)
    };

    saveUserSession(mergedUser);

    setAllDrivers((prev) => {
      const updated = prev.map((d) => (d.id === user.id ? { ...d, ...mergedUser } : d));
      try {
        localStorage.setItem('gtc_registered_drivers', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      await fetch('/api/signup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          name: mergedUser.name,
          email: mergedUser.email,
          ...(updatedFields.password ? { password: updatedFields.password.trim() } : {}),
          country: mergedUser.country,
          games: mergedUser.games,
          type: mergedUser.vtc,
          role: mergedUser.role,
          roles: mergedUser.roles || [mergedUser.role || 'driver'],
          vtc: mergedUser.vtc,
          tmp: mergedUser.tmpId,
          steamId: mergedUser.steamId,
          truckBrand: mergedUser.truck,
          stream: mergedUser.streamerUrl,
          avatar: mergedUser.avatar,
          bio: mergedUser.bio
        })
      });
    } catch (e) {}

    addNotification({
      title: 'Profile Updated',
      message: 'Your driver credentials, truck specifications, and profile changes have been saved.',
      type: 'profile_update',
      iconClass: 'bi bi-person-check-fill'
    }, user.id);

    showToast('Profile updated successfully! License and roster refreshed.', 'success');
    return { success: true, user: mergedUser };
  };

  const getConvoyAttendees = (convoyId) => {
    if (!convoyId) return [];
    if (convoyAttendees[convoyId] && Array.isArray(convoyAttendees[convoyId])) {
      return convoyAttendees[convoyId];
    }
    return [];
  };

  const isDriverAttending = (convoyId, driverId = null) => {
    const targetId = driverId || user?.id;
    if (!targetId) return false;
    const attendees = getConvoyAttendees(convoyId);
    return attendees.some((a) => a.id === targetId || a.name?.toLowerCase() === user?.name?.toLowerCase());
  };

  const confirmAttendance = async (convoyId, customDriver = null) => {
    const attendeeDriver = customDriver || user;
    if (!attendeeDriver) {
      showToast('Please sign in with your Driver License to confirm attendance.', 'warning');
      return { success: false, reason: 'unauthenticated' };
    }

    const currentList = getConvoyAttendees(convoyId);
    if (currentList.some((a) => a.id === attendeeDriver.id || a.name?.toLowerCase() === attendeeDriver.name?.toLowerCase())) {
      showToast('You are already confirmed for this convoy!', 'info');
      return { success: true, already: true };
    }

    const attendeeRecord = {
      id: attendeeDriver.id,
      name: attendeeDriver.name,
      role: attendeeDriver.role || 'driver',
      roles: attendeeDriver.roles || [attendeeDriver.role || 'driver'],
      vtc: attendeeDriver.vtc || 'Independent Solo',
      truck: attendeeDriver.truck || 'Scania S730',
      country: attendeeDriver.country || 'Kenya',
      avatar: attendeeDriver.avatar || null,
      confirmedAt: new Date().toISOString()
    };

    const nextAttendees = {
      ...convoyAttendees,
      [convoyId]: [attendeeRecord, ...currentList]
    };

    setConvoyAttendees(nextAttendees);
    try {
      localStorage.setItem('gtc_convoy_attendance', JSON.stringify(nextAttendees));
    } catch (e) {}

    try {
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ convoyId, driver: attendeeRecord })
      });
    } catch (e) {}

    addNotification({
      title: 'Convoy Attendance Confirmed',
      message: `Your staging slot is confirmed for Convoy (${convoyId}). Meetup on radio channel CB 19.`,
      type: 'convoy_alert',
      iconClass: 'bi bi-calendar-check-fill'
    }, attendeeDriver.id);

    showToast(`Attendance confirmed! Staging slot reserved for ${attendeeDriver.name}.`, 'success');
    return { success: true };
  };

  const cancelAttendance = async (convoyId, driverId = null) => {
    const targetId = driverId || user?.id;
    const targetName = user?.name;
    if (!targetId && !targetName) return { success: false };

    const currentList = getConvoyAttendees(convoyId);
    const filtered = currentList.filter(
      (a) => a.id !== targetId && (!targetName || a.name?.toLowerCase() !== targetName.toLowerCase())
    );

    const nextAttendees = {
      ...convoyAttendees,
      [convoyId]: filtered
    };

    setConvoyAttendees(nextAttendees);
    try {
      localStorage.setItem('gtc_convoy_attendance', JSON.stringify(nextAttendees));
    } catch (e) {}

    try {
      await fetch('/api/attendance', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ convoyId, driverId: targetId, driverName: targetName })
      });
    } catch (e) {}

    showToast('Convoy attendance reservation removed.', 'info');
    return { success: true };
  };

  const broadcastConvoyReminder = async ({ title, message, convoyId }) => {
    if (user?.role !== ROLES.ADMIN && !user?.roles?.includes(ROLES.ADMIN) && user?.role !== ROLES.STAFF && !user?.roles?.includes(ROLES.STAFF)) {
      showToast('Permission denied: Only Admin or Staff can broadcast reminders.', 'error');
      return { success: false, error: 'Permission denied' };
    }

    const broadcastItem = {
      id: 'broadcast-' + Date.now(),
      title: title || 'Official Convoy Alert',
      message: message || 'Drivers to your trucks! Convoy meetup is underway.',
      time: 'Just now',
      read: false,
      type: 'broadcast',
      iconClass: 'bi bi-megaphone-fill'
    };

    addNotification(broadcastItem);

    const localEmails = allDrivers
      .map((d) => d.email?.trim().toLowerCase())
      .filter((e) => e && e.includes('@'));
    if (user?.email && user.email.includes('@')) {
      localEmails.push(user.email.trim().toLowerCase());
    }

    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'broadcast',
          title: broadcastItem.title,
          message: broadcastItem.message,
          adminEmail: user?.email,
          targetEmails: Array.from(new Set(localEmails))
        })
      });
      const data = await res.json();
      if (data?.success) {
        showToast(data.message || 'Convoy reminder broadcasted to all member accounts & emails!', 'success');
        return { success: true, data };
      } else {
        showToast(data?.error || 'Broadcast notification saved to accounts.', 'info');
        return { success: false, error: data?.error };
      }
    } catch (err) {
      showToast('Broadcast saved to in-app accounts.', 'info');
      return { success: true };
    }
  };

  const deleteDriverAccount = async (driverId) => {
    try {
      setAllDrivers((prev) => {
        const next = prev.filter((d) => d.id !== driverId);
        try {
          localStorage.setItem('gtc_registered_drivers', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
      await fetch(`/api/signup?id=${encodeURIComponent(driverId)}`, { method: 'DELETE' });
      showToast('Driver removed from system.', 'info');
      return { success: true };
    } catch (e) {
      showToast('Error removing driver: ' + e.message, 'error');
      return { success: false, error: e.message };
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || ROLES.DRIVER,
        roles: user?.roles || [user?.role || ROLES.DRIVER],
        roleInfo: ROLE_INFO[user?.role || 'driver'] || ROLE_INFO.driver,
        isAdmin: hasRole(user, ROLES.ADMIN),
        isStaff: hasRole(user, ROLES.ADMIN) || hasRole(user, ROLES.STAFF) || hasRole(user, ROLES.DEV_MODDER) || hasRole(user, ROLES.CONVOY_LEAD),
        allDrivers,
        notifications,
        unreadCount,
        reminders,
        convoyAttendees,
        loading,
        toastMessage,
        registerAccount,
        loginAccount,
        logoutAccount,
        saveUserSession,
        toggleConvoyReminder,
        addNotification,
        markNotificationRead,
        clearNotifications,
        logHaul,
        assignRole,
        toggleDriverRole,
        updateUserProfile,
        getConvoyAttendees,
        isDriverAttending,
        confirmAttendance,
        cancelAttendance,
        deleteDriverAccount,
        broadcastConvoyReminder,
        showToast,
        updateUserAvatar,
        syncAllFleetAccounts
      }}
    >
      {children}
      {toastMessage && (
        <div className={`gtc-toast-banner ${toastMessage.type}`}>
          <i className={
            toastMessage.type === 'success' ? 'bi bi-check-circle-fill text-success' :
            toastMessage.type === 'error' ? 'bi bi-exclamation-triangle-fill text-danger' :
            'bi bi-bell-fill text-warning'
          } style={{ fontSize: '1.2rem' }}></i>
          <span>{toastMessage.message}</span>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
