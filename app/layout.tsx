import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { OrderProvider } from '@/context/OrderContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Urbn Furnish Admin | E-Commerce Control Center',
  description: 'Enterprise E-Commerce Admin Panel for Urbn Furnish',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-bgColor text-textColor antialiased">
        <AuthProvider>
          <OrderProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: 'var(--surface-color)',
                  color: 'var(--text-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                },
              }}
            />
            {children}
          </OrderProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
