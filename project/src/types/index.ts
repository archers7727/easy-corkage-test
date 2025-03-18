export interface Restaurant {
  id: string;
  name: string;
  thumbnail: string;
  location1: string; // e.g., Seoul
  location2: string; // e.g., Gangnam-gu
  address?: string;
  map_info: {
    lat: number;
    lng: number;
  };
  corkage_type: 'free' | 'paid';
  corkage_fee: number;
  corkage_info: string;
  description?: string;
  phone?: string;
  website?: string;
  business_hours?: string;
  hashtags: string[];
  images: string[];
  view_count: number;
  weekly_view_count: number;
  featured?: boolean;
  created_at: string;
  updated_at: string;
}

export interface RestaurantSubmission {
  id: string;
  name: string;
  location1: string;
  location2: string;
  address: string;
  lat: number;
  lng: number;
  corkage_type: 'free' | 'paid';
  corkage_fee: number;
  corkage_info: string;
  description?: string;
  phone?: string;
  website?: string;
  business_hours?: string;
  hashtags: string[];
  images: string[];
  thumbnail: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_by: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  review_notes?: string;
}

export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  active?: boolean;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  featured_image: string;
  content: string;
  excerpt: string;
  category: 'wine-info' | 'restaurant-news' | 'corkage-tips' | 'events';
  hashtags: string[];
  author_id: string;
  author?: User;
  published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  likes_count: number;
  comments_count: number;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  user?: User;
  content: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
}

export interface Like {
  id: string;
  user_id: string;
  post_id?: string;
  comment_id?: string;
  created_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  count: number;
}

// AdSense 관련 타입 정의
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}