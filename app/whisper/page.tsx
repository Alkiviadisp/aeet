import { AuthLayout } from '../components/layouts/AuthLayout';
import { WhisperForm } from '../components/whisper/WhisperForm';
import { WhisperFeed } from '../components/whisper/WhisperFeed';

export default function WhisperPage() {
  return (
    <AuthLayout>
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Whisper</h1>
          <WhisperForm />
          <WhisperFeed />
        </div>
      </div>
    </AuthLayout>
  );
} 