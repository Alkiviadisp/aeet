'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Mic2, BookOpen, Users } from 'lucide-react';
import { UserMenu } from './UserMenu';

export const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/whisper', label: 'Whisper', icon: Mic2 },
    { href: '/blog', label: 'Blog', icon: BookOpen },
    { href: '/social', label: 'Social Media', icon: Users },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col">
      <div className="flex-1 space-y-8">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <UserMenu />
      </div>
    </nav>
  );
}; 