import { create } from 'zustand';
import hashtagService from '../services/hashtagService';

// Define hashtag types for better categorization
export type HashtagType = 'restaurant' | 'blog' | 'both';

// Define hashtag with type information
interface Hashtag {
  name: string;
  type: HashtagType;
  count: number;
}

interface HashtagState {
  hashtags: string[];
  hashtagsWithTypes: Hashtag[];
  restaurantHashtags: string[];
  blogHashtags: string[];
  loading: boolean;
  error: string | null;
  fetchHashtags: () => Promise<void>;
  addHashtag: (tag: string, type?: HashtagType) => Promise<void>;
  removeHashtag: (tag: string) => Promise<void>;
}

export const useHashtagStore = create<HashtagState>((set, get) => ({
  hashtags: [],
  hashtagsWithTypes: [],
  restaurantHashtags: [],
  blogHashtags: [],
  loading: false,
  error: null,
  
  fetchHashtags: async () => {
    try {
      set({ loading: true, error: null });
      
      const hashtags = await hashtagService.getAllHashtags();
      
      // 임시로 타입 정보 추가
      const restaurantTags = [
        'fine-dining', 'casual', 'wine-bar', 'korean-fusion', 'italian', 'french', 
        'romantic', 'rooftop', 'private-room', 'sommelier', 'modern-korean', 'traditional',
        'tasting-menu', 'byob', 'outdoor-seating', 'view', 'date-night', 'group-dining',
        'lunch-special', 'wine-pairing', '스테이크', '프리미엄', '와인페어링', '와인바',
        '캐주얼', '인터내셔널', '프렌치', '로맨틱'
      ];
      
      const blogTags = [
        '와인정보', '레스토랑소식', '콜키지팁', '이벤트', '와인추천', '와인상식', '음식페어링'
      ];
      
      const hashtagsWithTypesData: Hashtag[] = hashtags.map(name => {
        let type: HashtagType = 'both';
        if (restaurantTags.includes(name) && !blogTags.includes(name)) {
          type = 'restaurant';
        } else if (blogTags.includes(name) && !restaurantTags.includes(name)) {
          type = 'blog';
        }
        
        return {
          name,
          type,
          count: 0 // 실제 카운트 정보가 없으므로 0으로 설정
        };
      });
      
      const restaurantHashtagsData = hashtags.filter(name => 
        restaurantTags.includes(name) || !blogTags.includes(name)
      );
      
      const blogHashtagsData = hashtags.filter(name => 
        blogTags.includes(name) || !restaurantTags.includes(name)
      );
      
      set({ 
        hashtags, 
        hashtagsWithTypes: hashtagsWithTypesData,
        restaurantHashtags: restaurantHashtagsData,
        blogHashtags: blogHashtagsData,
        loading: false 
      });
      
    } catch (error) {
      console.error('Failed to fetch hashtags:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch hashtags',
        loading: false
      });
    }
  },
  
  addHashtag: async (tag, type = 'both') => {
    try {
      set({ loading: true, error: null });
      
      const normalizedTag = tag.toLowerCase().trim();
      
      // Check if tag already exists
      if (get().hashtags.includes(normalizedTag)) {
        set({ loading: false });
        return;
      }
      
      await hashtagService.addHashtag(normalizedTag);
      
      // Update local state based on type
      set((state) => {
        const newHashtags = [...state.hashtags, normalizedTag];
        const newHashtagsWithTypes = [...state.hashtagsWithTypes, { name: normalizedTag, type, count: 0 }];
        
        const newRestaurantHashtags = type === 'restaurant' || type === 'both' 
          ? [...state.restaurantHashtags, normalizedTag]
          : state.restaurantHashtags;
          
        const newBlogHashtags = type === 'blog' || type === 'both'
          ? [...state.blogHashtags, normalizedTag]
          : state.blogHashtags;
        
        return {
          hashtags: newHashtags,
          hashtagsWithTypes: newHashtagsWithTypes,
          restaurantHashtags: newRestaurantHashtags,
          blogHashtags: newBlogHashtags,
          loading: false
        };
      });
    } catch (error) {
      console.error('Failed to add hashtag:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add hashtag',
        loading: false
      });
      throw error;
    }
  },
  
  removeHashtag: async (tag) => {
    try {
      set({ loading: true, error: null });
      
      await hashtagService.removeHashtag(tag);
      
      // Update local state
      set((state) => ({
        hashtags: state.hashtags.filter((t) => t !== tag),
        hashtagsWithTypes: state.hashtagsWithTypes.filter((t) => t.name !== tag),
        restaurantHashtags: state.restaurantHashtags.filter((t) => t !== tag),
        blogHashtags: state.blogHashtags.filter((t) => t !== tag),
        loading: false
      }));
    } catch (error) {
      console.error('Failed to remove hashtag:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to remove hashtag',
        loading: false
      });
      throw error;
    }
  }
}));

// Initialize hashtags
const initializeHashtags = async () => {
  const store = useHashtagStore.getState();
  await store.fetchHashtags();
};

initializeHashtags();