# 시스템 아키텍처

## 1. 프론트엔드 아키텍처

### 1.1 기술 스택
- React + TypeScript
- Vite
- TailwindCSS
- Zustand (상태관리)

### 1.2 디렉토리 구조
```
src/
├── components/     # 재사용 가능한 컴포넌트
│   ├── admin/     # 관리자 전용 컴포넌트
│   ├── blog/      # 블로그 관련 컴포넌트
│   ├── home/      # 홈페이지 컴포넌트
│   ├── layout/    # 레이아웃 컴포넌트
│   ├── map/       # 지도 관련 컴포넌트
│   ├── restaurant/# 레스토랑 관련 컴포넌트
│   └── ui/        # 공통 UI 컴포넌트
├── pages/         # 페이지 컴포넌트
│   └── admin/     # 관리자 페이지
├── services/      # API 서비스
├── store/         # Zustand 스토어
├── types/         # TypeScript 타입 정의
└── lib/           # 유틸리티 함수
```

### 1.3 상태관리
- Zustand 스토어 구조
  - auth: 사용자 인증 상태
  - blog: 블로그 관련 상태
  - restaurants: 레스토랑 관련 상태
  - hashtags: 해시태그 관련 상태
  - users: 사용자 관리 상태

## 2. 백엔드 통합

### 2.1 Supabase 통합
- 데이터베이스 접근
- Row Level Security (RLS)
- 실시간 구독 기능

### 2.2 Firebase 통합
- 사용자 인증
- 이미지 스토리지
- 분석 기능

## 3. 주요 기능별 구현 가이드

### 3.1 레스토랑 검색 시스템
```typescript
// src/hooks/useRestaurants.ts
interface SearchOptions {
  region?: string;
  district?: string;
  priceRange?: PriceRange;
  hashtags?: string[];
}

// 검색 로직 구현
const searchRestaurants = async (options: SearchOptions) => {
  const query = supabase
    .from('restaurants')
    .select('*');
    
  if (options.region) {
    query.eq('location1', options.region);
  }
  // ... 추가 필터링 로직
};
```

### 3.2 블로그 시스템
```typescript
// src/services/blogService.ts
interface BlogOptions {
  category?: string;
  hashtags?: string[];
  page?: number;
  limit?: number;
}

// 블로그 포스트 조회 로직
const getBlogPosts = async (options: BlogOptions) => {
  const query = supabase
    .from('blog_posts')
    .select('*, author:profiles(*)');
    
  if (options.category) {
    query.eq('category', options.category);
  }
  // ... 추가 필터링 로직
};
```

### 3.3 관리자 시스템
```typescript
// src/components/admin/AdminLayout.tsx
const AdminLayout = () => {
  const { user } = useAuthStore();
  
  // 관리자 권한 확인
  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return (
    // 관리자 레이아웃 구현
  );
};
```

## 4. 성능 최적화 가이드

### 4.1 이미지 최적화
- Unsplash URL 파라미터 활용
- 레이지 로딩 구현
- 이미지 크기 최적화

### 4.2 데이터 로딩 최적화
- 무한 스크롤 구현
- 데이터 프리페칭
- 캐싱 전략

### 4.3 코드 분할
- 라우트 기반 코드 분할
- 컴포넌트 레이지 로딩
- 번들 크기 최적화

## 5. 배포 프로세스

### 5.1 개발 환경
- `.env.example` 파일 참고
- 필요한 환경변수 설정
- 개발 서버 실행

### 5.2 프로덕션 배포
- Netlify 자동 배포
- 환경변수 설정
- SSL 인증서 설정

### 5.3 모니터링
- Firebase Analytics
- 에러 추적
- 성능 모니터링