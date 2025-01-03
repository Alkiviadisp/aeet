'use client';

import { AuthLayout } from '../components/layouts/AuthLayout';
import { ProfileForm } from '../components/profile/ProfileForm';

export default function ProfilePage() {
  return (
    <AuthLayout>
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
          <ProfileForm />
        </div>
      </div>
    </AuthLayout>
  );
} 