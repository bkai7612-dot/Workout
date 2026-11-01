export const USERNAME_REGEX = /^[A-Za-z0-9_]{3,20}$/;

export function validateUsername(username: string): string | null {
  const u = username.trim();
  if (u.length < 3) return 'Username must be at least 3 characters.';
  if (u.length > 20) return 'Username must be 20 characters or fewer.';
  if (!USERNAME_REGEX.test(u)) return 'Use letters, numbers and underscores only.';
  return null;
}

export function validateEmail(email: string): string | null {
  const e = email.trim();
  if (!e) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return 'Enter a valid email address.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must contain at least one letter and one number.';
  }
  return null;
}

export function errorMessage(e: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (e && typeof e === 'object' && 'message' in e && typeof (e as { message: unknown }).message === 'string') {
    return (e as { message: string }).message;
  }
  return fallback;
}
