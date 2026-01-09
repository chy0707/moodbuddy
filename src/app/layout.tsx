// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';

import AppSplash from '../components/AppSplash';
import DisclaimerGate from '../components/DisclaimerGate';
import BottomTab from '../components/BottomTab';
import NotificationIconButton from '../components/NotificationIconButton';
import SettingsIconButton from '../components/SettingsIconButton';
import { PreferencesProvider } from '../components/PreferencesProvider';

export const metadata: Metadata = {
  title: 'Anchor',
  description: 'A gentle mood companion for everyday mental wellness.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-black pb-16">
        <PreferencesProvider>
          {/* App splash screen (shown once per day on first open) */}
          <AppSplash />

          {/* First-run disclaimer gate (only shows until user acknowledges) */}
          <DisclaimerGate>
            {/* Top-left: notification (homepage only internally) */}
            <NotificationIconButton />

            {/* Top-right: settings */}
            <SettingsIconButton />

            {/* Main page content */}
            {children}

            {/* Bottom navigation (mobile) */}
            <BottomTab />
          </DisclaimerGate>
        </PreferencesProvider>
      </body>
    </html>
  );
}