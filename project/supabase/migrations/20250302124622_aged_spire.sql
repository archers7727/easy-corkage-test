/*
  # Sample Data Migration

  1. New Data
    - Add admin user
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

-- Check if blog posts with these slugs already exist
DO $$
DECLARE
  corkage_exists BOOLEAN;
  wine_guide_exists BOOLEAN;
BEGIN
  -- Check if the first post exists
  SELECT EXISTS (
    SELECT 1 FROM blog_posts WHERE slug = 'corkage-manners-and-etiquette'
  ) INTO corkage_exists;
  
  -- Check if the second post exists
  SELECT EXISTS (
    SELECT 1 FROM blog_posts WHERE slug = 'wine-beginners-guide'
  ) INTO wine_guide_exists;
  
  -- Insert first post if it doesn't exist
  IF NOT corkage_exists THEN
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
      '콜키지 매너와 에티켓: 알아두면 좋은 팁',
      'corkage-manners-and-etiquette',
      'https://images.unsplash.com/photo-1470158499416-75be9aa0c4db?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      '<h2>콜키지 서비스를 이용할 때 알아두면 좋은 매너와 에티켓</h2>
      <p>콜키지(Corkage) 서비스는 고객이 직접 가져온 와인을 레스토랑에서 마실 수 있게 해주는 서비스입니다. 하지만 이 서비스를 이용할 때는 몇 가지 매너와 에티켓을 지키는 것이 중요합니다. 오늘은 콜키지 서비스를 이용할 때 알아두면 좋은 팁들을 소개합니다.</p>
      
      <h3>1. 사전에 콜키지 정책 확인하기</h3>
      <p>레스토랑마다 콜키지 정책이 다릅니다. 방문 전에 전화나 웹사이트를 통해 콜키지 가능 여부, 비용, 병 수 제한 등을 확인하세요.</p>
      
      <h3>2. 레스토랑에서 판매하지 않는 와인 가져가기</h3>
      <p>레스토랑의 와인 리스트에 있는 와인을 직접 가져가는 것은 예의에 어긋납니다. 해당 레스토랑에서 구하기 어려운 특별한 와인이나 개인적으로 의미 있는 와인을 가져가는 것이 좋습니다.</p>
      
      <h3>3. 적절한 와인 선택하기</h3>
      <p>레스토랑의 요리 스타일과 어울리는 와인을 선택하세요. 이탈리안 레스토랑에 프랑스 보르도 와인을, 스테이크 하우스에 가벼운 화이트 와인을 가져가는 것은 조화롭지 않을 수 있습니다.</p>',
      '콜키지 서비스를 이용할 때 알아두면 좋은 매너와 에티켓을 소개합니다. 사전 확인부터 적절한 와인 선택, 서비스에 대한 감사 표현까지 알아봅니다.',
      'corkage-tips',
      ARRAY['콜키지팁', '와인상식', '레스토랑소식'],
      'admin1',
      true,
      CURRENT_TIMESTAMP,
      1560,
      72,
      15
    );
  END IF;
  
  -- Insert second post if it doesn't exist
  IF NOT wine_guide_exists THEN
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
      '와인 초보자를 위한 기본 가이드',
      'wine-beginners-guide',
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      '<h2>와인의 세계에 오신 것을 환영합니다</h2>
      <p>와인은 수천 년의 역사를 가진 음료로, 전 세계 수많은 사람들에게 사랑받고 있습니다. 하지만 처음 와인을 접하는 분들에게는 다양한 종류와 용어들이 복잡하게 느껴질 수 있습니다.</p>
      
      <h3>와인의 기본 종류</h3>
      <p><strong>레드 와인</strong>: 포도 껍질과 함께 발효시켜 만든 와인으로, 탄닌이 풍부하고 바디감이 있습니다.</p>
      <p><strong>화이트 와인</strong>: 포도 껍질을 제거한 후 발효시켜 만든 와인으로, 상대적으로 가볍고 산미가 있습니다.</p>
      <p><strong>로제 와인</strong>: 레드 와인 제조 과정에서 포도 껍질과의 접촉 시간을 짧게 하여 만든 분홍빛 와인입니다.</p>',
      '와인을 처음 접하는 분들을 위한 기본 가이드. 와인의 종류, 테이스팅 방법, 초보자를 위한 추천 와인까지 알아봅니다.',
      'wine-info',
      ARRAY['와인정보', '와인추천', '와인상식'],
      'admin1',
      true,
      CURRENT_TIMESTAMP - INTERVAL '2 weeks',
      1250,
      48,
      12
    );
  END IF;
END
$$;

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
  '서울 강남 지역 콜키지 프리 레스토랑 TOP 5',
  'top-5-corkage-free-restaurants-gangnam-' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDD'),
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  '<h2>나만의 와인을 가지고 방문할 수 있는 강남 지역 레스토랑</h2>
  <p>콜키지 프리(Corkage Free) 서비스를 제공하는 레스토랑은 와인 애호가들에게 큰 매력으로 다가옵니다. 직접 고른 와인을 가져가 특별한 식사를 즐길 수 있기 때문이죠. 오늘은 서울 강남 지역에서 콜키지 프리 서비스를 제공하는 TOP 5 레스토랑을 소개합니다.</p>
  
  <h3>1. 비스트로 드 서울</h3>
  <p>프렌치 요리를 전문으로 하는 이 레스토랑은 평일 저녁에 콜키지 프리 서비스를 제공합니다. 소믈리에가 상주하여 와인에 어울리는 요리를 추천해 드립니다.</p>
  
  <h3>2. 트라토리아 일 소르소</h3>
  <p>정통 이탈리안 요리를 맛볼 수 있는 이 레스토랑은 매주 화요일과 수요일에 콜키지 프리 서비스를 제공합니다. 수제 파스타와 함께 즐기는 와인의 맛이 일품입니다.</p>',
  '서울 강남 지역에서 콜키지 프리 서비스를 제공하는 TOP 5 레스토랑을 소개합니다. 나만의 와인을 가지고 방문해 특별한 식사를 즐겨보세요.',
  'restaurant-news',
  ARRAY['레스토랑소식', '콜키지팁', '와인페어링'],
  'admin1',
  true,
  CURRENT_TIMESTAMP,
  980,
  35,
  8
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
-- Fix the type mismatch by casting auth.uid() to text
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