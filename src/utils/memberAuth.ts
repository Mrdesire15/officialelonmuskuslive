export interface MemberAccountSnapshot {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

export interface PasswordSecurityReport {
  isValid: boolean;
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Too Weak' | 'Weak' | 'Fair' | 'Strong' | 'Executive Grade';
  checks: {
    minLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    symbol: boolean;
    notCommonOrPersonal: boolean;
  };
  firstIssue: string | null;
}

interface StoredMemberRecord {
  uid: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  saltHex: string;
  passwordHashHex: string;
  createdAt: string;
  lastLoginAt: string;
}

const VAULT_STORAGE_KEY = 'em_member_vault_v1';
const SESSION_STORAGE_KEY = 'em_member_session_v1';
const AUTH_EVENT_NAME = 'em-member-auth-changed';

const COMMON_WEAK_PASSWORDS = new Set([
  'password',
  'password1',
  'password123',
  'password123!',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty123',
  'qwertyuiop',
  'admin123',
  'letmein1',
  'welcome1',
  'elonmusk',
  'elonmusk1',
  'tesla123',
  'spacex123',
  'Passw0rd!',
]);

let memorySessionUid: string | null = null;
const memoryVault = new Map<string, StoredMemberRecord>();

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(Math.floor(hex.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16) || 0;
  }
  return bytes;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
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

function generateSaltHex(byteLength = 16): string {
  const bytes = new Uint8Array(byteLength);
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return toHex(bytes);
}

function generateMemberUid(): string {
  return `mbr_${generateSaltHex(12)}`;
}

async function deriveSaltedPasswordHash(password: string, saltHex: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      const enc = new TextEncoder();
      const baseKey = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );
      const saltBuffer = fromHex(saltHex);
      const derived = await window.crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: saltBuffer.buffer as ArrayBuffer,
          iterations: 100000,
          hash: 'SHA-256',
        },
        baseKey,
        256
      );
      return toHex(new Uint8Array(derived));
    }
  } catch {
    // Fall back to stretched pure-JS SHA-256 if WebCrypto PBKDF2 is unavailable
  }

  let digest = `${saltHex}:${password}`;
  for (let i = 0; i < 2048; i++) {
    digest = sha256PureJs(`${digest}:${saltHex}`) || digest;
  }
  return digest;
}

function loadVault(): Record<string, StoredMemberRecord> {
  const merged: Record<string, StoredMemberRecord> = {};
  memoryVault.forEach((record, key) => {
    merged[key] = record;
  });
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(VAULT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, StoredMemberRecord>;
        Object.entries(parsed).forEach(([key, record]) => {
          if (record && typeof record.email === 'string' && typeof record.passwordHashHex === 'string') {
            merged[key.toLowerCase()] = record;
          }
        });
      }
    }
  } catch {
    // Ignore storage read errors in restricted contexts
  }
  return merged;
}

function saveVaultRecord(record: StoredMemberRecord): void {
  const emailKey = record.email.toLowerCase();
  memoryVault.set(emailKey, record);
  const vault = loadVault();
  vault[emailKey] = record;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(vault));
    }
  } catch {
    // Ignore storage write errors
  }
}

function readActiveSessionUid(): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const uid = localStorage.getItem(SESSION_STORAGE_KEY);
      if (uid) {
        memorySessionUid = uid;
        return uid;
      }
    }
  } catch {
    // Ignore storage read errors
  }
  return memorySessionUid;
}

function writeActiveSessionUid(uid: string | null): void {
  memorySessionUid = uid;
  try {
    if (typeof localStorage !== 'undefined') {
      if (uid) localStorage.setItem(SESSION_STORAGE_KEY, uid);
      else localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_EVENT_NAME));
  }
}

function recordToSnapshot(record: StoredMemberRecord): MemberAccountSnapshot {
  return {
    uid: record.uid,
    email: record.email,
    displayName: record.displayName,
    emailVerified: record.emailVerified,
  };
}

export function getCurrentMemberSnapshot(): MemberAccountSnapshot | null {
  const uid = readActiveSessionUid();
  if (!uid) return null;
  const vault = loadVault();
  const match = Object.values(vault).find((rec) => rec.uid === uid);
  return match ? recordToSnapshot(match) : null;
}

export function isValidEmailAddress(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (!normalized || normalized.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalized);
}

