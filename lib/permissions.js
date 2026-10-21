/**
 * Formal Role-Based Access Control (RBAC) System
 * Modeled after NEETEL-AUTOSPARES architecture for enterprise authorization.
 */

export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  DEV_MODDER: 'dev_modder',
  CONVOY_LEAD: 'convoy_lead',
  DISPATCHER: 'dispatcher',
  STREAMER: 'streamer',
  DRIVER: 'driver',
};

export const ROLE_PERMISSIONS = {
  admin: ['*'], // Unrestricted access to all modules
  staff: [
    'cms:view',
    'timetable:edit',
    'news:edit',
    'gallery:edit',
    'drivers:view',
    'broadcast:send',
    'convoys:view',
    'telemetry:view',
    'hauls:view',
  ],
  dev_modder: [
    'cms:view',
    'gallery:edit',
    'media:upload',
    'drivers:view',
    'telemetry:view',
    'convoys:view',
  ],
  convoy_lead: [
    'cms:view',
    'convoys:manage',
    'timetable:edit',
    'broadcast:send',
    'drivers:view',
    'routes:manage',
    'telemetry:view',
  ],
  dispatcher: [
    'cms:view',
    'convoys:manage',
    'broadcast:send',
    'drivers:view',
    'routes:view',
    'telemetry:view',
  ],
  streamer: [
    'stream:manage',
    'gallery:upload',
    'profile:manage',
    'convoys:attend',
    'telemetry:view',
  ],
  driver: [
    'profile:manage',
    'hauls:log',
    'convoy:attend',
    'telemetry:view',
  ],
};

export const ROLE_LABELS = {
  admin: 'Administrator',
  staff: 'Staff Member',
  dev_modder: 'Dev | Modder',
  convoy_lead: 'Convoy Lead',
  dispatcher: 'Dispatcher',
  streamer: 'Official Streamer',
  driver: 'Certified Driver',
};

export const ROLE_COLORS = {
  admin: '#ef4444',
  staff: '#a855f7',
  dev_modder: '#0284c7',
  convoy_lead: '#f59e0b',
  dispatcher: '#0ea5e9',
  streamer: '#ec4899',
  driver: '#10b981',
};

export const ROLE_BADGE_CLASSES = {
  admin: 'badge bg-danger text-white',
  staff: 'badge bg-purple text-white',
  dev_modder: 'badge text-white',
  convoy_lead: 'badge bg-warning text-dark',
  dispatcher: 'badge bg-info text-dark',
  streamer: 'badge text-white',
  driver: 'badge bg-success text-white',
};

export const ROLE_ICONS = {
  admin: 'bi bi-award-fill',
  staff: 'bi bi-shield-fill-check',
  dev_modder: 'bi bi-code-slash',
  convoy_lead: 'bi bi-signpost-split-fill',
  dispatcher: 'bi bi-broadcast',
  streamer: 'bi bi-camera-video-fill',
  driver: 'bi bi-truck',
};


export function hasPermission(userOrRoles, permission) {
  if (!userOrRoles) return false;

  let rolesList = [];
  if (typeof userOrRoles === 'string') {
    rolesList = [userOrRoles];
  } else if (Array.isArray(userOrRoles)) {
    rolesList = userOrRoles;
  } else if (typeof userOrRoles === 'object') {
    if (Array.isArray(userOrRoles.roles) && userOrRoles.roles.length > 0) {
      rolesList = userOrRoles.roles;
    } else if (userOrRoles.role) {
      rolesList = [userOrRoles.role];
    }
  }

  for (const r of rolesList) {
    const roleKey = r?.toLowerCase();
    const perms = ROLE_PERMISSIONS[roleKey];
    if (!perms) continue;
    if (perms.includes('*')) return true;
    if (perms.some((p) => p === permission || p.startsWith(permission + ':') || permission.startsWith(p + ':'))) {
      return true;
    }
  }

  return false;
}


export function hasRole(userOrRoles, targetRole) {
  if (!userOrRoles) return false;

  let rolesList = [];
  if (typeof userOrRoles === 'string') {
    rolesList = [userOrRoles];
  } else if (Array.isArray(userOrRoles)) {
    rolesList = userOrRoles;
  } else if (typeof userOrRoles === 'object') {
    if (Array.isArray(userOrRoles.roles) && userOrRoles.roles.length > 0) {
      rolesList = userOrRoles.roles;
    } else if (userOrRoles.role) {
      rolesList = [userOrRoles.role];
    }
  }

  return rolesList.map((r) => r?.toLowerCase()).includes(targetRole?.toLowerCase());
}
