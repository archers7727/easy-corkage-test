import React from 'react';
import { Link } from 'react-router-dom';
import { Restaurant } from '../../types';
import { cn } from '../../lib/utils';

// Default restaurant image
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link to={`/restaurants/${restaurant.id}`} className="block group">
      <div className="flex flex-col h-full overflow-hidden rounded-lg shadow-md transition-all duration-200 hover:shadow-lg bg-white">
        {/* 이미지 컨테이너: 고정 높이 설정 */}
        <div className="relative w-full h-48 overflow-hidden">
          <img
            src={restaurant.thumbnail || DEFAULT_IMAGE}
            alt={restaurant.name}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
          {/* 코키지 타입 배지 */}
          <div className={cn(
            "absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full shadow-sm",
            restaurant.corkage_type === 'free' 
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-white text-gray-900'
          )}>
            {restaurant.corkage_type === 'free' 
              ? '무료 콜키지' 
              : `${restaurant.corkage_fee.toLocaleString()}원`}
          </div>
        </div>
        
        {/* 카드 내용: 고정 높이 설정 */}
        <div className="flex flex-col p-4 h-[120px]">
          <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">{restaurant.name}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-1">{restaurant.location1} {restaurant.location2}</p>
          
          {/* 해시태그 - 해시태그가 없으면 아예 표시하지 않음 */}
          {restaurant.hashtags && restaurant.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-auto overflow-hidden">
              {restaurant.hashtags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full truncate">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

interface RestaurantCardProps {
  restaurant: Restaurant;
}