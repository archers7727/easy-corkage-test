import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Restaurant, RestaurantSubmission } from '../types';
import * as restaurantService from '../services/restaurantService';

interface RestaurantsState {
  submissions: RestaurantSubmission[];
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  fetchRestaurants: () => Promise<void>;
  fetchSubmissions: () => Promise<void>;
  addSubmission: (submission: RestaurantSubmission) => Promise<void>;
  updateSubmission: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  editSubmission: (submission: RestaurantSubmission) => Promise<void>;
  updateRestaurant: (restaurant: Restaurant) => Promise<void>;
  deleteRestaurant: (id: string) => Promise<void>;
  setFeaturedRestaurant: (id: string, featured: boolean) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
}

export const useRestaurantsStore = create<RestaurantsState>((set, get) => ({
  submissions: [],
  restaurants: [],
  loading: false,
  error: null,
  
  fetchRestaurants: async () => {
    try {
      set({ loading: true, error: null });
      
      const restaurants = await restaurantService.getAllRestaurants();
      set({ restaurants, loading: false });
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch restaurants',
        loading: false
      });
    }
  },
  
  fetchSubmissions: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('restaurant_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const submissions = data.map(row => ({
        id: row.id,
        name: row.name,
        location1: row.location1,
        location2: row.location2,
        address: row.address,
        lat: row.lat,
        lng: row.lng,
        corkage_type: row.corkage_type,
        corkage_fee: row.corkage_fee,
        corkage_info: row.corkage_info,
        description: row.description || '',
        phone: row.phone || '',
        website: row.website || '',
        business_hours: row.business_hours || '',
        hashtags: row.hashtags || [],
        images: row.images || [],
        thumbnail: row.thumbnail,
        status: row.status,
        submitted_by: row.submitted_by,
        created_at: row.created_at,
        updated_at: row.updated_at,
        reviewed_at: row.reviewed_at,
        reviewed_by: row.reviewed_by,
        review_notes: row.review_notes
      }));
      
      set({ submissions, loading: false });
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch submissions',
        loading: false
      });
    }
  },
  
// restaurants.ts의 addSubmission 함수 수정
addSubmission: async (submission) => {
  try {
    set({ loading: true, error: null });
    
    // 1. 클라이언트에서 생성한 임시 ID 제거
    const { id, ...submissionData } = submission;
    
    console.log('Sending submission data:', submissionData);
    
    // 2. 데이터 삽입 - ID 필드 없이 전송
    const { data, error } = await supabase
      .from('restaurant_submissions')
      .insert([submissionData])
      .select()  // 서버에서 생성된 ID를 포함한 전체 데이터 반환
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Submission successful with server-generated ID:', data.id);
    
    // 3. 상태 업데이트 - 서버에서 반환한 ID 사용
    set((state) => ({
      submissions: [data, ...state.submissions],
      loading: false
    }));
    
    return data.id;  // 서버에서 생성된 ID 반환
  } catch (error) {
    console.error('Submit error:', error);
    set({ 
      error: error instanceof Error ? error.message : '제출 실패',
      loading: false
    });
    throw error;
  }
},
  
  updateSubmission: async (id, status) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('restaurant_submissions')
        .update({
          status,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        submissions: state.submissions.map(sub =>
          sub.id === id
            ? { ...sub, status, reviewed_at: new Date().toISOString() }
            : sub
        ),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update submission',
        loading: false
      });
      throw error;
    }
  },
  
  editSubmission: async (submission) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('restaurant_submissions')
        .update(submission)
        .eq('id', submission.id);
      
      if (error) throw error;
      
      set((state) => ({
        submissions: state.submissions.map((sub) =>
          sub.id === submission.id
            ? { ...submission, updated_at: new Date().toISOString() }
            : sub
        ),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to edit submission',
        loading: false
      });
      throw error;
    }
  },
  
  updateRestaurant: async (restaurant) => {
    try {
      set({ loading: true, error: null });
      
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
          updated_at: new Date().toISOString()
        })
        .eq('id', restaurant.id);
      
      if (error) throw error;
      
      set((state) => ({
        restaurants: state.restaurants.map((rest) =>
          rest.id === restaurant.id
            ? { ...restaurant, updated_at: new Date().toISOString() }
            : rest
        ),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update restaurant',
        loading: false
      });
      throw error;
    }
  },
  
  deleteRestaurant: async (id) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        restaurants: state.restaurants.filter((rest) => rest.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete restaurant',
        loading: false
      });
      throw error;
    }
  },
  
  setFeaturedRestaurant: async (id, featured) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('restaurants')
        .update({ featured })
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        restaurants: state.restaurants.map((rest) =>
          rest.id === id
            ? { ...rest, featured, updated_at: new Date().toISOString() }
            : rest
        ),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update featured status',
        loading: false
      });
      throw error;
    }
  },
  
uploadImage: async (file: File) => {
  try {
    set({ loading: true, error: null });
    
    // 파일 유효성 검사 추가
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const validExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (!fileExt || !validExts.includes(fileExt)) {
      throw new Error('지원되지 않는 이미지 형식입니다.');
    }
    
    // Create a unique file name
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `restaurant-images/${fileName}`;
    
    console.log('Uploading file:', file.name, 'to bucket: easycorkage-images');
    
    // Upload to Supabase Storage - 버킷 이름 수정!
    const { data, error } = await supabase.storage
      .from('easycorkage-images')  // 'images'에서 'easycorkage-images'로 변경
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    console.log('Upload response:', { data, error });
    
    if (error) {
      console.error('Upload error details:', error);
      throw error;
    }
    
    // Get public URL - 버킷 이름 수정!
    const { data: { publicUrl } } = supabase.storage
      .from('easycorkage-images')  // 'images'에서 'easycorkage-images'로 변경
      .getPublicUrl(filePath);
    
    console.log('Generated URL:', publicUrl);
    
    set({ loading: false });
    return publicUrl;
    
  } catch (error) {
    console.error('이미지 업로드 에러:', error);
    set({ 
      error: error instanceof Error ? error.message : '이미지 업로드 실패',
      loading: false
    });
    throw error;
  }
}
}));

// Initialize data
useRestaurantsStore.getState().fetchRestaurants();
useRestaurantsStore.getState().fetchSubmissions();

export default useRestaurantsStore;