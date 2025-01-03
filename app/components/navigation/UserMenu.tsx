'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { LogOut, User, Sun, Moon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import Link from 'next/link';

interface UserMenuProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

interface Profile {
  id: string;
  nickname: string;
  avatar_url: string | null;
}

export const UserMenu = ({ isCollapsed = false, onToggle }: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('Fetching user profile...');
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error fetching user:', userError);
          return;
        }

        if (!user) {
          console.log('No authenticated user found');
          return;
        }

        console.log('User found:', user.id);

        // Try to get existing profile
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, nickname, avatar_url')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
          return;
        }

        if (!existingProfile) {
          console.log('Profile not found, creating new profile...');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              nickname: user.email?.split('@')[0] || 'Anonymous',
              avatar_url: null,
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            return;
          }

          console.log('New profile created:', newProfile);
          setProfile(newProfile);
          return;
        }

        console.log('Profile found:', existingProfile);
        setProfile(existingProfile);
      } catch (error) {
        console.error('Unexpected error in fetchProfile:', error);
      }
    };

    fetchProfile();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
    router.refresh();
  };

  const getAvatarUrl = () => {
    if (!profile?.avatar_url) return '';
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}`;
  };

  const handleClick = () => {
    if (isCollapsed && onToggle) {
      onToggle();
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center overflow-hidden">
          {profile?.avatar_url ? (
            <img
              src={getAvatarUrl()}
              alt={profile.nickname}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
          )}
        </div>
        {!isCollapsed && (
          <span className="text-gray-700 dark:text-gray-300">{profile?.nickname}</span>
        )}
      </button>

      {isOpen && !isCollapsed && (
        <div className="absolute bottom-full left-0 mb-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
          <Link
            href="/profile"
            className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </Link>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}; 