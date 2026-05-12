import './globals.css';
import Script from 'next/script';
import { ReactNode } from 'react';
import { Metadata } from 'next';
import { PWARegistration } from '@/components/PWARegistration';

export const metadata: Metadata = {
  title: 'HPFC Summer Tournament Centre',
  description: 'Live tournament boards for the Hinksey Park FC summer party',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg'
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HPFC Tournament'
  },
  formatDetection: {
    telephone: false
  },
  themeColor: '#b71c1c',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HPFC Tournament" />
        <meta name="msapplication-TileColor" content="#b71c1c" />
        <meta name="msapplication-TileImage" content="/favicon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <Script id="pendo-install" strategy="afterInteractive">{`
(function(apiKey){
    (function(p,e,n,d,o){var v,w,x,y,z;o=p[d]=p[d]||{};o._q=o._q||[];
    v=['initialize','identify','updateOptions','pageLoad','track', 'trackAgent'];for(w=0,x=v.length;w<x;++w)(function(m){
    o[m]=o[m]||function(){o._q[m===v[0]?'unshift':'push']([m].concat([].slice.call(arguments,0)));};})(v[w]);
    y=e.createElement(n);y.async=!0;y.src='https://cdn.pendo.io/agent/static/'+apiKey+'/pendo.js';
    z=e.getElementsByTagName(n)[0];z.parentNode.insertBefore(y,z);})(window,document,'script','pendo');
})('6d4aff0b-8038-41f6-8efb-7284da086ebb');

pendo.initialize({
    visitor: {
        id: ''
    }
});
`}</Script>
      </head>
      <body className="bg-white text-ink">
        <PWARegistration />
        <main className="mx-auto min-h-screen max-w-2xl bg-white">{children}</main>
      </body>
    </html>
  );
}
