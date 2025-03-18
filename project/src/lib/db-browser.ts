import { supabase } from './supabase';

// Browser-compatible database interface that uses Supabase
// instead of direct PostgreSQL connection which doesn't work in browsers

export const query = async (text: string, params?: any[]) => {
  try {
    const start = Date.now();
    
    // Convert the SQL query to use Supabase's API
    // This is a simplified approach - complex queries may need specific handling
    const { data, error } = await supabase.rpc('execute_sql', {
      query_text: text,
      query_params: params || []
    });
    
    if (error) throw error;
    
    const duration = Date.now() - start;
    console.log('Executed query:', { text, duration, rows: data?.length || 0 });
    
    return {
      rows: data || [],
      rowCount: data?.length || 0
    };
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
};

// Transaction function using Supabase
export const transaction = async (callback: (client: any) => Promise<any>) => {
  // Note: This is a simplified version - true transactions would require
  // server-side implementation with Supabase functions
  try {
    // Begin transaction (simulated)
    console.log('Beginning transaction');
    
    // Execute the callback with a mock client
    const mockClient = {
      query: async (text: string, params?: any[]) => {
        return await query(text, params);
      }
    };
    
    const result = await callback(mockClient);
    
    // Commit transaction (simulated)
    console.log('Transaction committed');
    
    return result;
  } catch (error) {
    // Rollback transaction (simulated)
    console.error('Transaction error, rolling back:', error);
    throw error;
  }
};

// Mock pool for compatibility
export const pool = {
  query,
  connect: async (callback: any) => {
    const client = {
      query: async (text: string, params?: any[]) => {
        return await query(text, params);
      },
      release: () => {}
    };
    
    try {
      await callback(null, client, client.release);
    } catch (err) {
      console.error('Pool connect error:', err);
      throw err;
    }
  },
  end: async () => {
    console.log('Pool connection ended');
  }
};

export default {
  query,
  transaction,
  pool
};