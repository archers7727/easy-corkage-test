import { User } from '../types';
import { useUsersStore } from '../store/users';

// 테스트용 사용자 데이터
const mockUser: User = {
  id: 'mock-user-id',
  email: 'test@example.com',
  nickname: 'TestUser',
  role: 'user',
  created_at: new Date().toISOString(),
  active: true
};

const mockAdmin: User = {
  id: 'mock-admin-id',
  email: 'admin@example.com',
  nickname: 'AdminUser',
  role: 'admin',
  created_at: new Date().toISOString(),
  active: true
};

export const mockAuth = {
  signIn: async (email: string, password: string): Promise<User> => {
    // 간단한 검증
    if (email === 'admin@example.com' && password === 'admin') {
      return mockAdmin;
    }
    if (email === 'test@example.com' && password === 'test') {
      return mockUser;
    }
    
    // 스토어에서 사용자 찾기
    const store = useUsersStore.getState();
    const user = store.users.find(u => u.email === email);
    
    if (user && user.active) {
      return user;
    }
    
    throw new Error('Invalid credentials');
  },

  signUp: async (email: string, password: string): Promise<User> => {
    // 이메일 중복 확인
    const store = useUsersStore.getState();
    const existingUser = store.users.find(u => u.email === email);
    
    if (existingUser) {
      throw new Error('Email already exists');
    }
    
    // 새 사용자 생성
    return {
      ...mockUser,
      id: `user-${Date.now()}`,
      email,
      nickname: `User${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString()
    };
  }
};