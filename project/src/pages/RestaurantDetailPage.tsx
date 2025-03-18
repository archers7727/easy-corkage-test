import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Wine, Phone, Globe, Share2, Clock, X } from 'lucide-react';
import { ImageGallery } from '../components/restaurant/ImageGallery';
import { NaverMap } from '../components/map/NaverMap';
import { useRestaurantsStore } from '../store/restaurants';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { extractNaverMapCoordinates } from '../lib/utils';

// Default restaurant image
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";

export function RestaurantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);
  const { restaurants, updateRestaurant, loading } = useRestaurantsStore();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [viewCountUpdated, setViewCountUpdated] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Find restaurant and set it to state
  useEffect(() => {
    if (id) {
      const found = restaurants.find(r => r.id === id);
      if (found) {
        setRestaurant(found);
        
        // 지도 좌표 로드 및 확인
        loadMapCoordinates(found);
      }
    }
  }, [id, restaurants]);

  // 1. loadMapCoordinates 함수 수정
  const loadMapCoordinates = async (restaurantData: any) => {
    try {
      setMapLoading(true);
      setMapError(null);
      
      console.log('레스토랑 데이터:', restaurantData);
      
      // 실제 구조 출력
      if (restaurantData.map_info) {
        console.log('map_info:', restaurantData.map_info);
        console.log('map_info.lat:', restaurantData.map_info.lat, 'map_info.lng:', restaurantData.map_info.lng);
      } else {
        console.log('map_info가 없음');
      }
      
      console.log('website URL:', restaurantData.website);
      
      // 1. map_info 객체에서 좌표 확인
      if (restaurantData.map_info && restaurantData.map_info.lat && restaurantData.map_info.lng) {
        const isValidCoords = 
          restaurantData.map_info.lat >= 33 && restaurantData.map_info.lat <= 39 &&
          restaurantData.map_info.lng >= 124 && restaurantData.map_info.lng <= 132;
        
        if (isValidCoords) {
          console.log('map_info에서 좌표 사용:', restaurantData.map_info.lat, restaurantData.map_info.lng);
          setMapCoordinates({
            lat: restaurantData.map_info.lat,
            lng: restaurantData.map_info.lng
          });
          setMapLoading(false);
          return; // 유효한 좌표가 있으면 여기서 종료
        } else {
          console.warn('map_info 좌표가 유효하지 않음:', restaurantData.map_info);
        }
      }
      
      // 2. 네이버 지도 URL 확인 (naver.me 포함)
      if (restaurantData.website && 
          (restaurantData.website.includes('map.naver.com') || 
           restaurantData.website.includes('naver.me') || 
           restaurantData.website.includes('place.naver.com'))) {
        
        console.log('네이버 지도 URL 발견:', restaurantData.website);
        
        try {
          // URL에서 좌표 추출 시도
          const coords = await extractNaverMapCoordinates(restaurantData.website);
          if (coords && coords.lat !== 37.5665 && coords.lng !== 126.9780) {
            // 추출 성공하면 사용
            console.log('URL에서 추출한 좌표:', coords);
            setMapCoordinates(coords);
            
            // 좌표 정보 업데이트 (필요시)
            if (!restaurantData.map_info || 
                Math.abs(coords.lat - restaurantData.map_info.lat) > 0.001 || 
                Math.abs(coords.lng - restaurantData.map_info.lng) > 0.001) {
              
              console.log('좌표 정보 업데이트 필요');
              
              // map_info 구조에 맞게 업데이트
              const updatedRestaurant = {
                ...restaurantData,
                map_info: {
                  ...(restaurantData.map_info || {}),
                  lat: coords.lat,
                  lng: coords.lng
                }
              };
              
              updateRestaurant(updatedRestaurant);
            }
            
            setMapLoading(false);
            return;
          } else {
            console.warn('URL에서 좌표 추출 실패');
          }
        } catch (err) {
          console.error('URL 좌표 추출 오류:', err);
        }
      }
      
      // 3. 좌표 정보가 전혀 없는 경우
      console.warn('유효한 좌표 정보 없음');
      setMapError('이 레스토랑의 지도 위치 정보가 없습니다.');
      setMapCoordinates({ lat: 37.5665, lng: 126.9780 }); // 기본 서울 좌표
    } catch (error) {
      console.error('지도 좌표 로드 오류:', error);
      setMapError('지도 좌표를 불러오는 중 오류가 발생했습니다.');
      setMapCoordinates({ lat: 37.5665, lng: 126.9780 });
    } finally {
      setMapLoading(false);
    }
  };

  // Update view count only once when component mounts
  useEffect(() => {
    if (restaurant && !viewCountUpdated && id) {
      const updatedRestaurant = {
        ...restaurant,
        view_count: restaurant.view_count + 1,
        weekly_view_count: restaurant.weekly_view_count + 1
      };
      
      updateRestaurant(updatedRestaurant);
      setViewCountUpdated(true);
    }
  }, [restaurant, viewCountUpdated, updateRestaurant, id]);

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('링크가 클립보드에 복사되었습니다.');
    setShowShareModal(false);
  };

  if (loading || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  // Prepare images array, using default if none available
  const displayImages = restaurant.images && restaurant.images.length > 0 
    ? restaurant.images 
    : [restaurant.thumbnail || DEFAULT_IMAGE];

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ImageGallery images={displayImages} name={restaurant.name} />

        {/* 레스토랑 정보 */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{restaurant.location1} {restaurant.location2}</span>
              </div>
              {restaurant.hashtags && restaurant.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {restaurant.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Share2 className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">상세 정보</h2>
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-3" />
                  <span>{restaurant.business_hours || '영업시간 정보 없음'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-5 w-5 mr-3" />
                  <span>{restaurant.phone || '전화번호 정보 없음'}</span>
                </div>
                {restaurant.website && (
                  <div className="flex items-center text-gray-600">
                    <Globe className="h-5 w-5 mr-3" />
                    <a href={restaurant.website} className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      웹사이트 방문
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-primary-50 rounded-lg p-6">
              <div className="flex items-start">
                <Wine className="h-6 w-6 text-primary-600 mr-3 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">콜키지 정보</h2>
                  <div className="text-2xl font-bold text-primary-600 mb-2">
                    {restaurant.corkage_type === 'free' ? '무료' : `${restaurant.corkage_fee.toLocaleString()}원`}
                  </div>
                  <p className="text-gray-600">{restaurant.corkage_info}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">레스토랑 소개</h2>
            <p className="text-gray-600 whitespace-pre-line">{restaurant.description || '레스토랑 소개 정보가 없습니다.'}</p>
          </div>
        </div>

        {/* 지도 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">위치</h2>
            
            {/* 개발 환경에서만 표시되는 디버깅 버튼 */}
            {import.meta.env.DEV && (
              <button 
                onClick={() => {
                  console.log('레스토랑 데이터:', restaurant);
                  console.log('지도 좌표:', mapCoordinates);
                  alert(`디버깅 정보:
                    map_info: ${JSON.stringify(restaurant.map_info || {})}\n
                    현재 좌표: ${mapCoordinates?.lat}, ${mapCoordinates?.lng}\n
                    website: ${restaurant.website}`);
                }}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
              >
                디버그
              </button>
            )}
          </div>
          
          {mapLoading ? (
            <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
              <LoadingSpinner className="h-10 w-10" />
            </div>
          ) : (
            <>
              <div className="h-96 bg-gray-100 rounded-lg overflow-hidden relative">
                {mapCoordinates && (
                  <NaverMap
                    lat={mapCoordinates.lat}
                    lng={mapCoordinates.lng}
                    name={restaurant.name}
                  />
                )}
                
                {mapError && (
                  <div className="absolute top-2 left-0 right-0 mx-auto w-max bg-amber-50 text-amber-600 px-3 py-2 rounded-md text-sm shadow-md flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    {mapError}
                  </div>
                )}
                
                {/* 개발 환경에서만 표시되는 좌표 정보 */}
                {import.meta.env.DEV && mapCoordinates && (
                  <div className="absolute bottom-2 left-2 bg-white bg-opacity-80 text-xs p-2 rounded shadow">
                    <div>현재 좌표: {mapCoordinates.lat.toFixed(6)}, {mapCoordinates.lng.toFixed(6)}</div>
                    <div>DB 좌표: {restaurant.map_info?.lat?.toFixed(6) || 'N/A'}, {restaurant.map_info?.lng?.toFixed(6) || 'N/A'}</div>
                  </div>
                )}
              </div>
              
              {restaurant.address && (
                <p className="mt-4 text-gray-600">
                  <MapPin className="h-4 w-4 inline-block mr-1" />
                  {restaurant.address}
                </p>
              )}
              
              {/* 네이버 지도 링크 - 우선순위: website 필드 > 자동 생성 링크 */}
              {(restaurant.website || 
                (mapCoordinates && !(mapCoordinates.lat === 37.5665 && mapCoordinates.lng === 126.9780))) && (
                <a 
                  href={
                    restaurant.website ? 
                      restaurant.website : 
                      `https://map.naver.com/v5/search/${encodeURIComponent(restaurant.name)}/place`
                  }
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="mt-2 inline-flex items-center text-primary-600 hover:underline"
                >
                  <Globe className="h-4 w-4 mr-1" />
                  네이버 지도에서 보기
                </a>
              )}
            </>
          )}
        </div>

        {/* 공유하기 모달 */}
        {showShareModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <div
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">공유하기</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={handleCopyLink}
                  className="w-full py-2 px-4 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Globe className="h-5 w-5" />
                  링크 복사하기
                </button>
                
                {/* 소셜 미디어 공유 버튼들 */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="py-2 px-4 bg-[#3b5998] text-white rounded-lg hover:bg-[#2d4373] transition-colors">
                    Facebook
                  </button>
                  <button className="py-2 px-4 bg-[#1da1f2] text-white rounded-lg hover:bg-[#0c85d0] transition-colors">
                    Twitter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}