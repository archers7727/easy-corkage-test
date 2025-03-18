import React, { useState, useMemo } from 'react';
import { Search, Edit, Trash2, Star, Filter, ChevronDown, X } from 'lucide-react';
import { Restaurant } from '../../types';
import { useRestaurantsStore } from '../../store/restaurants';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { regions } from '../../data/regions';
import { EditRestaurantModal } from '../../components/admin/EditRestaurantModal';
import { supabase } from '../../lib/supabase';
import debounce from 'lodash/debounce';

export function ManageRestaurantsPage() {
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [selectedRestaurantForFeatured, setSelectedRestaurantForFeatured] = useState<Restaurant | null>(null);

  // Filter restaurants based on search query and region
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(restaurant => {
      const matchesSearch = searchQuery 
        ? restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
      
      const matchesRegion = selectedRegion === '전체' || restaurant.location1 === selectedRegion;
      
      return matchesSearch && matchesRegion;
    });
  }, [restaurants, searchQuery, selectedRegion]);

  // Get featured restaurants by region
  const featuredRestaurants = useMemo(() => {
    const featured: Record<string, Restaurant[]> = {};
    
    // Initialize with all regions
    Object.keys(regions).forEach(region => {
      featured[region] = [];
    });
    
    // Populate with featured restaurants
    restaurants.forEach(restaurant => {
      if (restaurant.featured) {
        const region = restaurant.location1;
        if (featured[region]) {
          featured[region].push(restaurant);
        }
      }
    });
    
    return featured;
  }, [restaurants]);

  // Fetch restaurants from Supabase
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('restaurants')
        .select('*');

      if (selectedRegion !== '전체') {
        query = query.eq('location1', selectedRegion);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,hashtags.cs.{${searchQuery}}`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const mappedRestaurants = data?.map(row => ({
        id: row.id.toString(),
        name: row.name,
        thumbnail: row.thumbnail,
        location1: row.location1,
        location2: row.location2,
        address: row.address || '',
        map_info: {
          lat: row.map_lat,
          lng: row.map_lng
        },
        corkage_type: row.corkage_type,
        corkage_fee: row.corkage_fee,
        corkage_info: row.corkage_info,
        description: row.description || '',
        phone: row.phone || '',
        website: row.website || '',
        business_hours: row.business_hours || '',
        hashtags: row.hashtags || [],
        images: row.images || [],
        view_count: row.view_count || 0,
        weekly_view_count: row.weekly_view_count || 0,
        featured: row.featured || false,
        created_at: row.created_at,
        updated_at: row.updated_at
      })) || [];

      setRestaurants(mappedRestaurants);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError('레스토랑 데이터를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  // Initial fetch
  React.useEffect(() => {
    fetchRestaurants();
  }, [selectedRegion, searchQuery]);

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
  };

  const handleSaveEdit = async (updatedRestaurant: Restaurant) => {
    try {
      setLoading(true);
      
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({
          name: updatedRestaurant.name,
          location1: updatedRestaurant.location1,
          location2: updatedRestaurant.location2,
          address: updatedRestaurant.address,
          map_lat: updatedRestaurant.map_info.lat,
          map_lng: updatedRestaurant.map_info.lng,
          corkage_type: updatedRestaurant.corkage_type,
          corkage_fee: updatedRestaurant.corkage_fee,
          corkage_info: updatedRestaurant.corkage_info,
          description: updatedRestaurant.description,
          phone: updatedRestaurant.phone,
          website: updatedRestaurant.website,
          business_hours: updatedRestaurant.business_hours,
          hashtags: updatedRestaurant.hashtags,
          images: updatedRestaurant.images,
          thumbnail: updatedRestaurant.thumbnail,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedRestaurant.id);

      if (updateError) throw updateError;

      setEditingRestaurant(null);
      fetchRestaurants(); // Refresh the list
    } catch (err) {
      console.error('Error updating restaurant:', err);
      setError('레스토랑 정보 업데이트 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      try {
        setLoading(true);
        
        const { error: deleteError } = await supabase
          .from('restaurants')
          .delete()
          .eq('id', showDeleteConfirm);

        if (deleteError) throw deleteError;

        fetchRestaurants(); // Refresh the list
        setShowDeleteConfirm(null);
      } catch (err) {
        console.error('Error deleting restaurant:', err);
        setError('레스토랑 삭제 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSetFeatured = (restaurant: Restaurant) => {
    setSelectedRestaurantForFeatured(restaurant);
    setShowFeaturedModal(true);
  };

  const confirmSetFeatured = async (featured: boolean) => {
    if (selectedRestaurantForFeatured) {
      try {
        setLoading(true);
        
        const { error: updateError } = await supabase
          .from('restaurants')
          .update({ featured })
          .eq('id', selectedRestaurantForFeatured.id);

        if (updateError) throw updateError;

        fetchRestaurants(); // Refresh the list
        setSelectedRestaurantForFeatured(null);
        setShowFeaturedModal(false);
      } catch (err) {
        console.error('Error updating featured status:', err);
        setError('추천 상태 변경 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemoveFeatured = async (restaurantId: string) => {
    try {
      setLoading(true);
      
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ featured: false })
        .eq('id', restaurantId);

      if (updateError) throw updateError;

      fetchRestaurants(); // Refresh the list
    } catch (err) {
      console.error('Error removing featured status:', err);
      setError('추천 해제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useMemo(
    () => debounce((value: string) => setSearchQuery(value), 300),
    []
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">레스토랑 관리</h1>
      
      {/* 추천 레스토랑 섹션 */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">지역별 추천 레스토랑</h2>
        
        <div className="space-y-6">
          {Object.entries(featuredRestaurants).map(([region, restaurants]) => (
            region !== '전체' && (
              <div key={region} className="border-b pb-4 last:border-b-0 last:pb-0">
                <h3 className="font-medium text-gray-800 mb-2">{region} ({restaurants.length})</h3>
                {restaurants.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {restaurants.map(restaurant => (
                      <div key={restaurant.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center">
                          <img 
                            src={restaurant.thumbnail} 
                            alt={restaurant.name}
                            className="w-12 h-12 object-cover rounded-md mr-3"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{restaurant.name}</p>
                            <p className="text-sm text-gray-500">{restaurant.location2}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFeatured(restaurant.id)}
                          className="p-1 text-yellow-500 hover:text-yellow-600"
                          title="추천 해제"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">추천 레스토랑이 없습니다</p>
                )}
              </div>
            )
          ))}
        </div>
      </div>
      
      {/* 레스토랑 목록 섹션 */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">전체 레스토랑 목록</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="레스토랑 이름, 해시태그로 검색"
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            
            <div className="relative sm:w-40">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="appearance-none w-full bg-white border border-gray-300 rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {Object.keys(regions).map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner className="h-8 w-8" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    레스토랑
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    위치
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    콜키지
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    조회수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    추천
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRestaurants.map((restaurant) => (
                  <tr key={restaurant.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={restaurant.thumbnail}
                            alt={restaurant.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                          <div className="text-sm text-gray-500">
                            {restaurant.hashtags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="mr-1">#{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{restaurant.location1}</div>
                      <div className="text-sm text-gray-500">{restaurant.location2}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        restaurant.corkage_type === 'free' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {restaurant.corkage_type === 'free' 
                          ? '무료' 
                          : `${restaurant.corkage_fee.toLocaleString()}원`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>전체: {restaurant.view_count.toLocaleString()}</div>
                      <div>주간: {restaurant.weekly_view_count.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {restaurant.featured ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          추천
                        </span>
                      ) : (
                        <span className="text-gray-400">일반</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSetFeatured(restaurant)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title={restaurant.featured ? "추천 해제" : "추천 설정"}
                        >
                          <Star className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(restaurant)}
                          className="text-blue-600 hover:text-blue-900"
                          title="수정"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(restaurant.id)}
                          className="text-red-600 hover:text-red-900"
                          title="삭제"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredRestaurants.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                검색 결과가 없습니다
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 수정 모달 */}
      {editingRestaurant && (
        <EditRestaurantModal
          submission={{
            id: editingRestaurant.id,
            name: editingRestaurant.name,
            location1: editingRestaurant.location1,
            location2: editingRestaurant.location2,
            address: editingRestaurant.address || '',
            lat: editingRestaurant.map_info.lat,
            lng: editingRestaurant.map_info.lng,
            corkage_type: editingRestaurant.corkage_type,
            corkage_fee: editingRestaurant.corkage_fee,
            corkage_info: editingRestaurant.corkage_info,
            description: editingRestaurant.description || '',
            phone: editingRestaurant.phone || '',
            website: editingRestaurant.website || '',
            business_hours: editingRestaurant.business_hours || '',
            hashtags: editingRestaurant.hashtags,
            images: editingRestaurant.images,
            thumbnail: editingRestaurant.thumbnail,
            status: 'approved',
            submitted_by: '',
            created_at: editingRestaurant.created_at,
            updated_at: editingRestaurant.updated_at
          }}
          onSave={handleSaveEdit}
          onClose={() => setEditingRestaurant(null)}
        />
      )}
      
      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">레스토랑 삭제</h3>
            <p className="text-gray-600 mb-6">
              이 레스토랑을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 추천 설정 모달 */}
      {showFeaturedModal && selectedRestaurantForFeatured && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedRestaurantForFeatured.featured ? '추천 해제' : '추천 설정'}
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedRestaurantForFeatured.featured
                ? `"${selectedRestaurantForFeatured.name}" 레스토랑을 추천에서 해제하시겠습니까?`
                : `"${selectedRestaurantForFeatured.name}" 레스토랑을 ${selectedRestaurantForFeatured.location1} 지역의 추천 레스토랑으로 설정하시겠습니까?`
              }
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedRestaurantForFeatured(null);
                  setShowFeaturedModal(false);
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                취소
              </button>
              <button
                onClick={() => confirmSetFeatured(!selectedRestaurantForFeatured.featured)}
                className={`px-4 py-2 text-white rounded-md ${
                  selectedRestaurantForFeatured.featured
                    ? 'bg-gray-600 hover:bg-gray-700'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {selectedRestaurantForFeatured.featured ? '추천 해제' : '추천 설정'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}