import { supabase, shouldUseMockData } from '../lib/supabase';
import { User } from '../types';
import { mockData } from '../data/mockData';

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    // If we should use mock data, return mock users
    if (shouldUseMockData()) {
      console.log('Using mock users data');
      return mockData.users;
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      // Return mock data if no users found
      return mockData.users;
    }
    
    return data.map(user => ({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatar_url: user.avatar_url,
      role: user.role,
      active: user.active,
      created_at: user.created_at
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    // Return mock data in case of error
    return mockData.users;
  }
};

// Update user
export const updateUser = async (id: string, updates: Partial<User>): Promise<void> => {
  try {
    // If we should use mock data, do nothing
    if (shouldUseMockData()) {
      console.log('Using mock data for updating user');
      return;
    }
    
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Toggle user active status
export const toggleUserActive = async (id: string): Promise<boolean> => {
  try {
    // If we should use mock data, simulate toggling
    if (shouldUseMockData()) {
      console.log('Using mock data for toggling user active status');
      return false; // Simulate deactivation
    }
    
    // Get current status
    const { data, error } = await supabase
      .from('users')
      .select('active')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Toggle status
    const newStatus = !data.active;
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ active: newStatus })
      .eq('id', id);
    
    if (updateError) throw updateError;
    
    return newStatus;
  } catch (error) {
    console.error('Error toggling user active status:', error);
    throw error;
  }
};

export default {
  getAllUsers,
  updateUser,
  toggleUserActive
};