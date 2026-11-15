const STORAGE_KEY = 'em_sec_rl_v1';
const COOKIE_NAME = 'em_sec_lock_until';
const LOCKOUT_EVENT = 'em-security-lockout-changed';

export const MAX_FAILED_PASSWORD_ATTEMPTS = 3;
export const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
export const LOCKOUT_DURATION_MINUTES = 5;

// SHA-256 digest of the management passcode (plaintext never stored in client bundle)
const ADMIN_PASSCODE_SHA256 =
  '3a4b50b4024c7f9a6858e71555cf803fff3dd8fc373017a597a96cecfe710016';

export interface LockoutStatus {
  isLocked: boolean;
  failedAttempts: number;
  remainingAttempts: number;
  lockedUntil: number | null;
  remainingMs: number;
}

interface StoredLockoutPayload {
  failedAttempts: number;
  lockedUntil: number | null;
}

let memoryLockoutState: StoredLockoutPayload | null = null;

function readCookieLockUntil(): number | null {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${COOKIE_NAME}=`));
    if (!match) return null;
    const raw = Number(decodeURIComponent(match.split('=')[1] || ''));
    return Number.isFinite(raw) && raw > 0 ? raw : null;
  } catch {
    return null;
  }
}

function writeCookieLockUntil(lockedUntil: number | null): void {
  if (typeof document === 'undefined') return;
  try {
    if (!lockedUntil) {
      document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Strict`;
      return;
    }
    const maxAgeSec = Math.max(1, Math.ceil((lockedUntil - Date.now()) / 1000));
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
      String(lockedUntil)
    )}; path=/; max-age=${maxAgeSec}; SameSite=Strict`;
  } catch {
    // Ignore cookie errors in restricted contexts
  }
}

function readStoragePayload(storage: Storage | undefined): StoredLockoutPayload | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredLockoutPayload>;
    const failedAttempts =
      typeof parsed.failedAttempts === 'number' && Number.isFinite(parsed.failedAttempts)
        ? Math.max(0, Math.floor(parsed.failedAttempts))
        : 0;
    const lockedUntil =
      typeof parsed.lockedUntil === 'number' && Number.isFinite(parsed.lockedUntil)
        ? parsed.lockedUntil
        : null;
    return { failedAttempts, lockedUntil };
  } catch {
    return null;
  }
}

function writeStoragePayload(payload: StoredLockoutPayload | null): void {
  memoryLockoutState = payload;
  const serialized = payload ? JSON.stringify(payload) : null;
  try {
    if (typeof localStorage !== 'undefined') {
      if (serialized) localStorage.setItem(STORAGE_KEY, serialized);
      else localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota / privacy errors
  }
  try {
    if (typeof sessionStorage !== 'undefined') {
      if (serialized) sessionStorage.setItem(STORAGE_KEY, serialized);
      else sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
  writeCookieLockUntil(payload?.lockedUntil ?? null);
}

function notifyLockoutChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(LOCKOUT_EVENT));
  }
}

export function getLockoutStatus(): LockoutStatus {
  const now = Date.now();
  const local =
    typeof localStorage !== 'undefined' ? readStoragePayload(localStorage) : null;
  const session =
    typeof sessionStorage !== 'undefined' ? readStoragePayload(sessionStorage) : null;
  const cookieUntil = readCookieLockUntil();

  const maxLockedUntil = Math.max(
    memoryLockoutState?.lockedUntil ?? 0,
    local?.lockedUntil ?? 0,
    session?.lockedUntil ?? 0,
    cookieUntil ?? 0
  );

  // Cap any tampered future lock timestamp to at most LOCKOUT_DURATION_MS from now
  const validLockedUntil =
    maxLockedUntil > now
      ? Math.min(maxLockedUntil, now + LOCKOUT_DURATION_MS)
      : null;

  if (validLockedUntil) {
    const remainingMs = Math.max(0, validLockedUntil - now);
    return {
      isLocked: true,
      failedAttempts: MAX_FAILED_PASSWORD_ATTEMPTS,
      remainingAttempts: 0,
      lockedUntil: validLockedUntil,
      remainingMs,
    };
  }

  // If a prior lockout expired, clear expired lockout markers cleanly
  if (maxLockedUntil > 0 && maxLockedUntil <= now) {
    writeStoragePayload(null);
    return {
      isLocked: false,
      failedAttempts: 0,
      remainingAttempts: MAX_FAILED_PASSWORD_ATTEMPTS,
      lockedUntil: null,
      remainingMs: 0,
    };
  }

  const failedAttempts = Math.min(
    MAX_FAILED_PASSWORD_ATTEMPTS - 1,
    Math.max(
      memoryLockoutState?.failedAttempts ?? 0,
      local?.failedAttempts ?? 0,
      session?.failedAttempts ?? 0
    )
  );

  return {
    isLocked: false,
    failedAttempts,
    remainingAttempts: Math.max(0, MAX_FAILED_PASSWORD_ATTEMPTS - failedAttempts),
    lockedUntil: null,
    remainingMs: 0,
  };
}

export function recordFailedAttempt(): LockoutStatus {
  const current = getLockoutStatus();
  if (current.isLocked) {
    notifyLockoutChange();
    return current;
  }

  const nextFailures = current.failedAttempts + 1;
  if (nextFailures >= MAX_FAILED_PASSWORD_ATTEMPTS) {
    const lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    writeStoragePayload({
      failedAttempts: MAX_FAILED_PASSWORD_ATTEMPTS,
      lockedUntil,
    });
    notifyLockoutChange();
    return {
      isLocked: true,
      failedAttempts: MAX_FAILED_PASSWORD_ATTEMPTS,
      remainingAttempts: 0,
      lockedUntil,
      remainingMs: LOCKOUT_DURATION_MS,
    };
  }

  writeStoragePayload({
    failedAttempts: nextFailures,
    lockedUntil: null,
  });
  notifyLockoutChange();
  return {
    isLocked: false,
    failedAttempts: nextFailures,
    remainingAttempts: MAX_FAILED_PASSWORD_ATTEMPTS - nextFailures,
    lockedUntil: null,
    remainingMs: 0,
  };
}

export function clearFailedAttempts(): void {
  writeStoragePayload(null);
  notifyLockoutChange();
}

export function subscribeToLockoutChange(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      callback();
    }
  };
  window.addEventListener(LOCKOUT_EVENT, callback);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(LOCKOUT_EVENT, callback);
    window.removeEventListener('storage', handleStorage);
  };
}

export function formatLockoutCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function sha256PureJs(ascii: string): string {
  const rightRotate = (value: number, amount: number) =>
    (value >>> amount) | (value << (32 - amount));

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isComposite: Record<number, boolean> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) {
        isComposite[i] = true;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  let padded = ascii + '\x80';
  while ((padded.length % 64) - 56) padded += '\x00';
  for (let i = 0; i < padded.length; i++) {
    const j = padded.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (let j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);

    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];

      const a = hash[0];
      const e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);
      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash.unshift((temp1 + temp2) | 0);
      hash.pop();
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (let i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function verifyAdminPasscode(rawInput: string): Promise<boolean> {
  const normalized = rawInput.trim();
  if (!normalized) return false;

  try {
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      const encoded = new TextEncoder().encode(normalized);
      const digest = await window.crypto.subtle.digest('SHA-256', encoded);
      const hex = Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      return constantTimeEqual(hex, ADMIN_PASSCODE_SHA256);
    }
  } catch {
    // Fall back to pure-JS SHA-256
  }

  const fallbackHex = sha256PureJs(normalized);
  return constantTimeEqual(fallbackHex, ADMIN_PASSCODE_SHA256);
}
