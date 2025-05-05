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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="relative w-full min-h-screen overflow-hidden">
          {/* Vídeo como fundo */}
          <video
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/videos/background.mp4" type="video/mp4" />
            Seu navegador não suporta vídeo em HTML5.
          </video>
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-40 z-0" />

          {/* Conteúdo acima do vídeo */}
          <div className="relative z-10">
            <h2 className="text-brand-50 font-bold p-4">Distrito Sanitário IV</h2>
            <main className="p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}


