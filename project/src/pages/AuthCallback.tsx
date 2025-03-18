import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';
import { generateRandomNickname } from '../lib/utils';

export function AuthCallback() {
  const navigate = useNavigate();
  const setUser = useAuthStore(state => state.setUser);

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!profile) {
          // Create new profile
          const nickname = generateRandomNickname();
          const { data: newProfile, error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                email: user.email,
                nickname,
                avatar_url: user.user_metadata.avatar_url,
                role: 'user'
              }
            ])
            .select()
            .single();

          if (profileError) {
            console.error('Error creating profile:', profileError);
            return;
          }

          setUser(newProfile);
        } else {
          setUser(profile);
        }

        navigate('/');
      } else {
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p className="mt-4 text-gray-600">Completing login...</p>
    </div>
  );
}