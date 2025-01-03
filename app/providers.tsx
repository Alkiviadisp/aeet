'use client';

import { ThemeProvider } from 'next-themes';
import { NavbarProvider } from './components/navigation/NavbarContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NavbarProvider>
        {children}
      </NavbarProvider>
    </ThemeProvider>
  );
} 