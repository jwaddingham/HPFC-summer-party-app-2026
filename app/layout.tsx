import './globals.css';
import Script from 'next/script';
import { ReactNode } from 'react';

export const metadata = {
  title: 'HPFC Summer Tournament Centre',
  description: 'Live tournament boards for the Hinksey Park FC summer party'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
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
        <main className="mx-auto min-h-screen max-w-2xl bg-white">{children}</main>
      </body>
    </html>
  );
}