export function evaluatePasswordSecurity(
  password: string,
  email = '',
  displayName = ''
): PasswordSecurityReport {
  const minLength = password.length >= 6 && password.length <= 128;
  const uppercase = /[A-Z]/.test(password);
  const lowercase = /[a-z]/.test(password);
  const number = /[0-9]/.test(password);
  const symbol = /[^A-Za-z0-9\s]/.test(password);

  const lowerPassword = password.toLowerCase();
  const emailLocal = email.trim().toLowerCase().split('@')[0] || '';
  const nameTokens = displayName
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length >= 4);

  const containsPersonal =
    (emailLocal.length >= 4 && lowerPassword.includes(emailLocal)) ||
    nameTokens.some((token) => lowerPassword.includes(token));
  const isCommon = COMMON_WEAK_PASSWORDS.has(password) || COMMON_WEAK_PASSWORDS.has(lowerPassword);
  const hasWhitespaceEdge = password !== password.trim();
  const notCommonOrPersonal = !isCommon && !containsPersonal && !hasWhitespaceEdge;

  let passedCount = 0;
  if (password.length >= 8) passedCount += 1;
  if (uppercase && lowercase) passedCount += 1;
  if (number) passedCount += 1;
  if (symbol) passedCount += 1;

  let score: 0 | 1 | 2 | 3 | 4 = 0;
  if (password.length === 0) {
    score = 0;
  } else if (!minLength || !notCommonOrPersonal) {
    score = 1;
  } else if (passedCount <= 1) {
    score = 2;
  } else if (passedCount <= 3) {
    score = 3;
  } else {
    score = 4;
  }

  const labelMap: Record<0 | 1 | 2 | 3 | 4, PasswordSecurityReport['label']> = {
    0: 'Too Weak',
    1: 'Weak',
    2: 'Fair',
    3: 'Strong',
    4: 'Executive Grade',
  };

  let firstIssue: string | null = null;
  if (hasWhitespaceEdge) {
    firstIssue = 'Password cannot start or end with spaces.';
  } else if (password.length < 6) {
    firstIssue = 'Password must be at least 6 characters.';
  } else if (password.length > 128) {
    firstIssue = 'Password must be 128 characters or fewer.';
  } else if (isCommon) {
    firstIssue = 'Choose a less predictable password.';
  }

  const isValid = minLength && !hasWhitespaceEdge && !isCommon;

  return {
    isValid,
    score,
    label: labelMap[score],
    checks: {
      minLength,
      uppercase,
      lowercase,
      number,
      symbol,
      notCommonOrPersonal,
    },
    firstIssue,
  };
}

export function mapMemberAuthError(error: unknown): {
  code: string;
  message: string;
  isCredentialFailure: boolean;
} {
  const rawCode =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
      ? (error as { code: string }).code
      : 'auth/unknown';

  switch (rawCode) {
    case 'auth/email-already-in-use':
      return {
        code: rawCode,
        message: 'An account with this email is already registered. Please sign in or reset your password.',
        isCredentialFailure: false,
      };
    case 'auth/invalid-email':
      return {
        code: rawCode,
        message: 'Please enter a valid email address.',
        isCredentialFailure: false,
      };
    case 'auth/weak-password':
      return {
        code: rawCode,
        message: 'Password must be at least 6 characters.',
        isCredentialFailure: false,
      };
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
      return {
        code: rawCode,
        message: 'Invalid email or password. Please verify your credentials and try again.',
        isCredentialFailure: true,
      };
    default:
      return {
        code: rawCode,
        message: 'Unable to complete sign-in request. Please verify your email and password and try again.',
        isCredentialFailure: false,
      };
  }
}

function createCodedAuthError(code: string, message: string): Error & { code: string } {
  const err = new Error(message) as Error & { code: string };
  err.code = code;
  return err;
}

export async function registerMemberWithEmail(params: {
  displayName: string;
  email: string;
  password: string;
}): Promise<{ user: MemberAccountSnapshot }> {
  const normalizedEmail = params.email.trim().toLowerCase().slice(0, 254);
  if (!isValidEmailAddress(normalizedEmail)) {
    throw createCodedAuthError('auth/invalid-email', 'Please enter a valid email address.');
  }
  if (params.password.length < 6) {
    throw createCodedAuthError('auth/weak-password', 'Password must be at least 6 characters.');
  }

  const vault = loadVault();
  if (vault[normalizedEmail]) {
    throw createCodedAuthError(
      'auth/email-already-in-use',
      'An account with this email is already registered.'
    );
  }

  const cleanName =
    params.displayName.trim().slice(0, 120) || normalizedEmail.split('@')[0] || 'Member';
  const saltHex = generateSaltHex(16);
  const passwordHashHex = await deriveSaltedPasswordHash(params.password, saltHex);
  const nowIso = new Date().toISOString();

  const record: StoredMemberRecord = {
    uid: generateMemberUid(),
    email: normalizedEmail,
    displayName: cleanName,
    emailVerified: true,
    saltHex,
    passwordHashHex,
    createdAt: nowIso,
    lastLoginAt: nowIso,
  };

  saveVaultRecord(record);
  writeActiveSessionUid(record.uid);

  return {
    user: recordToSnapshot(record),
  };
}

