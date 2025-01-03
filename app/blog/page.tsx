import { AuthLayout } from '../components/layouts/AuthLayout';

export default function BlogPage() {
  return (
    <AuthLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blog</h1>
        <p className="text-gray-600 dark:text-gray-300">
          This is the blog section of your application.
        </p>
      </div>
    </AuthLayout>
  );
} 