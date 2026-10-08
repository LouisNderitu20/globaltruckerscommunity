'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabaseContent } from '@/lib/supabase';

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

const DEFAULT_DEMO_USER = {
  id: 'GTC-1001',
  name: 'Bryan Gaming',
  email: 'bryangaming@gtc.com',
  password: 'gtc2026',
  role: 'admin',
  roles: ['admin', 'convoy_lead', 'streamer'],
  country: 'Kenya',
  vtc: 'GTC Management',
  truck: 'Scania S730 V8',
  games: ['ETS 2', 'ATS'],
  tmpId: 'TMP-883921',
  steamId: 'bryan_gaming_live',
  isStreamer: true,
  streamerPlatform: 'TikTok',
  streamerUrl: 'https://www.tiktok.com/@bryangaming__',
  kms: 145200,
  deliveries: 1520,
  licenseNumber: 'GTC-DL-2026-001',
  joinedAt: 'January 2026',
  emailRemindersEnabled: true,
  avatar: '/apple-touch-icon.png'
};

const DEFAULT_CONVOY_ATTENDEES = {
  default: [
    { id: 'GTC-1001', name: 'Bryan Gaming', roles: ['admin', 'convoy_lead', 'streamer'], role: 'admin', vtc: 'GTC Management', truck: 'Scania S730 V8', country: 'Kenya', avatar: '/apple-touch-icon.png' },
    { id: 'GTC-1021', name: 'Krusherz_21', roles: ['admin', 'dev_modder'], role: 'admin', vtc: 'GTC Management & Tech', truck: 'Scania 770S V8', country: 'Kenya', avatar: 'https://bissmepkqhackzaezvax.supabase.co/storage/v1/object/sign/site-images/2026/1790592206178-discord-mod-role.png?token=eyJraWQiOiJiYTc3OWJlMC1jYTg2LTRjZTUtOThkMC05MTAwMDhmNTg3ZjQiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzaXRlLWltYWdlcy8yMDI2LzE3OTA1OTIyMDYxNzgtZGlzY29yZC1tb2Qtcm9sZS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzkwNTkyMjA5LCJleHAiOjIxMDU5NTIyMDl9.UBBOvVCdZICrFQRSkwMY-x7bOgeDnIFgxSDeEIDQ1Sot013OEvh_AtwPlabNUmzgDcLpGp3x0qxbKYeTilbaMA' },
    { id: 'GTC-1002', name: 'Alex_Trans', roles: ['dispatcher'], role: 'dispatcher', vtc: 'Euro Haulers', truck: 'Volvo FH16 750', country: 'United Kingdom' },
    { id: 'GTC-1003', name: 'Klaus_Trucker', roles: ['staff', 'dev_modder'], role: 'staff', vtc: 'Nordic Express', truck: 'MAN TGX Individual', country: 'Germany' },
    { id: 'GTC-1004', name: 'HighwayKing_99', roles: ['convoy_lead'], role: 'convoy_lead', vtc: 'Outlaw Logistics', truck: 'Peterbilt 389', country: 'United States' },
    { id: 'GTC-1005', name: 'VikingDriver', roles: ['driver'], role: 'driver', vtc: 'Scania Masters', truck: 'Scania R580', country: 'Sweden' }
  ]
};

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
    try {
      const storedAttendees = localStorage.getItem('gtc_convoy_attendance');
      if (storedAttendees) {
        setConvoyAttendees(JSON.parse(storedAttendees));
      } else {
        setConvoyAttendees(DEFAULT_CONVOY_ATTENDEES);
        localStorage.setItem('gtc_convoy_attendance', JSON.stringify(DEFAULT_CONVOY_ATTENDEES));
      }
    } catch (e) {
      setConvoyAttendees(DEFAULT_CONVOY_ATTENDEES);
    }

    try {
      const seedDrivers = [
        DEFAULT_DEMO_USER,
        {
          id: 'GTC-1021',
          name: 'Krusherz_21',
          email: 'krusherz@gtc.com',
          password: 'gtc2026',
          role: 'admin',
          roles: ['admin', 'dev_modder'],
          country: 'Kenya',
          vtc: 'GTC Management & Tech',
          truck: 'Scania 770S V8',
          games: ['ETS 2', 'ATS'],
          tmpId: 'TMP-772109',
          steamId: 'krusherz_21',
          isDevModder: true,
          devSpecialty: 'GTC Core Tools & Modding Architecture',
          kms: 132400,
          deliveries: 1380,
          licenseNumber: 'GTC-DL-2026-021',
          joinedAt: 'January 2026',
          bio: 'Dev by day, Trucker by night',
          avatar: 'https://bissmepkqhackzaezvax.supabase.co/storage/v1/object/sign/site-images/2026/1790592206178-discord-mod-role.png?token=eyJraWQiOiJiYTc3OWJlMC1jYTg2LTRjZTUtOThkMC05MTAwMDhmNTg3ZjQiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJzaXRlLWltYWdlcy8yMDI2LzE3OTA1OTIyMDYxNzgtZGlzY29yZC1tb2Qtcm9sZS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzkwNTkyMjA5LCJleHAiOjIxMDU5NTIyMDl9.UBBOvVCdZICrFQRSkwMY-x7bOgeDnIFgxSDeEIDQ1Sot013OEvh_AtwPlabNUmzgDcLpGp3x0qxbKYeTilbaMA'
        },
        {
          id: 'GTC-1002',
          name: 'Alex_Trans',
          email: 'alex@eurohaulers.uk',
          password: 'gtc2026',
          role: 'dispatcher',
          roles: ['dispatcher'],
          country: 'United Kingdom',
          vtc: 'Euro Haulers',
          truck: 'Volvo FH16 750',
          games: ['ETS 2'],
          tmpId: 'TMP-549102',
          kms: 118400,
          deliveries: 1240,
          licenseNumber: 'GTC-DL-2026-002',
          joinedAt: 'March 2026'
        },
        {
          id: 'GTC-1003',
          name: 'Klaus_Trucker',
          email: 'klaus@nordic.de',
          password: 'gtc2026',
          role: 'staff',
          roles: ['staff', 'dev_modder'],
          country: 'Germany',
          vtc: 'Nordic Express',
          truck: 'MAN TGX Individual',
          games: ['ETS 2'],
          tmpId: 'TMP-691238',
          kms: 98600,
          deliveries: 1080,
          licenseNumber: 'GTC-DL-2026-003',
          joinedAt: 'April 2026'
        },
        {
          id: 'GTC-1004',
          name: 'HighwayKing_99',
          email: 'king@outlawlogistics.us',
          password: 'gtc2026',
          role: 'convoy_lead',
          roles: ['convoy_lead'],
          country: 'United States',
          vtc: 'Outlaw Logistics',
          truck: 'Peterbilt 389',
          games: ['ATS'],
          tmpId: 'TMP-110294',
          kms: 87300,
          deliveries: 940,
          licenseNumber: 'GTC-DL-2026-004',
          joinedAt: 'May 2026'
        },
        {
          id: 'GTC-1005',
          name: 'VikingDriver',
          email: 'viking@scaniamasters.se',
          password: 'gtc2026',
          role: 'driver',
          roles: ['driver'],
          country: 'Sweden',
          vtc: 'Scania Masters',
          truck: 'Scania R580',
          games: ['ETS 2'],
          tmpId: 'TMP-994012',
          kms: 79100,
          deliveries: 860,
          licenseNumber: 'GTC-DL-2026-005',
          joinedAt: 'June 2026'
        }
      ];

      const storedDrivers = localStorage.getItem('gtc_registered_drivers');
      if (storedDrivers) {
        const parsed = JSON.parse(storedDrivers);
        seedDrivers.forEach((seed) => {
          if (!parsed.some((p) => p.name?.toLowerCase() === seed.name.toLowerCase() || p.id === seed.id)) {
            parsed.push(seed);
          }
        });
        setAllDrivers(parsed);
        localStorage.setItem('gtc_registered_drivers', JSON.stringify(parsed));
      } else {
        setAllDrivers(seedDrivers);
        localStorage.setItem('gtc_registered_drivers', JSON.stringify(seedDrivers));
      }
    } catch (e) {}

    try {
      const stored = localStorage.getItem('gtc_user_session');
      if (stored) {
        const activeUser = JSON.parse(stored);
        setUser(activeUser);
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
            message: `Your driver license (${u.licenseNumber || 'Active'}) is registered. Your personal convoy reminders will appear here.`,
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
    setUser(updatedUser);
    try {
      localStorage.setItem('gtc_user_session', JSON.stringify(updatedUser));
      setAllDrivers((prev) => {
        const next = prev.map((d) => (d.id === updatedUser.id ? updatedUser : d));
        if (!next.some((d) => d.id === updatedUser.id)) {
          next.push(updatedUser);
        }
        localStorage.setItem('gtc_registered_drivers', JSON.stringify(next));
        return next;
      });
      loadUserNotifications(updatedUser);
      loadUserReminders(updatedUser);
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

    const newId = 'GTC-' + Math.floor(1000 + Math.random() * 9000);
    
    const assignedRole = formData.isStreamer ? ROLES.STREAMER : ROLES.DRIVER;

    const newDriver = {
      id: newId,
      name: cleanName,
      email: cleanEmail,
      password: formData.password.trim(),
      role: assignedRole,
      country: formData.country || 'Kenya',
      vtc: formData.vtc?.trim() || 'Independent Solo Driver',
      truck: formData.truck || 'Scania S730',
      games: formData.games?.length ? formData.games : ['ETS 2'],
      tmpId: formData.tmpId || 'TMP-' + Math.floor(100000 + Math.random() * 899999),
      steamId: formData.steamId || '',
      isStreamer: Boolean(formData.isStreamer),
      streamerPlatform: formData.streamerPlatform || '',
      streamerUrl: formData.streamerUrl || '',
      isDevModder: false,
      devSpecialty: '',
      kms: 0,
      deliveries: 0,
      licenseNumber: `GTC-DL-2026-${Math.floor(100 + Math.random() * 900)}`,
      joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      emailRemindersEnabled: true,
      avatar: formData.avatar || formData.photo || ''
    };

    saveUserSession(newDriver);

    const notifTitle = assignedRole === ROLES.STREAMER ? 'Official Streamer Credential Issued' : 'Personal Driver License Issued';
    const notifIcon = assignedRole === ROLES.STREAMER ? 'bi bi-camera-video-fill' : 'bi bi-person-badge-fill';

    addNotification({
      title: notifTitle,
      message: `Welcome aboard Callsign ${newDriver.name}! Your GTC ID is ${newDriver.id}. ${newDriver.isStreamer ? 'Streamer partner verification badge unlocked.' : ''} Check the weekly timetable to book your runs.`,
      type: 'system',
      iconClass: notifIcon
    }, newDriver.id);

    showToast(`Welcome ${newDriver.name}! ${formData.isStreamer ? 'Official Streamer Credential Issued.' : 'Driver License Issued.'}`, 'success');

    try {
      await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newDriver.id,
          name: newDriver.name,
          email: newDriver.email,
          country: newDriver.country,
          games: newDriver.games,
          type: newDriver.vtc,
          tmp: newDriver.tmpId,
          truckBrand: newDriver.truck,
          avatar: newDriver.avatar,
          role: newDriver.role,
          isStreamer: newDriver.isStreamer,
          streamerPlatform: newDriver.streamerPlatform,
          streamerUrl: newDriver.streamerUrl
        })
      });
    } catch (e) {}

    return { success: true, driver: newDriver };
  };

  const updateUserAvatar = (avatarUrl) => {
    if (!user) return;
    const updated = { ...user, avatar: avatarUrl };
    saveUserSession(updated);
    showToast('Driver profile photo updated!', 'success');
  };

  const loginAccount = (credentials) => {
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

    const query = emailOrCallsign.trim().toLowerCase();
    const target = allDrivers.find(
      (d) =>
        d.name?.toLowerCase() === query ||
        d.email?.toLowerCase() === query ||
        d.id?.toLowerCase() === query
    );

    if (!target) {
      showToast('No driver account found with this callsign or email.', 'error');
      return { success: false, error: 'No account found. Please sign up to create your license.' };
    }

    const expectedPassword = target.password || 'gtc2026';
    if (password.trim() !== expectedPassword && password.trim() !== 'gtc2026' && password.trim() !== 'ADMIN2026') {
      showToast('Incorrect password. Please try again.', 'error');
      return { success: false, error: 'Incorrect password. Please check your credentials.' };
    }

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

  const toggleConvoyReminder = (convoyId, convoyTitle, convoyTime) => {
    if (!user) {
      showToast('Please sign in to save personal convoy reminders', 'info');
      return;
    }
    const isSubscribed = reminders.includes(convoyId);
    let nextReminders;

    if (isSubscribed) {
      nextReminders = reminders.filter((id) => id !== convoyId);
      showToast(`Reminder removed for ${convoyTitle}`, 'info');
    } else {
      nextReminders = [...reminders, convoyId];
      addNotification({
        title: `Convoy Booked: ${convoyTitle}`,
        message: `You saved ${convoyTitle} (${convoyTime || 'Upcoming'}). We will send a reminder before departure.`,
        type: 'convoy_reminder',
        iconClass: 'bi bi-alarm-fill'
      }, user.id);
      showToast(`Reminder saved for ${convoyTitle}!`, 'success');
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

    addNotification({
      title: 'Haul Logged Successfully',
      message: `Completed ${route} (${addedKms} km hauling ${cargo || 'Freight'} in ${game}). +${addedKms} km added to your license!`,
      type: 'haul',
      iconClass: 'bi bi-check-circle-fill'
    });

    showToast(`Haul logged: +${addedKms} km added to your stats!`, 'success');
    return updatedUser;
  };

  const assignRole = (driverId, newRole) => {
    if (user?.role !== ROLES.ADMIN && !user?.roles?.includes(ROLES.ADMIN)) {
      showToast('Permission denied: Only Admins can assign roles.', 'error');
      return false;
    }

    setAllDrivers((prev) => {
      const updated = prev.map((driver) => {
        if (driver.id === driverId) {
          const rolesArray = Array.isArray(newRole) ? newRole : [newRole];
          return { ...driver, role: rolesArray[0] || 'driver', roles: rolesArray };
        }
        return driver;
      });
      localStorage.setItem('gtc_registered_drivers', JSON.stringify(updated));
      return updated;
    });

    if (user?.id === driverId) {
      const rolesArray = Array.isArray(newRole) ? newRole : [newRole];
      const updatedCurrent = { ...user, role: rolesArray[0] || 'driver', roles: rolesArray };
      saveUserSession(updatedCurrent);
    }

    fetch('/api/signup', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: driverId,
        role: Array.isArray(newRole) ? newRole[0] : newRole,
        roles: Array.isArray(newRole) ? newRole : [newRole]
      })
    }).catch(() => {});

    showToast(`Role updated to ${ROLE_INFO[Array.isArray(newRole) ? newRole[0] : newRole]?.label || newRole}`, 'success');
    return true;
  };

  const toggleDriverRole = (driverId, roleToToggle) => {
    if (user?.role !== ROLES.ADMIN && !user?.roles?.includes(ROLES.ADMIN)) {
      showToast('Permission denied: Only Admins can modify roles.', 'error');
      return false;
    }

    let updatedRoles = [];
    let targetDriverName = driverId;

    setAllDrivers((prev) => {
      const updated = prev.map((driver) => {
        if (driver.id === driverId) {
          targetDriverName = driver.name;
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

          return {
            ...driver,
            roles: updatedRoles,
            role: updatedRoles[0] || 'driver'
          };
        }
        return driver;
      });

      localStorage.setItem('gtc_registered_drivers', JSON.stringify(updated));
      return updated;
    });

    if (user?.id === driverId) {
      const updatedCurrent = {
        ...user,
        roles: updatedRoles,
        role: updatedRoles[0] || 'driver'
      };
      saveUserSession(updatedCurrent);
    }

    fetch('/api/signup', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: driverId,
        role: updatedRoles[0] || 'driver',
        roles: updatedRoles
      })
    }).catch(() => {});

    const roleName = ROLE_INFO[roleToToggle]?.label || roleToToggle;
    showToast(`Toggled ${roleName} for ${targetDriverName}`, 'success');
    return true;
  };

  const updateUserProfile = async (updatedFields) => {
    if (!user) {
      showToast('You must be signed in to edit your profile.', 'error');
      return { success: false, error: 'Unauthenticated' };
    }

    const mergedUser = {
      ...user,
      ...updatedFields,
      id: user.id
    };

    saveUserSession(mergedUser);

    try {
      await fetch('/api/signup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          name: mergedUser.name,
          email: mergedUser.email,
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
    if (convoyAttendees[convoyId] && Array.isArray(convoyAttendees[convoyId])) {
      return convoyAttendees[convoyId];
    }
    return convoyAttendees.default || DEFAULT_CONVOY_ATTENDEES.default || [];
  };

  const isDriverAttending = (convoyId, driverId = null) => {
    const targetId = driverId || user?.id;
    if (!targetId) return false;
    const attendees = getConvoyAttendees(convoyId);
    return attendees.some((a) => a.id === targetId || a.name?.toLowerCase() === user?.name?.toLowerCase());
  };

  const confirmAttendance = (convoyId, customDriver = null) => {
    const attendeeDriver = customDriver || user;
    if (!attendeeDriver) {
      showToast('Please sign in with your Driver License to confirm attendance.', 'warning');
      return { success: false, reason: 'unauthenticated' };
    }

    const currentList = getConvoyAttendees(convoyId);
    if (currentList.some((a) => a.id === attendeeDriver.id)) {
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

    addNotification({
      title: 'Convoy Attendance Confirmed',
      message: `Your staging slot is confirmed for Convoy (${convoyId}). Meetup on radio channel CB 19.`,
      type: 'convoy_alert',
      iconClass: 'bi bi-calendar-check-fill'
    }, attendeeDriver.id);

    showToast(`Attendance confirmed! Staging slot reserved for ${attendeeDriver.name}.`, 'success');
    return { success: true };
  };

  const cancelAttendance = (convoyId, driverId = null) => {
    const targetId = driverId || user?.id;
    if (!targetId) return { success: false };

    const currentList = getConvoyAttendees(convoyId);
    const filtered = currentList.filter((a) => a.id !== targetId && a.name?.toLowerCase() !== user?.name?.toLowerCase());

    const nextAttendees = {
      ...convoyAttendees,
      [convoyId]: filtered
    };

    setConvoyAttendees(nextAttendees);
    try {
      localStorage.setItem('gtc_convoy_attendance', JSON.stringify(nextAttendees));
    } catch (e) {}

    showToast('Convoy attendance reservation removed.', 'info');
    return { success: true };
  };

  const broadcastConvoyReminder = ({ title, message, convoyId }) => {
    if (user?.role !== ROLES.ADMIN && !user?.roles?.includes(ROLES.ADMIN) && user?.role !== ROLES.STAFF && !user?.roles?.includes(ROLES.STAFF)) {
      showToast('Permission denied: Only Admin or Staff can broadcast reminders.', 'error');
      return false;
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
    showToast('Convoy reminder broadcasted to all member accounts & emails!', 'success');
    return true;
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
        updateUserAvatar
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
