'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const SignUpForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname: nickname
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            nickname: nickname,
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw new Error('Failed to create profile');
        }

        // 3. Upload avatar if selected
        if (avatar) {
          const fileExt = avatar.name.split('.').pop();
          const fileName = `${authData.user.id}-${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, avatar);

          if (uploadError) {
            console.error('Avatar upload error:', uploadError);
            // Don't throw here, just log the error
          } else {
            // Update profile with avatar URL
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ 
                avatar_url: fileName,
                updated_at: new Date().toISOString()
              })
              .eq('id', authData.user.id);

            if (updateError) {
              console.error('Profile update error:', updateError);
              // Don't throw here, just log the error
            }
          }
        }

        // Show success message or redirect
        if (authData.session) {
          router.push('/dashboard');
          router.refresh();
        } else {
          setError('Please check your email to confirm your account.');
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create your account</h2>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nickname
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Avatar
            </label>
            <input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign up
          </button>
        </div>
      </form>
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}; 