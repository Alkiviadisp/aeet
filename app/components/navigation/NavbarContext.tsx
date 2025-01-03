'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface NavbarContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export function NavbarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load initial state from localStorage, default to false (closed)
    const savedState = localStorage.getItem('navbarOpen');
    setIsOpen(savedState === null ? false : savedState === 'true');
  }, []);

  useEffect(() => {
    // Save state to localStorage whenever it changes
    localStorage.setItem('navbarOpen', isOpen.toString());
  }, [isOpen]);

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