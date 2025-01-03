'use client';

import { Navbar } from '../navigation/Navbar';
import { useNavbar } from '../navigation/NavbarContext';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  const { isOpen } = useNavbar();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="transition-all duration-500 ease-in-out transform-gpu ml-20 p-8">
        {children}
      </main>
    </div>
  );
}; 