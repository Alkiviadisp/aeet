import { AuthLayout } from '../components/layouts/AuthLayout';

export default function DashboardPage() {
  return (
    <AuthLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AEET</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Καλώς ήρθατε στην πλατφόρμα της ΑΕΕΤ.
        </p>
      </div>
    </AuthLayout>
  );
} 