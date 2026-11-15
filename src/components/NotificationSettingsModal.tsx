import React from 'react';
import {
  X,
  BellRing,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  DevicePermissionState,
  playAppNotificationSound,
  triggerDeviceVibration,
} from '../utils/deviceNotifications';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  permissionState: DevicePermissionState;
  phoneAlertsEnabled: boolean;
  soundEnabled: boolean;
  onRequestPermission: () => Promise<DevicePermissionState>;
  onTogglePhoneAlerts: (enabled: boolean) => void;
  onToggleSound: (enabled: boolean) => void;
  onSendTestNotification: () => Promise<void>;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#020611]/90 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-[#061024] border border-blue-500/45 shadow-2xl overflow-hidden text-slate-100 my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#091630] via-[#0d1f44] to-[#230b18] border-b border-blue-900/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-red-600 flex items-center justify-center text-white shadow-md shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-base sm:text-lg text-white truncate">
                Phone Notifications &amp; App Sound
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Notification Settings"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Sound & Vibration Card */}
          <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/70 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-blue-300 mt-0.5 shrink-0" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-bold text-white">
                    App Notification Sound &amp; Haptic Vibration
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Plays a crisp multi-tone chime and gentle mobile vibration whenever a notification arrives.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const next = !soundEnabled;
                  onToggleSound(next);
                  if (next) {
                    void playAppNotificationSound('message');
                    triggerDeviceVibration();
                  }
                }}
                className={`px-3.5 py-2 rounded-lg border text-xs font-bold cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                  soundEnabled
                    ? 'bg-blue-600 border-blue-400 text-white'
                    : 'bg-[#040a18] border-blue-900/70 text-slate-300 hover:text-white'
                }`}
              >
                {soundEnabled ? 'Sound On' : 'Muted'}
              </button>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#08142b] border border-blue-900/70 text-slate-200 hover:text-white text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
