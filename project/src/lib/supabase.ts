import { createClient } from '@supabase/supabase-js';

// Supabase configuration with default fallback values that are valid URLs
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2NDExNDgyLCJleHAiOjE5MzE5ODc0ODJ9.example';

// Create Supabase client with valid URL and key
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public'
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Flag to track if we're using mock data
let useMockData = false;

// Helper function to check connection
export const checkConnection = async () => {
  try {
    console.log('Checking Supabase connection...');
    console.log('Supabase URL:', supabaseUrl);
    
    // Simple query to check if connection works
    const { data, error } = await supabase
      .from('restaurants')
      .select('id')
      .limit(1);
    
    console.log('Connection check result:', { data, error });
    
    if (error) {
      console.error('Supabase connection error:', error);
      useMockData = true;
      return false;
    }
    
    useMockData = false;
    return true;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    useMockData = true;
    return false;
  }
};

// Check if we should use mock data
export const shouldUseMockData = () => useMockData;

// Helper function to execute SQL through Supabase
export const executeSQL = async (query: string, params?: any[]) => {
  try {
    // In a real implementation, you would use a Supabase function to execute SQL
    // For now, we'll just log the query and return mock data
    console.log('SQL Query (not executed):', query, params);
    return { data: [], error: null };
  } catch (error) {
    console.error('SQL execution error:', error);
    return { data: null, error };
  }
};

// Initialize connection check
checkConnection().catch(err => {
  console.error('Initial connection check failed:', err);
  useMockData = true;
});