// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Create a pool-like interface that works in both Node.js and browser environments
const createPool = () => {
  if (isBrowser) {
    // Browser environment - use mock implementation
    return {
      query: async (text: string, params?: any[]) => {
        try {
          const start = Date.now();
          console.log('Browser mock query:', { text, params });
          
          // Return mock data
          const duration = Date.now() - start;
          console.log('Executed query:', { text, duration, rows: 0 });
          
          return {
            rows: [],
            rowCount: 0
          };
        } catch (error) {
          console.error('Query execution error:', error);
          throw error;
        }
      },
      connect: async (callback: any) => {
        const client = {
          query: async (text: string, params?: any[]) => {
            console.log('Browser mock client query:', { text, params });
            return { rows: [] };
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
  } else {
    // Server environment - use actual PostgreSQL
    // This code will only run in Node.js, not in the browser
    try {
      // Dynamic import to avoid loading pg in the browser
      const { Pool } = require('pg');
      
      return new Pool({
        host: process.env.VITE_PG_HOST || 'localhost',
        port: parseInt(process.env.VITE_PG_PORT || '5432'),
        database: process.env.VITE_PG_DATABASE || 'easycorkage',
        user: process.env.VITE_PG_USER || 'postgres',
        password: process.env.VITE_PG_PASSWORD || 'postgres',
        ssl: process.env.VITE_PG_SSL === 'true' ? { rejectUnauthorized: false } : false
      });
    } catch (error) {
      console.error('Failed to create PostgreSQL pool:', error);
      // Return a mock pool as fallback
      return {
        query: async () => ({ rows: [], rowCount: 0 }),
        connect: async () => {},
        end: async () => {}
      };
    }
  }
};

// Create the pool
const pool = createPool();

// Query function
export const query = async (text: string, params?: any[]) => {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
};

// Transaction function
export const transaction = async (callback: (client: any) => Promise<any>) => {
  if (isBrowser) {
    // Browser environment - simplified transaction
    try {
      console.log('Beginning transaction (simulated)');
      
      const mockClient = {
        query: async (text: string, params?: any[]) => {
          console.log('Browser mock transaction query:', { text, params });
          return { rows: [] };
        }
      };
      
      const result = await callback(mockClient);
      console.log('Transaction committed (simulated)');
      return result;
    } catch (error) {
      console.error('Transaction error, rolling back (simulated):', error);
      throw error;
    }
  } else {
    // Server environment - real transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};

export { pool };

export default {
  query,
  transaction,
  pool
};