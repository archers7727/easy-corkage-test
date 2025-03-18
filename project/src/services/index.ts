// Export all services
export { default as hashtagService } from './hashtagService';
export { default as restaurantService } from './restaurantService';
export { default as blogService } from './blogService';
export { default as userService } from './userService';

// Initialize Supabase connection
import { checkConnection } from '../lib/supabase';

// Check connection on app start
checkConnection().then(connected => {
  if (connected) {
    console.log('Successfully connected to database');
  } else {
    console.warn('Failed to connect to database, using mock data');
  }
});