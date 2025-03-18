import { supabase, shouldUseMockData } from '../lib/supabase';
import { Restaurant, RestaurantSubmission } from '../types';
import { mockData } from '../data/mockData';

// Get all restaurants
export const getAllRestaurants = async (): Promise<Restaurant[]> => {
  try {
    // If we should use mock data, return mock restaurants
    if (shouldUseMockData()) {
      console.log('Using mock restaurants data');
      return mockData.restaurants;
    }
    
    console.log('Fetching restaurants from Supabase...');
    
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('Supabase response:', { data, error });
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    // If no data, return mock data for development
    if (!data || data.length === 0) {
      console.log('No restaurants found, returning mock data');
      return mockData.restaurants;
    }
    
    const mappedRestaurants = data.map(row => ({
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
      hashtags: row.hashtags,
      images: row.images,
      view_count: row.view_count,
      weekly_view_count: row.weekly_view_count,
      featured: row.featured,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
    
    console.log('Mapped restaurants:', mappedRestaurants);
    return mappedRestaurants;
    
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    
    // Return mock data if there's an error
    return mockData.restaurants;
  }
};

// Get restaurant by ID
export const getRestaurantById = async (id: string): Promise<Restaurant | null> => {
  try {
    // If we should use mock data, return mock restaurant
    if (shouldUseMockData()) {
      console.log('Using mock restaurant data for ID:', id);
      const mockRestaurant = mockData.restaurants.find(r => r.id === id);
      return mockRestaurant || null;
    }
    
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      // Return mock data if not found
      const mockRestaurant = mockData.restaurants.find(r => r.id === id);
      return mockRestaurant || null;
    }
    
    return {
      id: data.id.toString(),
      name: data.name,
      thumbnail: data.thumbnail,
      location1: data.location1,
      location2: data.location2,
      address: data.address,
      map_info: {
        lat: data.map_lat,
        lng: data.map_lng
      },
      corkage_type: data.corkage_type,
      corkage_fee: data.corkage_fee,
      corkage_info: data.corkage_info,
      description: data.description,
      phone: data.phone,
      website: data.website,
      business_hours: data.business_hours,
      hashtags: data.hashtags,
      images: data.images,
      view_count: data.view_count,
      weekly_view_count: data.weekly_view_count,
      featured: data.featured,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error fetching restaurant by ID:', error);
    
    // Return mock data if there's an error
    const mockRestaurant = mockData.restaurants.find(r => r.id === id);
    return mockRestaurant || null;
  }
};

// Increment view count
export const incrementViewCount = async (id: string): Promise<void> => {
  try {
    // If we should use mock data, update the mock data
    if (shouldUseMockData()) {
      console.log('Using mock data for incrementing view count');
      return;
    }
    
    const { error } = await supabase
      .from('restaurants')
      .update({ 
        view_count: supabase.rpc('increment', { value: 1 }),
        weekly_view_count: supabase.rpc('increment', { value: 1 })
      })
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
};

// Submit restaurant
export const submitRestaurant = async (submission: RestaurantSubmission): Promise<string> => {
  try {
    // If we should use mock data, simulate submitting a restaurant
    if (shouldUseMockData()) {
      console.log('Using mock data for submitting restaurant');
      return 'mock-submission-' + Date.now();
    }
    
    const { data, error } = await supabase
      .from('restaurant_submissions')
      .insert([{
        name: submission.name,
        location1: submission.location1,
        location2: submission.location2,
        address: submission.address,
        map_lat: submission.lat,
        map_lng: submission.lng,
        corkage_type: submission.corkage_type,
        corkage_fee: submission.corkage_fee,
        corkage_info: submission.corkage_info,
        description: submission.description,
        phone: submission.phone,
        website: submission.website,
        business_hours: submission.business_hours,
        hashtags: submission.hashtags,
        images: submission.images,
        thumbnail: submission.thumbnail,
        status: 'pending',
        submitted_by: submission.submitted_by || null
      }])
      .select();
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      throw new Error('Failed to create submission');
    }
    
    return data[0].id;
  } catch (error) {
    console.error('Error submitting restaurant:', error);
    throw error;
  }
};

// Update restaurant
export const updateRestaurant = async (restaurant: Restaurant): Promise<void> => {
  try {
    // If we should use mock data, log and return
    if (shouldUseMockData()) {
      console.log('Using mock data for updating restaurant', restaurant);
      return;
    }
    
    const { error } = await supabase
      .from('restaurants')
      .update({
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
      })
      .eq('id', restaurant.id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating restaurant:', error);
    throw error;
  }
};

// Upload image to Supabase Storage
export const uploadImage = async (file: File): Promise<string> => {
  try {
    // If we should use mock data, return mock image URL
    if (shouldUseMockData()) {
      console.log('Using mock data for image upload');
      return `https://example.com/mock-image-${Date.now()}.jpg`;
    }
    
    // 파일 확장자 검사
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const validExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (!fileExt || !validExts.includes(fileExt)) {
      throw new Error('지원되지 않는 이미지 형식입니다. (jpg, jpeg, png, gif, webp만 허용)');
    }
    
    // 파일 크기 검사 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('이미지 크기는 10MB 이하여야 합니다.');
    }
    
    // 파일명 생성 (중복 방지를 위해 타임스탬프 추가)
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = `restaurants/${fileName}`;
    
    console.log('Uploading file:', { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type,
      filePath
    });
    
    // Supabase Storage에 업로드
    const { data, error } = await supabase
      .storage
      .from('easycorkage-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    console.log('Upload response:', { data, error });
    
    if (error) {
      console.error('업로드 에러:', error);
      throw error;
    }
    
    // 공개 URL 생성
    const { data: urlData } = supabase
      .storage
      .from('easycorkage-images')
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('이미지 업로드 에러:', error);
    throw error;
  }
};