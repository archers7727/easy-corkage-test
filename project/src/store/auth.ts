import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { generateRandomNickname } from '../lib/utils';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithRedirect: () => Promise<void>;
  signInWithAdmin: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: { nickname?: string }) => Promise<void>;
  isAdmin: boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,
  isAdmin: false,
  
  setUser: (user) => set({ user, isAdmin: user?.role === 'admin' }),
  
  signInWithGoogle: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data: { user: supabaseUser }, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      
      if (supabaseUser) {
        // Get or create profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();
        
        if (profile) {
          set({ 
            user: profile,
            isAdmin: profile.role === 'admin',
            loading: false 
          });
        } else {
          // Create new profile
          const newUser: User = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            nickname: supabaseUser.user_metadata.full_name || generateRandomNickname(),
            avatar_url: supabaseUser.user_metadata.avatar_url,
            role: 'user',
            active: true,
            created_at: new Date().toISOString()
          };
          
          const { data: newProfile, error: profileError } = await supabase
            .from('profiles')
            .insert([newUser])
            .select()
            .single();
          
          if (profileError) throw profileError;
          
          set({ 
            user: newProfile,
            isAdmin: false,
            loading: false 
          });
        }
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      set({ 
        error: error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.',
        loading: false
      });
      throw error;
    }
  },
  
  signInWithRedirect: async () => {
    try {
      set({ loading: true, error: null });
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
    } catch (error) {
      console.error('Google redirect sign in error:', error);
      set({ 
        error: error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.',
        loading: false
      });
    }
  },
  
  signInWithAdmin: async () => {
    try {
      set({ loading: true, error: null });
      
      const adminUser: User = {
        id: 'admin-user',
        email: 'admin@easycorkage.com',
        nickname: '관리자',
        role: 'admin',
        active: true,
        created_at: new Date().toISOString()
      };
      
      set({ 
        user: adminUser,
        isAdmin: true,
        loading: false,
        error: null
      });
      
    } catch (error) {
      console.error('Admin sign in error:', error);
      set({ 
        error: error instanceof Error ? error.message : '관리자 로그인 중 오류가 발생했습니다.',
        loading: false
      });
    }
  },
  
  signOut: async () => {
    try {
      const { user } = get();
      
      // If user is admin (using our custom admin login)
      if (user?.id === 'admin-user') {
        set({ user: null, isAdmin: false });
        return;
      }
      
      // For regular users, sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      set({ user: null, isAdmin: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '로그아웃 중 오류가 발생했습니다.'
      });
      throw error;
    }
  },
  
  updateUserProfile: async (updates) => {
    try {
      set({ loading: true, error: null });
      
      const { user } = get();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // For development/mock data
      if (user.id.startsWith('mock-') || user.id === 'admin-user') {
        set({
          user: {
            ...user,
            ...(updates.nickname && { nickname: updates.nickname })
          },
          loading: false
        });
        return;
      }
      
      // Update profile in Supabase
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({
          ...(updates.nickname && { nickname: updates.nickname })
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      set({
        user: updatedProfile,
        loading: false
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      set({ 
        error: error instanceof Error ? error.message : '프로필 업데이트 중 오류가 발생했습니다.',
        loading: false
      });
      throw error;
    }
  }
}));

// Set up auth state listener
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (profile) {
      useAuthStore.setState({ 
        user: profile,
        isAdmin: profile.role === 'admin',
        loading: false 
      });
    }
  } else {
    useAuthStore.setState({ user: null, loading: false, isAdmin: false });
  }
});

export default useAuthStore;