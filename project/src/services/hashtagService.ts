import { supabase, shouldUseMockData } from '../lib/supabase';
import { mockData } from '../data/mockData';

// Get all hashtags
export const getAllHashtags = async (): Promise<string[]> => {
  try {
    // If we should use mock data, return mock hashtags
    if (shouldUseMockData()) {
      console.log('Using mock hashtags data');
      return mockData.hashtags;
    }
    
    const { data, error } = await supabase
      .from('hashtags')
      .select('name')
      .order('name');
    
    if (error) throw error;
    
    // If no data, return mock data for development
    if (!data || data.length === 0) {
      return mockData.hashtags;
    }
    
    return data.map(row => row.name);
  } catch (error) {
    console.error('Error fetching hashtags:', error);
    
    // Return mock data if there's an error
    return mockData.hashtags;
  }
};

// Add a hashtag
export const addHashtag = async (name: string): Promise<void> => {
  try {
    // If we should use mock data, simulate adding a hashtag
    if (shouldUseMockData()) {
      console.log('Using mock data for adding hashtag');
      return;
    }
    
    const { error } = await supabase
      .from('hashtags')
      .insert([{ name, count: 0 }]);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error adding hashtag:', error);
    throw error;
  }
};

// Remove a hashtag
export const removeHashtag = async (name: string): Promise<void> => {
  try {
    // If we should use mock data, simulate removing a hashtag
    if (shouldUseMockData()) {
      console.log('Using mock data for removing hashtag');
      return;
    }
    
    const { error } = await supabase
      .from('hashtags')
      .delete()
      .eq('name', name);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error removing hashtag:', error);
    throw error;
  }
};

// Get popular hashtags
export const getPopularHashtags = async (limit: number = 10): Promise<string[]> => {
  try {
    // If we should use mock data, return mock hashtags
    if (shouldUseMockData()) {
      console.log('Using mock popular hashtags data');
      return mockData.hashtags.slice(0, limit);
    }
    
    const { data, error } = await supabase
      .from('hashtags')
      .select('name')
      .order('count', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return mockData.hashtags.slice(0, limit);
    }
    
    return data.map(row => row.name);
  } catch (error) {
    console.error('Error fetching popular hashtags:', error);
    return mockData.hashtags.slice(0, limit);
  }
};

export default {
  getAllHashtags,
  addHashtag,
  removeHashtag,
  getPopularHashtags
};