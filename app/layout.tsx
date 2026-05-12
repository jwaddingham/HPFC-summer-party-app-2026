import './globals.css';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><main className="mx-auto min-h-screen max-w-3xl p-4">{children}</main></body></html>;
}
