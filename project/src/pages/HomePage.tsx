import React, { useEffect } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { FeaturedRestaurants } from '../components/home/FeaturedRestaurants';
import { FeaturedBlogPosts } from '../components/home/FeaturedBlogPosts';
import { useRestaurants } from '../hooks/useRestaurants';
import { useBlogStore } from '../store/blog';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const { hotRestaurants, loading, error } = useRestaurants();
  const { featuredPosts, fetchFeaturedPosts } = useBlogStore();

  // Fetch featured blog posts
  useEffect(() => {
    fetchFeaturedPosts();
  }, [fetchFeaturedPosts]);

  // Reset weekly view counts every Monday
  useEffect(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday
    
    // Check if it's Monday
    if (dayOfWeek === 1) {
      // Check if we've already reset this week
      const lastReset = localStorage.getItem('lastWeeklyReset');
      const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (lastReset !== currentDate) {
        // Store the current date as the last reset date
        localStorage.setItem('lastWeeklyReset', currentDate);
        
        // We'll let the backend handle the actual reset via a scheduled function
        console.log('Weekly view counts will be reset by the backend');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner className="h-10 w-10" />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-600">
          데이터를 불러오는 중 오류가 발생했습니다.
        </div>
      ) : (
        <>
          <FeaturedRestaurants
            title="인기 레스토랑"
            restaurants={hotRestaurants}
            viewAllLink="/restaurants?sort=popular"
          />
          
          <FeaturedBlogPosts posts={featuredPosts} />
        </>
      )}
      
      <section className="py-16 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            콜키지 서비스를 제공하는 식당을 알고 계신가요?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            나만 알고 있는 특별한 식당을 공유해주세요. 여러분의 소중한 정보가 주류를 사랑하는 모든 이들에게 도움이 됩니다.
          </p>
          <Link
            to="/submit"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            식당등록신청
          </Link>
        </div>
      </section>
    </div>
  );
}