'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Mic2, BookOpen, Users } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { useNavbar } from './NavbarContext';

export const Navbar = () => {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useNavbar();
  const navRef = useRef<HTMLElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null as unknown as ReturnType<typeof setTimeout>);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsHovered(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [setIsOpen]);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(true);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      setIsOpen(false);
    }, 300); // Small delay to prevent flickering
  };

  const handleNavClick = () => {
    setIsOpen(true);
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/whisper', label: 'Whisper', icon: Mic2 },
    { href: '/blog', label: 'Blog', icon: BookOpen },
    { href: '/social', label: 'Social Media', icon: Users },
  ];

  const isActive = (path: string) => pathname === path;

  // Prevent hydration mismatch by not rendering transitions until mounted
  const navClasses = `fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col cursor-pointer z-50 ${
    isMounted ? 'transition-all duration-500 ease-in-out transform-gpu' : ''
  } ${isOpen || isHovered ? 'w-64 shadow-lg' : 'w-20'}`;

  return (
    <nav 
      ref={navRef} 
      className={navClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleNavClick}
    >
      <div className="flex-1 space-y-8">
        <div className={`space-y-2 ${!isOpen && !isHovered && 'items-center'}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center ${
                  isOpen || isHovered ? 'space-x-3' : 'justify-center'
                } px-4 py-2 rounded-lg transition-all duration-300 ease-in-out ${
                  isActive(item.href)
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0 transition-transform duration-300 ease-in-out" />
                {(isOpen || isHovered) && (
                  <span className="transition-opacity duration-300 ease-in-out opacity-100">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="transition-all duration-300 ease-in-out">
        <UserMenu isCollapsed={!isOpen && !isHovered} onToggle={() => setIsOpen(!isOpen)} />
      </div>
    </nav>
  );
}; 