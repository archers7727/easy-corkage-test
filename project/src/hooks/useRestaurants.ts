import { useState, useEffect, useCallback } from 'react';
import { Restaurant } from '../types';
import { useRestaurantsStore } from '../store/restaurants';

interface UseRestaurantsProps {
  initialLimit?: number;
  searchQuery?: string;
  region?: string;
  district?: string;
  priceRange?: { min: number; max: number };
  sortBy?: string;
}

export function useRestaurants(props?: UseRestaurantsProps) {
  const { restaurants: storeRestaurants } = useRestaurantsStore();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [hotRestaurants, setHotRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // 홈페이지용 데이터 fetch
  const fetchHomePageData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 인기 레스토랑 (weekly_view_count 기준)
      const sortedByPopularity = [...storeRestaurants]
        .sort((a, b) => b.weekly_view_count - a.weekly_view_count)
        .slice(0, 4);
      
      setHotRestaurants(sortedByPopularity);
    } catch (err) {
      console.error('Error fetching homepage data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch restaurants'));
    } finally {
      setLoading(false);
    }
  }, [storeRestaurants]);

  // 검색 페이지용 데이터 fetch
  const fetchSearchData = useCallback(async () => {
    if (!props) return;
    
    const {
      initialLimit = 12,
      searchQuery = '',
      region = '전체',
      district = '전체',
      priceRange = { min: 0, max: Infinity },
      sortBy = 'recommended'
    } = props;

    try {
      setLoading(true);
      setError(null);

      const filteredData = storeRestaurants.filter(restaurant => {
        // 지역 필터링
        if (region !== '전체' && restaurant.location1 !== region) return false;
        if (district !== '전체' && restaurant.location2 !== district) return false;

        // 가격 범위 필터링
        if (priceRange.max !== Infinity) {
          const fee = restaurant.corkage_type === 'free' ? 0 : restaurant.corkage_fee;
          if (fee < priceRange.min || fee > priceRange.max) return false;
        }

        // 검색어 필터링
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          const nameMatch = restaurant.name.toLowerCase().includes(searchLower);
          const hashtagMatch = restaurant.hashtags && restaurant.hashtags.some(tag => 
            tag.toLowerCase().includes(searchLower)
          );
          return nameMatch || hashtagMatch;
        }

        return true;
      });

      const sortedData = [...filteredData].sort((a, b) => {
        switch (sortBy) {
          case 'popular':
            return b.weekly_view_count - a.weekly_view_count;
          case 'newest':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          default:
            // For recommended, prioritize featured restaurants first, then by view count
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            if (a.featured && b.featured) {
              // If both are featured, sort by region match first
              if (a.location1 === region && b.location1 !== region) return -1;
              if (a.location1 !== region && b.location1 === region) return 1;
            }
            return b.view_count - a.view_count;
        }
      });

      const start = (page - 1) * initialLimit;
      const end = start + initialLimit;
      const paginatedData = sortedData.slice(start, end);

      setRestaurants(prev => page > 1 ? [...prev, ...paginatedData] : paginatedData);
      setHasMore(end < sortedData.length);

    } catch (err) {
      console.error('Error fetching search data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch restaurants'));
    } finally {
      setLoading(false);
    }
  }, [page, props, storeRestaurants]);

  useEffect(() => {
    if (props) {
      fetchSearchData();
    } else {
      fetchHomePageData();
    }
  }, [props, fetchSearchData, fetchHomePageData]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  const search = useCallback(() => {
    setPage(1);
  }, []);

  return {
    restaurants,
    hotRestaurants,
    loading,
    error,
    hasMore,
    loadMore,
    search
  };
}