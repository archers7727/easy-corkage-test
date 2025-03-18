// This file contains mock data for development and fallback purposes
import { restaurants } from './restaurants';
import { blogPosts } from './blogPosts';

// Mock hashtags
export const mockHashtags = [
  '이벤트', '와인추천', '와인상식', '음식페어링'
];

// Mock users
export const mockUsers = [
  {
    id: 'admin1',
    email: 'admin@example.com',
    nickname: '와인마스터',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    role: 'admin',
    active: true,
    created_at: '2023-01-01T00:00:00Z'
  },
];

// Mock comments
export const mockComments = [
  {
    id: 'comment1',
    post_id: '1',
    user_id: 'user1',
    user: mockUsers[1],
    content: '정말 유익한 정보 감사합니다! 와인 초보자로서 많은 도움이 되었어요.',
    created_at: '2024-02-16T10:30:00Z',
    updated_at: '2024-02-16T10:30:00Z',
    likes_count: 3
  },
  {
    id: 'comment2',
    post_id: '1',
    user_id: 'user2',
    user: mockUsers[2],
    content: '피노 누아 추천 감사합니다. 다음에 꼭 시도해볼게요!',
    created_at: '2024-02-17T14:20:00Z',
    updated_at: '2024-02-17T14:20:00Z',
    likes_count: 1
  },
  {
    id: 'comment3',
    post_id: '2',
    user_id: 'user1',
    user: mockUsers[1],
    content: '라 테라스 가봤는데 정말 좋았어요. 야경도 멋지고 와인도 맛있었습니다.',
    created_at: '2024-03-02T18:45:00Z',
    updated_at: '2024-03-02T18:45:00Z',
    likes_count: 2
  }
];

// Mock likes
export const mockLikes = [
  {
    id: 'like1',
    user_id: 'user1',
    post_id: '1',
    created_at: '2024-02-16T11:00:00Z'
  },
  {
    id: 'like2',
    user_id: 'user2',
    post_id: '1',
    created_at: '2024-02-17T15:30:00Z'
  },
  {
    id: 'like3',
    user_id: 'user1',
    post_id: '3',
    created_at: '2024-02-21T09:15:00Z'
  },
  {
    id: 'like4',
    user_id: 'user2',
    comment_id: 'comment1',
    created_at: '2024-02-18T12:40:00Z'
  }
];

// Export all mock data
export const mockData = {
  restaurants,
  blogPosts,
  hashtags: mockHashtags,
  users: mockUsers,
  comments: mockComments,
  likes: mockLikes
};

export default mockData;