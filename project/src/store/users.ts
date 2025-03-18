import { create } from 'zustand';
import userService from '../services/userService';
import { User } from '../types';

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  toggleUserActive: (id: string) => Promise<void>;
  getUserById: (id: string) => User | undefined;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  loading: false,
  error: null,
  
  fetchUsers: async () => {
    try {
      set({ loading: true, error: null });
      
      const users = await userService.getAllUsers();
      set({ users, loading: false });
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch users',
        loading: false
      });
    }
  },
  
  addUser: (user) => {
    set((state) => ({
      users: [...state.users, user]
    }));
  },
  
  updateUser: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      
      await userService.updateUser(id, updates);
      
      set((state) => ({
        users: state.users.map((user) => 
          user.id === id ? { ...user, ...updates } : user
        ),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update user',
        loading: false
      });
      throw error;
    }
  },
  
  toggleUserActive: async (id) => {
    try {
      const active = await userService.toggleUserActive(id);
      
      set((state) => ({
        users: state.users.map((user) => 
          user.id === id ? { ...user, active } : user
        )
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to toggle user active state'
      });
      throw error;
    }
  },
  
  getUserById: (id) => {
    return get().users.find(user => user.id === id);
  }
}));

// Initialize users data
useUsersStore.getState().fetchUsers();