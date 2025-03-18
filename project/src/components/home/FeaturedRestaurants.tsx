import React from 'react';
import { Link } from 'react-router-dom';
import { RestaurantCard } from '../restaurant/RestaurantCard';
import { Restaurant } from '../../types';

interface FeaturedRestaurantsProps {
  title: string;
  restaurants: Restaurant[];
  viewAllLink: string;
}

export function FeaturedRestaurants({ title, restaurants, viewAllLink }: FeaturedRestaurantsProps) {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <Link
            to={viewAllLink}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            더보기
          </Link>
        </div>
        
        {/* 그리드에 auto-rows-fr 추가하여 각 행의 높이를 동일하게 설정 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="h-full">
              <RestaurantCard restaurant={restaurant} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}