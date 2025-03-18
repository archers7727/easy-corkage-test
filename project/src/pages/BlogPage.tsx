import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { BlogCard } from '../components/blog/BlogCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useBlogStore } from '../store/blog';
import { useHashtagStore } from '../store/hashtags';

export function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialHashtag = searchParams.get('hashtag') || '';
  const initialSearchQuery = searchParams.get('search') || '';

  const [selectedHashtag, setSelectedHashtag] = useState(initialHashtag);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [isSearching, setIsSearching] = useState(false);

  const { posts, loading, error, fetchPosts } = useBlogStore();
  const { hashtags } = useHashtagStore();

  // Filter blog hashtags (different from restaurant hashtags)
  const blogHashtags = hashtags.filter(tag => 
    ['와인정보', '레스토랑소식', '콜키지팁', '이벤트', '와인추천', '와인상식', '음식페어링'].includes(tag)
  );

  useEffect(() => {
    // Fetch all posts initially
    fetchPosts();
  }, [fetchPosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Update URL params
    const params: Record<string, string> = {};
    if (selectedHashtag) params.hashtag = selectedHashtag;
    if (searchQuery) params.search = searchQuery;
    setSearchParams(params);
    
    setTimeout(() => setIsSearching(false), 500);
  };

  const handleHashtagChange = (hashtag: string) => {
    setSelectedHashtag(hashtag === selectedHashtag ? '' : hashtag);
    
    // Update URL params
    const params: Record<string, string> = {};
    if (hashtag !== selectedHashtag) params.hashtag = hashtag;
    if (searchQuery) params.search = searchQuery;
    setSearchParams(params);
  };

  // Filter posts based on search query and hashtag
  const filteredPosts = posts.filter(post => {
    // Filter by hashtag
    if (selectedHashtag && !post.hashtags.includes(selectedHashtag)) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.hashtags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  // Featured post (first post or most viewed)
  const featuredPost = filteredPosts.length > 0 ? 
    filteredPosts.sort((a, b) => b.view_count - a.view_count)[0] : null;
  
  // Regular posts (excluding featured)
  const regularPosts = featuredPost ? 
    filteredPosts.filter(post => post.id !== featuredPost.id) : filteredPosts;

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">블로그</h1>
          <p className="text-gray-600">와인과 콜키지에 관한 다양한 정보를 만나보세요</p>
        </div>
        
        {/* 검색 및 해시태그 */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-8">
          <form onSubmit={handleSearch} className="relative mb-4">
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-primary-600 transition-colors"
              disabled={isSearching}
            >
              {isSearching ? (
                <LoadingSpinner className="h-5 w-5" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </button>
          </form>
          
          {/* 해시태그 필터 */}
          <div className="flex flex-wrap gap-2">
            {blogHashtags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleHashtagChange(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedHashtag === tag
                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
        
        {/* 블로그 포스트 */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner className="h-10 w-10" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            데이터를 불러오는 중 오류가 발생했습니다.
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            검색 결과가 없습니다.
          </div>
        ) : (
          <div className="space-y-12">
            {/* 피처드 포스트 */}
            {featuredPost && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">추천 포스트</h2>
                <BlogCard post={featuredPost} featured={true} />
              </div>
            )}
            
            {/* 일반 포스트 그리드 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">최신 포스트</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 card-container">
                {regularPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}