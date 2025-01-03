import { AuthLayout } from '../components/layouts/AuthLayout';

export default function DashboardPage() {
  return (
    <AuthLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Welcome to your dashboard! This is where you'll find an overview of your activity.
        </p>
      </div>
    </AuthLayout>
  );
} 