export async function authenticateMemberWithEmailAndPassword(params: {
  email: string;
  password: string;
}): Promise<{ user: MemberAccountSnapshot; isNewAccount: boolean }> {
  const normalizedEmail = params.email.trim().toLowerCase().slice(0, 254);
  if (!isValidEmailAddress(normalizedEmail)) {
    throw createCodedAuthError('auth/invalid-email', 'Please enter a valid email address.');
  }
  if (params.password.length < 6) {
    throw createCodedAuthError('auth/weak-password', 'Password must be at least 6 characters.');
  }

  const vault = loadVault();
  const existing = vault[normalizedEmail];

  if (!existing) {
    const defaultName = normalizedEmail.split('@')[0]?.slice(0, 120) || 'Member';
    const created = await registerMemberWithEmail({
      displayName: defaultName,
      email: normalizedEmail,
      password: params.password,
    });
    return { user: created.user, isNewAccount: true };
  }

  const candidateHash = await deriveSaltedPasswordHash(params.password, existing.saltHex);
  if (!constantTimeEqual(candidateHash, existing.passwordHashHex)) {
    throw createCodedAuthError('auth/wrong-password', 'Invalid email or password.');
  }

  const updated: StoredMemberRecord = {
    ...existing,
    emailVerified: true,
    lastLoginAt: new Date().toISOString(),
  };
  saveVaultRecord(updated);
  writeActiveSessionUid(updated.uid);

  return { user: recordToSnapshot(updated), isNewAccount: false };
}

export async function resetMemberPasswordByEmail(params: {
  email: string;
  newPassword: string;
}): Promise<MemberAccountSnapshot> {
  const normalizedEmail = params.email.trim().toLowerCase().slice(0, 254);
  if (!isValidEmailAddress(normalizedEmail)) {
    throw createCodedAuthError('auth/invalid-email', 'Please enter a valid email address.');
  }
  if (params.newPassword.length < 6) {
    throw createCodedAuthError('auth/weak-password', 'Password must be at least 6 characters.');
  }

  const vault = loadVault();
  const existing = vault[normalizedEmail];
  if (!existing) {
    const defaultName = normalizedEmail.split('@')[0]?.slice(0, 120) || 'Member';
    const created = await registerMemberWithEmail({
      displayName: defaultName,
      email: normalizedEmail,
      password: params.newPassword,
    });
    return created.user;
  }

  const newSaltHex = generateSaltHex(16);
  const newPasswordHashHex = await deriveSaltedPasswordHash(params.newPassword, newSaltHex);
  const updated: StoredMemberRecord = {
    ...existing,
    saltHex: newSaltHex,
    passwordHashHex: newPasswordHashHex,
    emailVerified: true,
    lastLoginAt: new Date().toISOString(),
  };
  saveVaultRecord(updated);
  writeActiveSessionUid(updated.uid);

  return recordToSnapshot(updated);
}

export async function updateMemberDisplayName(
  displayName: string
): Promise<MemberAccountSnapshot | null> {
  const uid = readActiveSessionUid();
  if (!uid) return null;

  const vault = loadVault();
  const existing = Object.values(vault).find((rec) => rec.uid === uid);
  if (!existing) return null;

  const cleanName = displayName.trim().slice(0, 120);
  if (!cleanName) return recordToSnapshot(existing);

  const updated: StoredMemberRecord = {
    ...existing,
    displayName: cleanName,
  };
  saveVaultRecord(updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_EVENT_NAME));
  }
  return recordToSnapshot(updated);
}

export async function signOutMember(): Promise<void> {
  writeActiveSessionUid(null);
}

export function subscribeToMemberAuth(
  callback: (member: MemberAccountSnapshot | null) => void
): () => void {
  callback(getCurrentMemberSnapshot());

  if (typeof window === 'undefined') {
    return () => {};
  }

  const sync = () => {
    callback(getCurrentMemberSnapshot());
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === SESSION_STORAGE_KEY || e.key === VAULT_STORAGE_KEY || e.key === null) {
      sync();
    }
  };

  window.addEventListener(AUTH_EVENT_NAME, sync);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(AUTH_EVENT_NAME, sync);
    window.removeEventListener('storage', handleStorage);
  };
}
