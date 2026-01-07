'use client';

import { useEffect, useMemo, useState } from 'react';

/**
 * LocalStorage key used to remember if the user has dismissed
 * the install prompt, so we don't show it repeatedly.
 */
const DISMISS_KEY = 'anchor.installPrompt.dismissed.v1';

/**
 * Detect iOS devices (including iPadOS running in desktop mode).
 */
function isIOS() {
  if (typeof window === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1)
  );
}

/**
 * Detect Safari browser.
 * (Required because only Safari on iOS supports Add to Home Screen.)
 */
function isSafari() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(ua);
}

/**
 * Check if the app is already running in standalone (installed) mode.
 */
function isStandalone() {
  if (typeof window === 'undefined') return false;

  // iOS-specific standalone flag
  const navStandalone = (navigator as any).standalone === true;

  // Standard PWA display-mode check
  const mqlStandalone = window.matchMedia?.('(display-mode: standalone)')?.matches;

  return !!navStandalone || !!mqlStandalone;
}

/**
 * Type definition for the beforeinstallprompt event (Android/Chrome).
 */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | null>(null);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  /**
   * Read whether the user has previously dismissed the prompt.
   */
  const dismissed = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(DISMISS_KEY) === '1';
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Do not show if already installed or dismissed
    if (isStandalone() || dismissed) return;

    /**
     * Android / Chrome:
     * Capture the beforeinstallprompt event to enable a custom install UI.
     */
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setPlatform('android');
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    /**
     * iOS:
     * Safari does not support beforeinstallprompt,
     * so we show a custom instructional prompt instead.
     */
    if (isIOS() && isSafari()) {
      // Delay slightly to avoid showing immediately on page load
      const t = window.setTimeout(() => {
        if (!isStandalone() && !dismissed) {
          setPlatform('ios');
          setShow(true);
        }
      }, 1200);

      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
        window.clearTimeout(t);
      };
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!show || !platform) return null;

  /**
   * Close the prompt and persist dismissal state.
   */
  const onClose = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Ignore storage errors
    }
    setShow(false);
  };

  /**
   * Trigger native install prompt on Android/Chrome.
   */
  const onInstallAndroid = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    onClose();
  };

  return (
    <div className="fixed inset-x-0 bottom-4 z-[9999] px-4">
      <div className="mx-auto max-w-md rounded-3xl border border-gray-200 bg-white/95 backdrop-blur shadow-lg p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-black">
              Save Anchor to your Home Screen
            </div>

            {platform === 'ios' ? (
              <div className="mt-1 text-xs text-gray-600 leading-relaxed">
                In <b>Safari</b>, tap <b>Share</b> (↑) → <b>Add to Home Screen</b>.
              </div>
            ) : (
              <div className="mt-1 text-xs text-gray-600 leading-relaxed">
                Install Anchor for a faster, app-like experience.
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="h-9 w-9 shrink-0 rounded-full border border-gray-200 bg-white text-gray-700"
            aria-label="Close install prompt"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-full text-xs font-semibold border border-gray-200 bg-white text-gray-700"
          >
            Not now
          </button>

          {platform === 'android' ? (
            <button
              onClick={onInstallAndroid}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-black text-white"
            >
              Install
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-black text-white"
            >
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
}