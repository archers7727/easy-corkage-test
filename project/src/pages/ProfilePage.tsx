import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Edit2, Save, Heart, X, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useRestaurantsStore } from '../store/restaurants';
import { Restaurant } from '../types';
import { RestaurantCard } from '../components/restaurant/RestaurantCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUserProfile, loading: authLoading } = useAuthStore();
  const { restaurants, loading: restaurantsLoading } = useRestaurantsStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<Restaurant[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setNickname(user.nickname);
    }
  }, [user]);

  // Load favorite restaurants
  useEffect(() => {
    if (user && restaurants.length > 0) {
      setLoadingFavorites(true);
      
      try {
        // Get favorites from localStorage
        const favorites = JSON.parse(localStorage.getItem(`favorites_${user.id}`) || '[]');
        
        // Find matching restaurants
        const favoriteRestaurantsList = restaurants.filter(restaurant => 
          favorites.includes(restaurant.id)
        );
        
        setFavoriteRestaurants(favoriteRestaurantsList);
      } catch (err) {
        console.error('Error loading favorites:', err);
      } finally {
        setLoadingFavorites(false);
      }
    } else {
      setLoadingFavorites(false);
    }
  }, [user, restaurants]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      setError(null);
      
      // Validate inputs
      if (!nickname.trim()) {
        setError('닉네임을 입력해주세요.');
        setSaving(false);
        return;
      }
      
      // Update profile with only nickname
      await updateUserProfile({
        nickname
      });
      
      setIsEditing(false);
    } catch (err) {
      setError('프로필 업데이트 중 오류가 발생했습니다.');
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFavorite = (restaurantId: string) => {
    if (!user) return;
    
    try {
      // Get current favorites
      const favorites = JSON.parse(localStorage.getItem(`favorites_${user.id}`) || '[]');
      
      // Remove the restaurant
      const updatedFavorites = favorites.filter((id: string) => id !== restaurantId);
      
      // Save back to localStorage
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(updatedFavorites));
      
      // Update state
      setFavoriteRestaurants(prev => prev.filter(r => r.id !== restaurantId));
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">마이페이지</h1>
        
        {/* 프로필 정보 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">프로필 정보</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center text-primary-600 hover:text-primary-700"
              >
                <Edit2 className="h-4 w-4 mr-1" />
                수정
              </button>
            )}
          </div>
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex items-center">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.nickname}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
              ) : (
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                  <User className="h-8 w-8 text-primary-600" />
                </div>
              )}
              
              <div>
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                        닉네임
                      </label>
                      <input
                        type="text"
                        id="nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        이메일
                      </label>
                      <div className="mt-1 block w-full py-2 px-3 bg-gray-100 rounded-md text-gray-700">
                        {user.email}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">이메일은 변경할 수 없습니다.</p>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setNickname(user.nickname);
                          setError(null);
                        }}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900"
                        disabled={saving}
                      >
                        취소
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
                        disabled={saving}
                      >
                        {saving ? (
                          <LoadingSpinner className="h-4 w-4 mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        저장
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-gray-900">{user.nickname}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    {user.role === 'admin' && (
                      <span className="mt-1 inline-block px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-sm">
                        관리자
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* 좋아요한 레스토랑 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-6">
            <Heart className="h-5 w-5 text-red-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">좋아요한 레스토랑</h2>
          </div>
          
          {loadingFavorites || restaurantsLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner className="h-8 w-8" />
            </div>
          ) : favoriteRestaurants.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Heart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>아직 좋아요한 레스토랑이 없습니다.</p>
              <p className="mt-2">
                <a href="/restaurants" className="text-primary-600 hover:text-primary-700">
                  레스토랑 둘러보기
                </a>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="relative">
                  <button
                    onClick={() => handleRemoveFavorite(restaurant.id)}
                    className="absolute top-2 right-2 z-10 p-1 bg-white rounded-full shadow-md text-red-500 hover:text-red-600"
                    title="좋아요 취소"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <RestaurantCard restaurant={restaurant} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}