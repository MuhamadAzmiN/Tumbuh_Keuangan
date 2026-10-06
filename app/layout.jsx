import { Inter } from 'next/font/google';
import './globals.css';
import { FinanceProvider } from '@/lib/context/FinanceContext';
import { ToastProvider } from '@/lib/context/ToastContext';
import { ThemeProvider } from '@/lib/context/ThemeProvider';

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
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
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
    <html lang="id" className={inter.className} suppressHydrationWarning>
      <body className="min-h-screen bg-[#f0f4ff] dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-100 selection:text-blue-900">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ToastProvider>
            <FinanceProvider>{children}</FinanceProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
