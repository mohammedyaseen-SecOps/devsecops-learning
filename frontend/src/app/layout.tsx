import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'GRC Platform - Enterprise Governance, Risk & Compliance',
  description: 'Multi-tenant SaaS platform for managing governance, risk, and compliance',
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-dark-900 text-dark-900 dark:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
