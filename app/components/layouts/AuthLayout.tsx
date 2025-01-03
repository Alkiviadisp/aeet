'use client';

import { Navbar } from '../navigation/Navbar';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}; 