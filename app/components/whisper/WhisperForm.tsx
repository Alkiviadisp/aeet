'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ImagePlus, X } from 'lucide-react';

interface WhisperFormProps {
  onWhisperCreated?: () => void;
}

export const WhisperForm = ({ onWhisperCreated }: WhisperFormProps) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const uploadImage = async (file: File, userId: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      console.log('Uploading image:', fileName);
      const { data, error: uploadError } = await supabase.storage
        .from('whisper-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('whisper-images')
        .getPublicUrl(data.path);

      console.log('Image uploaded successfully, public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Starting whisper creation process...');
      
      // 1. Check authentication and get profile
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }
      if (!user) throw new Error('Not authenticated');
      console.log('User authenticated:', user.id);

      // Get or create the user's profile
      let profile;
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
        throw new Error('Failed to fetch profile');
      }

      if (!existingProfile) {
        // Profile doesn't exist, create it
        const { data: newProfile, error: createProfileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            nickname: user.email?.split('@')[0] || 'Anonymous',
            avatar_url: null,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createProfileError) {
          console.error('Error creating profile:', createProfileError);
          throw new Error('Failed to create profile');
        }
        profile = newProfile;
      } else {
        profile = existingProfile;
      }

      console.log('Profile found/created:', profile);

      // 2. Handle image upload if present
      let imagePath = null;
      if (image) {
        console.log('Starting image upload...');
        imagePath = await uploadImage(image, user.id);
        console.log('Image uploaded successfully:', imagePath);
      }

      // 3. Create whisper
      const whisperData = {
        user_id: profile.id,
        content: content.trim(),
        image_url: imagePath,
      };
      console.log('Creating whisper with data:', whisperData);

      const { data: newWhisper, error: whisperError } = await supabase
        .from('whispers')
        .insert(whisperData)
        .select()
        .single();

      if (whisperError) {
        console.error('Whisper insert error:', whisperError);
        throw whisperError;
      }

      console.log('Whisper created successfully:', newWhisper);

      // Success! Clear the form
      setContent('');
      setImage(null);
      setImagePreview(null);

      // Trigger refresh of the feed
      onWhisperCreated?.();
    } catch (error: any) {
      console.error('Detailed error:', error);
      setError(error.message || 'Failed to post whisper. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
      <div className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/20 rounded-lg">
            {error}
          </div>
        )}
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full px-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 bg-gray-100 dark:bg-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={3}
        />
        
        {imagePreview && (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-64 rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-gray-900/50 rounded-full text-white hover:bg-gray-900/75 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400">
            <ImagePlus className="w-5 h-5" />
            <span className="text-sm">Add image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          <button
            type="submit"
            disabled={isLoading || (!content.trim() && !image)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Posting...' : 'Whisper'}
          </button>
        </div>
      </div>
    </form>
  );
}; 