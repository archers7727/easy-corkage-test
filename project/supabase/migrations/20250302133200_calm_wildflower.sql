/*
  # Add sample data and fix RLS policies

  1. New Data
    - Add admin user if not exists
    - Add sample blog posts with unique slugs
  
  2. Security
    - Enable RLS on blog_posts table
    - Add policies for reading published posts
    - Add policies for admin management
*/

-- First, ensure we have an admin user
INSERT INTO users (id, email, nickname, role, active, created_at)
VALUES 
  ('admin1', 'admin@example.com', '와인마스터', 'admin', true, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Add a new blog post with a guaranteed unique slug
INSERT INTO blog_posts (
  title, 
  slug, 
  featured_image, 
  content, 
  excerpt, 
  category, 
  hashtags, 
  author_id, 
  published, 
  published_at, 
  view_count, 
  likes_count, 
  comments_count
)
VALUES
(
  '2024 서울 와인 페스티벌 안내',
  'seoul-wine-festival-2024-' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDD'),
  'https://images.unsplash.com/photo-1567529692333-de9fd6772897?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  '<h2>2024 서울 와인 페스티벌에 여러분을 초대합니다</h2>
  <p>와인 애호가들을 위한 최대 규모의 행사, 2024 서울 와인 페스티벌이 다음 달 코엑스에서 개최됩니다. 전 세계 다양한 와인을 한자리에서 만나볼 수 있는 이번 행사에 대한 모든 정보를 알려드립니다.</p>
  
  <h3>행사 개요</h3>
  <ul>
    <li><strong>일시</strong>: 2024년 5월 10일(금) ~ 12일(일), 10:00 ~ 18:00</li>
    <li><strong>장소</strong>: 코엑스 D홀</li>
    <li><strong>입장료</strong>: 1일권 30,000원 (시음 쿠폰 10매 포함)</li>
    <li><strong>주최</strong>: 한국와인협회, 서울시</li>
  </ul>',
  '2024 서울 와인 페스티벌이 다음 달 코엑스에서 개최됩니다. 전 세계 500종 이상의 와인 시음, 마스터 클래스, 와인 경매 등 다양한 프로그램이 준비되어 있습니다.',
  'events',
  ARRAY['이벤트', '와인정보', '와인추천'],
  'admin1',
  true,
  CURRENT_TIMESTAMP,
  750,
  28,
  6
);

-- Enable RLS on blog_posts table if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'blog_posts' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- Create policy for reading published blog posts if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'blog_posts' 
    AND policyname = 'Anyone can read published blog posts'
  ) THEN
    CREATE POLICY "Anyone can read published blog posts"
      ON blog_posts
      FOR SELECT
      USING (published = true);
  END IF;
END
$$;

-- Create policy for admins to manage all blog posts if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'blog_posts' 
    AND policyname = 'Admins can manage all blog posts'
  ) THEN
    CREATE POLICY "Admins can manage all blog posts"
      ON blog_posts
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()::text
          AND users.role = 'admin'
        )
      );
  END IF;
END
$$;