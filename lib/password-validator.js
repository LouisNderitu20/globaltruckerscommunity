/**
 * Enterprise Password Validator
 * Modeled after NEETEL-AUTOSPARES lib/password-validator.ts
 */

const COMMON_WEAK_PASSWORDS = new Set([
  '123456',
  '12345678',
  '123456789',
  '1234567890',
  'password',
  'password123',
  'admin',
  'admin123',
  'qwerty',
  'welcome',
  'welcome123',
  'trucker',
  'trucking',
  'gtctrucker',
  'globaltruckers',
]);

export function validateStrongPassword(password, userEmail = '') {
  if (!password || password.trim().length === 0) {
    return { isValid: false, error: 'Password is required.' };
  }

  const clean = password.trim();

  if (clean.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long.' };
  }

  const lower = clean.toLowerCase();
  if (COMMON_WEAK_PASSWORDS.has(lower)) {
    return {
      isValid: false,
      error: 'This password is too common and easily guessed. Please choose a more secure password.',
    };
  }

  if (userEmail) {
    const emailPrefix = userEmail.split('@')[0].toLowerCase();
    if (emailPrefix.length >= 4 && lower === emailPrefix) {
      return {
        isValid: false,
        error: 'Password cannot be identical to your email username.',
      };
    }
  }

  return { isValid: true };
}
