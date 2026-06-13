import './globals.css';
import React from 'react';

export const metadata = {
  title: 'EvolveAura | Stop Scrolling. Start Evolving.',
  description: 'A psychology-driven digital detox platform to replace short-form media addiction with real life progress.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="min-h-screen relative overflow-hidden bg-[#0F172A]">
          {/* Global Background Glow */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#8B5CF6] opacity-[0.03] blur-[150px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#60A5FA] opacity-[0.03] blur-[150px] pointer-events-none" />
          
          <main className="relative z-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
