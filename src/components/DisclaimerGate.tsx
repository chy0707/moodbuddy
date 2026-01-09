'use client';

import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'anchor.disclaimer.ack.v1';

type Props = {
  children: React.ReactNode;
};

export default function DisclaimerGate({ children }: Props) {
  const [ready, setReady] = useState(false);
  const [ack, setAck] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      setAck(v === '1');
    } catch {
      setAck(false);
    } finally {
      setReady(true);
    }
  }, []);

  const shouldShow = useMemo(() => ready && !ack, [ready, ack]);

  function onAcknowledge() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    setAck(true);
  }

  // Avoid flash during hydration: render nothing until we've checked localStorage.
  if (!ready) return null;

  // Once acknowledged, render the app normally.
  if (!shouldShow) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Dimmed backdrop */}
      <div className="fixed inset-0 bg-black/30 dark:bg-black/60" />

      {/* Disclaimer card */}
      <div className="fixed inset-0 z-[9998] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl bg-white/95 dark:bg-white/10 border border-gray-200 dark:border-white/10 p-5 shadow-xl">
          <div className="text-lg font-extrabold text-black dark:text-white">A quick note</div>

          <div className="mt-3 space-y-3 text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
            <p>
              Anchor is a personal mood-tracking demo. It is <span className="font-semibold">not</span> a medical
              device and does not provide professional diagnosis or treatment.
            </p>
            <p>
              If you feel unsafe or need urgent help, please contact local emergency services or a qualified
              professional.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your data stays on this device (local storage) unless you export it.
            </p>
          </div>

          <button
            type="button"
            onClick={onAcknowledge}
            className="mt-5 w-full h-11 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-semibold active:scale-[0.99] transition"
          >
            I understand
          </button>

          <div className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">
            This message will only appear once.
          </div>
        </div>
      </div>
    </div>
  );
}