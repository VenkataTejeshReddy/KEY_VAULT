import type { Metadata } from 'next';
import './globals.css';
import { VaultProvider } from '../context/VaultContext';

export const metadata: Metadata = {
  title: 'KeyVault — API Key Vault & Telemetry Dashboard',
  description:
    'Secure personal API key vault, rate limit telemetry monitoring, and usage dashboard.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased min-h-screen selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-200">
        <VaultProvider>{children}</VaultProvider>
      </body>
    </html>
  );
}
