/*
  # Complete Database Schema for EasyCorkage

  1. New Tables
    - `hashtags` - Stores hashtags used across the application
    - `users` - Stores user information
    - `restaurants` - Stores restaurant information
    - `restaurant_submissions` - Stores restaurant submissions
    - `blog_posts` - Stores blog posts
    - `comments` - Stores comments on blog posts
    - `likes` - Stores likes for posts and comments
    - `restaurant_likes` - Stores user likes for restaurants

  2. Security
    - Appropriate constraints and foreign keys
    - Trigger functions for automatic timestamp updates
*/

-- 해시태그 테이블
CREATE TABLE IF NOT EXISTS hashtags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  nickname VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 레스토랑 테이블
CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  thumbnail TEXT NOT NULL,
  location1 VARCHAR(50) NOT NULL,
  location2 VARCHAR(50) NOT NULL,
  address TEXT,
  map_lat DOUBLE PRECISION NOT NULL,
  map_lng DOUBLE PRECISION NOT NULL,
  corkage_type VARCHAR(20) NOT NULL,
  corkage_fee INTEGER NOT NULL,
  corkage_info TEXT NOT NULL,
  description TEXT,
  phone VARCHAR(50),
  website TEXT,
  business_hours TEXT,
  hashtags VARCHAR(50)[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  view_count INTEGER NOT NULL DEFAULT 0,
  weekly_view_count INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 레스토랑 제출 테이블
CREATE TABLE IF NOT EXISTS restaurant_submissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location1 VARCHAR(50) NOT NULL,
  location2 VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  map_lat DOUBLE PRECISION NOT NULL,
  map_lng DOUBLE PRECISION NOT NULL,
  corkage_type VARCHAR(20) NOT NULL,
  corkage_fee INTEGER NOT NULL,
  corkage_info TEXT NOT NULL,
  description TEXT,
  phone VARCHAR(50),
  website TEXT,
  business_hours TEXT,
  hashtags VARCHAR(50)[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  thumbnail TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  submitted_by VARCHAR(50) REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by VARCHAR(50) REFERENCES users(id),
  review_notes TEXT
);

-- 블로그 게시글 테이블
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  featured_image TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  hashtags VARCHAR(50)[] DEFAULT '{}',
  author_id VARCHAR(50) REFERENCES users(id) NOT NULL,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  view_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0
);

-- 댓글 테이블
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE NOT NULL,
  user_id VARCHAR(50) REFERENCES users(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  likes_count INTEGER NOT NULL DEFAULT 0
);

-- 좋아요 테이블
CREATE TABLE IF NOT EXISTS likes (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id) NOT NULL,
  post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
  comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT likes_target_check CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  ),
  CONSTRAINT likes_unique_post UNIQUE (user_id, post_id),
  CONSTRAINT likes_unique_comment UNIQUE (user_id, comment_id)
);

-- 레스토랑 좋아요 테이블
CREATE TABLE IF NOT EXISTS restaurant_likes (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id) NOT NULL,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT restaurant_likes_unique UNIQUE (user_id, restaurant_id)
);

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 업데이트 트리거 적용 (트리거가 이미 존재하는 경우 오류 방지를 위해 DO 블록 사용)
DO $$
BEGIN
  -- users 테이블 트리거
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- restaurants 테이블 트리거
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_restaurants_updated_at') THEN
    CREATE TRIGGER update_restaurants_updated_at
      BEFORE UPDATE ON restaurants
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- blog_posts 테이블 트리거
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_blog_posts_updated_at') THEN
    CREATE TRIGGER update_blog_posts_updated_at
      BEFORE UPDATE ON blog_posts
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- comments 테이블 트리거
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_comments_updated_at') THEN
    CREATE TRIGGER update_comments_updated_at
      BEFORE UPDATE ON comments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 편의 함수: 증가 및 감소 함수
CREATE OR REPLACE FUNCTION increment(value integer)
RETURNS integer AS $$
BEGIN
  RETURN value + 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement(value integer)
RETURNS integer AS $$
BEGIN
  RETURN GREATEST(0, value - 1);
END;
$$ LANGUAGE plpgsql;

-- 해시태그 카운트 증가 함수
CREATE OR REPLACE FUNCTION increment_hashtag_count(tag_name VARCHAR)
RETURNS void AS $$
BEGIN
  UPDATE hashtags SET count = count + 1 WHERE name = tag_name;
END;
$$ LANGUAGE plpgsql;