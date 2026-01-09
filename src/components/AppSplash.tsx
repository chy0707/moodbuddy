'use client';

import { useEffect, useState } from 'react';

const SPLASH_SEEN_KEY = 'anchor.splash.seen.v1';

export default function AppSplash({ onDone }: { onDone?: () => void }) {
  const [visible, setVisible] = useState(false);
  const [iconOk, setIconOk] = useState(true);

  useEffect(() => {
    let timeoutId: number | null = null;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      setVisible(false);
      onDone?.();
    };

    try {
      const seen = sessionStorage.getItem(SPLASH_SEEN_KEY);

      // If splash was already shown in this session, do not block the UI.
      if (seen === '1') {
        finish();
        return;
      }

      sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
      setVisible(true);

      // Keep splash visible briefly, then hand off to the app.
      timeoutId = window.setTimeout(finish, 900);
      return () => {
        if (timeoutId != null) window.clearTimeout(timeoutId);
      };
    } catch {
      // If sessionStorage is unavailable, still show splash once (best-effort).
      setVisible(true);
      timeoutId = window.setTimeout(finish, 900);
      return () => {
        if (timeoutId != null) window.clearTimeout(timeoutId);
      };
    }
  }, [onDone]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#FFF7F2]">
      <div className="flex flex-col items-center animate-fade-in">
        {/* App icon */}
        <div className="h-20 w-20 rounded-[22px] bg-white shadow-sm flex items-center justify-center overflow-hidden">
          {iconOk ? (
            <img
              src="/screenshots/icon/anchor_icon_192.png"
              alt="Anchor"
              className="h-14 w-14"
              draggable={false}
              loading="eager"
              decoding="async"
              onError={() => setIconOk(false)}
            />
          ) : (
            <div className="text-2xl" aria-label="Anchor icon fallback">
              ⚓️
            </div>
          )}
        </div>

        {/* App name */}
        <div className="mt-4 text-[18px] font-extrabold tracking-tight text-black">Anchor</div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.35s ease-out both;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}