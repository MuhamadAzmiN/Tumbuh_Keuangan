import { Inter } from 'next/font/google';
import './globals.css';
import { FinanceProvider } from '@/lib/context/FinanceContext';
import { ToastProvider } from '@/lib/context/ToastContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'Tumbuh - Catat. Kelola. Capai.',
  description: 'Aplikasi pencatatan tabungan pribadi. Bangun kebiasaan menabung, tumbuhkan tabunganmu, capai tujuanmu.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.className}>
      <body className="min-h-screen bg-[#f0f4ff] text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        <ToastProvider>
          <FinanceProvider>{children}</FinanceProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
