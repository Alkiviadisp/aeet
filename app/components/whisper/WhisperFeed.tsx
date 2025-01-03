'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Heart, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Profile {
  nickname: string;
  avatar_url: string | null;
}

interface Whisper {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profile?: Profile;
  likes_count: number;
  is_liked: boolean;
}

interface WhisperLike {
  user_id: string;
}

interface WhisperData {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profile?: Profile;
  whisper_likes: WhisperLike[];
}

export const WhisperFeed = () => {
  const [whispers, setWhispers] = useState<Whisper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const checkImageExists = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  };

  const cleanupMissingImage = async (whisperId: string) => {
    try {
      await supabase
        .from('whispers')
        .update({ image_url: null })
        .eq('id', whisperId);
      console.log('Cleaned up missing image for whisper:', whisperId);
      
      // After cleaning up the image, check if the whisper is empty
      const { data: whisper } = await supabase
        .from('whispers')
        .select('content')
        .eq('id', whisperId)
        .single();
        
      if (whisper && !whisper.content?.trim()) {
        await deleteEmptyWhisper(whisperId);
      }
    } catch (error) {
      console.error('Error cleaning up missing image:', error);
    }
  };

  const deleteEmptyWhisper = async (whisperId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('whispers')
        .delete()
        .eq('id', whisperId);

      if (deleteError) {
        console.error('Error deleting empty whisper:', deleteError);
        return;
      }

      console.log('Deleted empty whisper:', whisperId);
      // Remove the whisper from the local state
      setWhispers(current => current.filter(w => w.id !== whisperId));
    } catch (error) {
      console.error('Error deleting empty whisper:', error);
    }
  };

  const handleLike = async (whisperId: string) => {
    if (!currentUser) return;

    const whisper = whispers.find(w => w.id === whisperId);
    if (!whisper) return;

    try {
      // Get the user's profile first
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', currentUser)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      if (!profile) {
        console.error('No profile found for user');
        return;
      }

      if (whisper.is_liked) {
        // Unlike
        const { error } = await supabase
          .from('whisper_likes')
          .delete()
          .eq('whisper_id', whisperId)
          .eq('user_id', profile.id);

        if (error) {
          console.error('Error unliking whisper:', error);
          throw error;
        }

        // Update local state
        setWhispers(current =>
          current.map(w =>
            w.id === whisperId
              ? { ...w, is_liked: false, likes_count: w.likes_count - 1 }
              : w
          )
        );
      } else {
        // Like
        const { error } = await supabase
          .from('whisper_likes')
          .insert({
            whisper_id: whisperId,
            user_id: profile.id
          });

        if (error) {
          console.error('Error liking whisper:', error);
          throw error;
        }

        // Update local state
        setWhispers(current =>
          current.map(w =>
            w.id === whisperId
              ? { ...w, is_liked: true, likes_count: w.likes_count + 1 }
              : w
          )
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const fetchWhispers = async () => {
    try {
      console.log('Starting to fetch whispers...');
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user?.id || null);
      console.log('Current user:', user?.id);

      // Get current user's profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      console.log('Current user profile:', userProfile);

      // Fetch all whispers with profiles
      const { data: whispersData, error: whispersError } = await supabase
        .from('whispers')
        .select(`
          id,
          content,
          image_url,
          created_at,
          user_id,
          profiles!whispers_user_id_fkey (
            nickname,
            avatar_url
          ),
          whisper_likes (
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      console.log('Raw whispers query result:', { whispersData, whispersError });

      if (whispersError) {
        console.error('Whispers fetch error:', whispersError);
        throw new Error(`Failed to fetch whispers: ${JSON.stringify(whispersError)}`);
      }

      if (!whispersData) {
        console.log('No whispers found');
        setWhispers([]);
        return;
      }

      console.log('Raw whispers data:', whispersData);
      console.log('Number of whispers found:', whispersData.length);
      whispersData.forEach((whisper, index) => {
        console.log(`Whisper ${index + 1}:`, {
          id: whisper.id,
          content: whisper.content,
          user_id: whisper.user_id,
          isCurrentUser: whisper.user_id === user?.id,
          profile: whisper.profiles
        });
      });

      // Process whispers
      const processedWhispers = whispersData.map((whisper: any) => {
        console.log('Processing whisper:', whisper);
        const likes = whisper.whisper_likes || [];
        const processed = {
          id: whisper.id,
          content: whisper.content,
          image_url: whisper.image_url,
          created_at: whisper.created_at,
          user_id: whisper.user_id,
          profile: {
            nickname: whisper.profiles?.nickname || 'Unknown User',
            avatar_url: whisper.profiles?.avatar_url || null
          },
          likes_count: likes.length,
          is_liked: user ? likes.some((like: any) => like.user_id === user.id) : false
        };
        console.log('Processed whisper:', processed);
        return processed;
      });

      console.log('All processed whispers:', processedWhispers);
      setWhispers(processedWhispers);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching whispers:', error);
      setError(error.message || 'Failed to load whispers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Setting up real-time subscription...');
    
    // Initial fetch
    fetchWhispers();

    // Subscribe to whispers and likes changes
    const channel = supabase
      .channel('whispers-channel')
      .on('postgres_changes', 
        { 
          event: '*',
          schema: 'public',
          table: 'whispers'
        }, 
        (payload) => {
          console.log('Received whispers change:', payload);
          fetchWhispers();
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whisper_likes'
        },
        (payload) => {
          console.log('Received likes change:', payload);
          fetchWhispers();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up subscription...');
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const getAvatarUrl = (avatarPath: string | null | undefined) => {
    if (!avatarPath) return null;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarPath}`;
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    // If it's already a full URL, return it as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // Otherwise, construct the full URL (for backward compatibility)
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/whisper-images/${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-500 bg-red-100 dark:bg-red-900/20 rounded-lg">
        {error}
      </div>
    );
  }

  if (whispers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No whispers yet. Be the first to post something!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {whispers.map((whisper) => (
        <article key={whisper.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
              {getAvatarUrl(whisper.profile?.avatar_url) ? (
                <img
                  src={getAvatarUrl(whisper.profile?.avatar_url)!}
                  alt={whisper.profile?.nickname}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {whisper.profile?.nickname || 'Unknown User'}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  · {formatDistanceToNow(new Date(whisper.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {whisper.content}
              </p>
              {whisper.image_url && getImageUrl(whisper.image_url) && (
                <div className="mt-4">
                  <img
                    src={getImageUrl(whisper.image_url)!}
                    alt="Whisper attachment"
                    className="rounded-lg max-h-96 object-cover"
                    onError={async () => {
                      console.log('Image failed to load, cleaning up:', whisper.image_url);
                      await cleanupMissingImage(whisper.id);
                    }}
                  />
                </div>
              )}
              <div className="mt-4 flex items-center">
                <button 
                  onClick={() => handleLike(whisper.id)}
                  className={`flex items-center space-x-2 transition-colors ${
                    whisper.is_liked 
                      ? 'text-red-500 dark:text-red-400' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${whisper.is_liked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{whisper.likes_count} {whisper.likes_count === 1 ? 'like' : 'likes'}</span>
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}; 