import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import AuthStatus from '@/components/AuthStatus'; // Import the AuthStatus component

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'DS IV',
  description: 'Distrito Sanitário IV - Recife'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} >
        <h2 className='text-brand-400 font-bold'>Distrito Sanitário IV</h2> {/* Add AuthStatus component here */}
        <main style={{ padding: '20px' }}> {/* Add some padding for content */}
          {children}
        </main>
      </body>
    </html>
  );
}

