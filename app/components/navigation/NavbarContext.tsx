'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface NavbarContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export function NavbarProvider({ children }: { children: React.ReactNode }) {
  // Start with a default state that matches the server
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only run on client-side after initial render
    const savedState = localStorage.getItem('navbarOpen');
    if (savedState !== null) {
      setIsOpen(savedState === 'true');
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    // Only save to localStorage after initialization
    if (isInitialized) {
      localStorage.setItem('navbarOpen', isOpen.toString());
    }
  }, [isOpen, isInitialized]);

  return (
    <NavbarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </NavbarContext.Provider>
  );
}

export function useNavbar() {
  const context = useContext(NavbarContext);
  if (context === undefined) {
    throw new Error('useNavbar must be used within a NavbarProvider');
  }
  return context;
} 