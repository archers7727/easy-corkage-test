import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Search, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { RestaurantCard } from '../components/restaurant/RestaurantCard';
import { PriceRangeSlider } from '../components/ui/PriceRangeSlider';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useSearchParams } from 'react-router-dom';
import { useRestaurants } from '../hooks/useRestaurants';
import { regions } from '../data/regions';

// 여기서 명명된 내보내기(named export)로 변경합니다
export function RestaurantsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearchQuery = searchParams.get('search') || '';
  const initialRegion = searchParams.get('region') || '전체';
  const initialDistrict = searchParams.get('district') || '전체';

  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
  const [sortBy, setSortBy] = useState('recommended');
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity, label: '전체' });
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentSearchOptions, setCurrentSearchOptions] = useState({
    searchQuery: initialSearchQuery,
    region: initialRegion,
    district: initialDistrict,
    priceRange: { min: 0, max: Infinity, label: '전체' },
    sortBy: 'recommended'
  });

  const searchOptions = useMemo(() => ({
    initialLimit: 12,
    ...currentSearchOptions
  }), [currentSearchOptions]);

  const {
    restaurants,
    loading,
    error,
    hasMore,
    loadMore,
    search
  } = useRestaurants(searchOptions);

  // Apply initial search params when component mounts
  useEffect(() => {
    if (initialRegion !== '전체' || initialDistrict !== '전체' || initialSearchQuery) {
      handleSearch();
    }
  }, []);

  const observer = useRef<IntersectionObserver>();
  const lastRestaurantRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;

    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMore]);

  const districts = useMemo(() => regions[selectedRegion as keyof typeof regions], [selectedRegion]);

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedDistrict('전체');
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setIsSearching(true);
    
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedRegion !== '전체') params.set('region', selectedRegion);
    if (selectedDistrict !== '전체') params.set('district', selectedDistrict);
    
    setSearchParams(params);
    
    // 현재 검색 옵션을 업데이트하여 검색 실행
    setCurrentSearchOptions({
      searchQuery,
      region: selectedRegion,
      district: selectedDistrict,
      priceRange,
      sortBy
    });
    
    search();
    setTimeout(() => setIsSearching(false), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 검색 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            {/* 지역 선택 - 모바일에서는 숨김 */}
            <div className="hidden md:flex gap-2">
              <div className="relative">
                <select
                  value={selectedRegion}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-300 rounded-lg py-2 pl-4 pr-10 w-full md:w-32 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {Object.keys(regions).map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-300 rounded-lg py-2 pl-4 pr-10 w-full md:w-32 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {districts.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* 검색바 */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="레스토랑 이름, 해시태그로 검색"
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
            </div>
            
            {/* 모바일 필터 토글 버튼 */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
            >
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              필터
            </button>
          </form>
          
          {/* 모바일 필터 - 토글로 표시 */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 md:hidden">
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">지역</label>
                  <div className="relative">
                    <select
                      value={selectedRegion}
                      onChange={(e) => handleRegionChange(e.target.value)}
                      className="appearance-none bg-gray-50 border border-gray-300 rounded-lg py-2 pl-4 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {Object.keys(regions).map((region) => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">상세 지역</label>
                  <div className="relative">
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="appearance-none bg-gray-50 border border-gray-300 rounded-lg py-2 pl-4 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {districts.map((district) => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">정렬</label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-gray-50 border border-gray-300 rounded-lg py-2 pl-4 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="recommended">추천순</option>
                      <option value="popular">인기순</option>
                      <option value="newest">최신순</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">콜키지 비용</label>
                  <PriceRangeSlider 
                    value={priceRange} 
                    onChange={(range) => setPriceRange(range)} 
                  />
                </div>
                
                <button
                  onClick={handleSearch}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  필터 적용
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 필터 섹션 - 데스크톱에서만 표시 */}
        <div className="hidden md:block bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700 font-medium">필터</span>
            </div>

            <div className="flex items-center gap-6">
              {/* 정렬 옵션 */}
              <div className="flex items-center gap-2">
                <span className="text-gray-600">정렬:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-transparent py-1 pl-2 pr-8 border-b-2 border-gray-200 focus:border-primary-500 focus:outline-none"
                >
                  <option value="recommended">추천순</option>
                  <option value="popular">인기순</option>
                  <option value="newest">최신순</option>
                </select>
              </div>

              {/* 콜키지 비용 필터 */}
              <div className="flex items-center gap-2">
                <span className="text-gray-600">콜키지 비용:</span>
                <PriceRangeSlider 
                  value={priceRange} 
                  onChange={(range) => setPriceRange(range)} 
                />
              </div>
            </div>
          </div>
          
          {/* 필터 적용 버튼 */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              필터 적용
            </button>
          </div>
        </div>

        {/* 레스토랑 목록 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 card-container">
          {restaurants.map((restaurant, index) => {
            const isLastItem = index === restaurants.length - 1;
            return (
              <div
                key={`${restaurant.id}-${index}`}
                ref={isLastItem ? lastRestaurantRef : undefined}
              >
                <RestaurantCard restaurant={restaurant} />
              </div>
            );
          })}
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner className="h-8 w-8" />
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="text-center py-8 text-red-600">
            데이터를 불러오는 중 오류가 발생했습니다.
          </div>
        )}

        {/* 더 이상 데이터가 없음 */}
        {!loading && !hasMore && restaurants.length > 0 && (
          <div className="text-center py-8 text-gray-600">
            모든 레스토랑을 불러왔습니다.
          </div>
        )}
      </div>
    </div>
  );
}