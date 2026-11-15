// Mobile & Desktop Notification + Sound Engine
// Uses Web Audio API (with gesture unlock) for reliable native-like chimes
// and ServiceWorkerRegistration.showNotification for Android & iOS PWA phone banners.

export type SoundTone = 'message' | 'approval' | 'alert';

export type DevicePermissionState = NotificationPermission | 'unsupported';

const SOUND_ENABLED_KEY = 'elon_meet_sound_alerts_v1';
const PHONE_ALERTS_ENABLED_KEY = 'elon_meet_phone_alerts_v1';

let sharedAudioCtx: AudioContext | null = null;
let audioUnlocked = false;
let unlockListenersAttached = false;

function getOrCreateAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioCtx();
  }
  return sharedAudioCtx;
}

export async function unlockNotificationAudio(): Promise<boolean> {
  const ctx = getOrCreateAudioContext();
  if (!ctx) return false;
  try {
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    if (!audioUnlocked) {
      // Play a silent 1-sample buffer to satisfy iOS Safari / Android Chrome autoplay policies
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      audioUnlocked = true;
    }
    return true;
  } catch {
    return false;
  }
}

export function initNotificationAudioUnlocker(): () => void {
  if (typeof window === 'undefined' || unlockListenersAttached) {
    return () => {};
  }
  unlockListenersAttached = true;

  const handleGesture = () => {
    void unlockNotificationAudio().then((ok) => {
      if (ok) {
        window.removeEventListener('pointerdown', handleGesture, true);
        window.removeEventListener('touchstart', handleGesture, true);
        window.removeEventListener('keydown', handleGesture, true);
        window.removeEventListener('click', handleGesture, true);
        unlockListenersAttached = false;
      }
    });
  };

  window.addEventListener('pointerdown', handleGesture, { capture: true, passive: true });
  window.addEventListener('touchstart', handleGesture, { capture: true, passive: true });
  window.addEventListener('keydown', handleGesture, { capture: true, passive: true });
  window.addEventListener('click', handleGesture, { capture: true, passive: true });

  return () => {
    window.removeEventListener('pointerdown', handleGesture, true);
    window.removeEventListener('touchstart', handleGesture, true);
    window.removeEventListener('keydown', handleGesture, true);
    window.removeEventListener('click', handleGesture, true);
    unlockListenersAttached = false;
  };
}

export function getSavedSoundEnabled(): boolean {
  try {
    const raw = localStorage.getItem(SOUND_ENABLED_KEY);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
}

export function saveSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
  } catch {}
}

export function getSavedPhoneAlertsEnabled(): boolean {
  try {
    const raw = localStorage.getItem(PHONE_ALERTS_ENABLED_KEY);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
}

export function savePhoneAlertsEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(PHONE_ALERTS_ENABLED_KEY, String(enabled));
  } catch {}
}

export function getNotificationPermissionState(): DevicePermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestPhoneNotificationPermission(): Promise<DevicePermissionState> {
  await unlockNotificationAudio();
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return Notification.permission;
  }
}

function scheduleTone(
  ctx: AudioContext,
  freq: number,
  startOffset: number,
  duration: number,
  peakGain: number,
  type: OscillatorType = 'sine'
) {
  const startTime = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

export async function playAppNotificationSound(tone: SoundTone = 'message'): Promise<void> {
  const ctx = getOrCreateAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    if (tone === 'approval') {
      // Crisp native-style 3-note ascending confirmation bell (C5 -> E5 -> G5 -> C6)
      scheduleTone(ctx, 523.25, 0.0, 0.22, 0.14, 'sine');
      scheduleTone(ctx, 659.25, 0.09, 0.24, 0.15, 'sine');
      scheduleTone(ctx, 783.99, 0.18, 0.28, 0.15, 'sine');
      scheduleTone(ctx, 1046.5, 0.27, 0.38, 0.12, 'triangle');
    } else if (tone === 'alert') {
      // Distinct dual-pulse priority alert chime (A5 -> E5 -> A5)
      scheduleTone(ctx, 880.0, 0.0, 0.18, 0.15, 'triangle');
      scheduleTone(ctx, 659.25, 0.13, 0.18, 0.13, 'sine');
      scheduleTone(ctx, 987.77, 0.27, 0.34, 0.15, 'sine');
    } else {
      // Clean two-tone mobile app message chime (G5 -> D6)
      scheduleTone(ctx, 783.99, 0.0, 0.2, 0.13, 'sine');
      scheduleTone(ctx, 1174.66, 0.1, 0.34, 0.14, 'sine');
      scheduleTone(ctx, 1567.98, 0.1, 0.22, 0.035, 'triangle');
    }
  } catch {
    // Ignore audio blocks when user has not interacted yet
  }
}

export function triggerDeviceVibration(pattern: number | number[] = [120, 50, 140]): void {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch {}
}

export interface DeviceNotificationPayload {
  title: string;
  body: string;
  tag?: string;
  category?: string;
  messageId?: string;
  playSound?: boolean;
  soundTone?: SoundTone;
  sendToOs?: boolean;
}

export async function dispatchAppNotification({
  title,
  body,
  tag,
  category,
  messageId,
  playSound = true,
  soundTone = 'message',
  sendToOs = true,
}: DeviceNotificationPayload): Promise<boolean> {
  if (playSound) {
    void playAppNotificationSound(soundTone);
    triggerDeviceVibration();
  }

  if (!sendToOs || typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  const cleanBody = body.replace(/\s+/g, ' ').trim().slice(0, 220);
  const notifTag = tag || `elon-musk-app-${Date.now()}`;

  interface ExtendedNotificationOptions extends NotificationOptions {
    renotify?: boolean;
    vibrate?: number[];
  }

  const options: ExtendedNotificationOptions = {
    body: cleanBody,
    icon: '/favicon-192x192.png',
    badge: '/favicon-96x96.png',
    tag: notifTag,
    renotify: true,
    silent: false,
    vibrate: [140, 60, 140],
    data: {
      url: '/',
      category,
      messageId,
    },
  };

  try {
    // Mobile Chrome / Android & iOS 16.4+ PWA require ServiceWorkerRegistration.showNotification
    if ('serviceWorker' in navigator) {
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 900)),
      ]);
      if (registration && typeof registration.showNotification === 'function') {
        await registration.showNotification(title, options);
        return true;
      }
    }
  } catch {
    // Fall back to direct Notification constructor on desktop
  }

  try {
    const nativeNotif = new Notification(title, options);
    nativeNotif.onclick = () => {
      window.focus();
      nativeNotif.close();
    };
    return true;
  } catch {
    return false;
  }
}
