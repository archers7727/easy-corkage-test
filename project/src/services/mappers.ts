import { Restaurant } from '../types';

/**
 * DB에서 가져온 레스토랑 데이터를 프론트엔드 모델로 변환합니다.
 * @param row DB에서 가져온 레스토랑 데이터
 * @returns 변환된 레스토랑 객체
 */
export const mapRestaurantFromDB = (row: any): Restaurant => {
  return {
    id: row.id.toString(),
    name: row.name,
    thumbnail: row.thumbnail,
    location1: row.location1,
    location2: row.location2,
    address: row.address,
    map_info: {
      lat: row.map_lat,
      lng: row.map_lng
    },
    corkage_type: row.corkage_type,
    corkage_fee: row.corkage_fee,
    corkage_info: row.corkage_info,
    description: row.description,
    phone: row.phone,
    website: row.website,
    business_hours: row.business_hours,
    hashtags: row.hashtags || [],
    images: row.images || [],
    view_count: row.view_count || 0,
    weekly_view_count: row.weekly_view_count || 0,
    featured: row.featured || false,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

/**
 * 프론트엔드 레스토랑 모델을 DB 저장용 객체로 변환합니다.
 * @param restaurant 변환할 레스토랑 객체
 * @returns DB 저장용 객체
 */
export const mapRestaurantToDB = (restaurant: Restaurant): any => {
  return {
    id: restaurant.id,
    name: restaurant.name,
    thumbnail: restaurant.thumbnail,
    location1: restaurant.location1,
    location2: restaurant.location2,
    address: restaurant.address,
    map_lat: restaurant.map_info.lat,
    map_lng: restaurant.map_info.lng,
    corkage_type: restaurant.corkage_type,
    corkage_fee: restaurant.corkage_fee,
    corkage_info: restaurant.corkage_info,
    description: restaurant.description,
    phone: restaurant.phone,
    website: restaurant.website,
    business_hours: restaurant.business_hours,
    hashtags: restaurant.hashtags,
    images: restaurant.images,
    view_count: restaurant.view_count,
    weekly_view_count: restaurant.weekly_view_count,
    featured: restaurant.featured,
    updated_at: new Date().toISOString()
  };
};