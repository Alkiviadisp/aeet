'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Mic2, BookOpen, Users } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { useNavbar } from './NavbarContext';

export const Navbar = () => {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useNavbar();
  const navRef = useRef<HTMLElement>(null);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/whisper', label: 'Whisper', icon: Mic2 },
    { href: '/blog', label: 'Blog', icon: BookOpen },
    { href: '/social', label: 'Social Media', icon: Users },
  ];

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  return (
    <nav
      ref={navRef}
      className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex-1 space-y-8">
        <div className={`space-y-2 ${isOpen ? '' : 'items-center'}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center ${isOpen ? 'space-x-3' : 'justify-center'} px-4 py-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <UserMenu isCollapsed={!isOpen} onToggle={() => setIsOpen(!isOpen)} />
      </div>
    </nav>
  );
}; 