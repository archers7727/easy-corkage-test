import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { BlogPost, Comment, Like } from '../types';
import { useAuthStore } from './auth';
import blogService from '../services/blogService';

interface BlogState {
  posts: BlogPost[];
  featuredPosts: BlogPost[];
  currentPost: BlogPost | null;
  comments: Comment[];
  likes: Like[];
  loading: boolean;
  error: string | null;
  
  // Posts
  fetchPosts: (category?: string, hashtag?: string) => Promise<void>;
  fetchFeaturedPosts: () => Promise<void>;
  fetchPostBySlug: (slug: string) => Promise<BlogPost | null>;
  createPost: (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'likes_count' | 'comments_count'>) => Promise<string>;
  updatePost: (id: string, updates: Partial<BlogPost>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  incrementViewCount: (id: string) => Promise<void>;
  
  // Comments
  fetchComments: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<string>;
  updateComment: (id: string, content: string) => Promise<void>;
  deleteComment: (id: string, postId: string) => Promise<void>;
  
  // Likes
  fetchLikes: (userId: string) => Promise<void>;
  togglePostLike: (postId: string) => Promise<void>;
  toggleCommentLike: (commentId: string) => Promise<void>;
  isPostLiked: (postId: string) => boolean;
  isCommentLiked: (commentId: string) => boolean;
  
  // Images
  uploadImage: (file: File) => Promise<string>;
}

export const useBlogStore = create<BlogState>((set, get) => ({
  posts: [],
  featuredPosts: [],
  currentPost: null,
  comments: [],
  likes: [],
  loading: false,
  error: null,
  
  fetchPosts: async (category?: string, hashtag?: string) => {
    try {
      set({ loading: true, error: null });
      const posts = await blogService.getAllPosts(category, hashtag);
      set({ posts, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch posts',
        loading: false
      });
    }
  },
  
  fetchFeaturedPosts: async () => {
    try {
      set({ loading: true, error: null });
      const featuredPosts = await blogService.getFeaturedPosts(4);
      set({ featuredPosts, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch featured posts',
        loading: false
      });
    }
  },
  
  fetchPostBySlug: async (slug: string) => {
    try {
      set({ loading: true, error: null });
      const post = await blogService.getPostBySlug(slug);
      if (!post) {
        set({ loading: false, currentPost: null });
        return null;
      }
      set({ currentPost: post, loading: false });
      return post;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch post',
        loading: false,
        currentPost: null
      });
      return null;
    }
  },
  
  createPost: async (post) => {
    try {
      set({ loading: true, error: null });
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');
      if (user.role !== 'admin') throw new Error('Only admins can create posts');
      
      const postId = await blogService.createPost(post);
      set({ loading: false });
      return postId;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create post',
        loading: false
      });
      throw error;
    }
  },
  
  updatePost: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');
      if (user.role !== 'admin') throw new Error('Only admins can update posts');
      
      await blogService.updatePost(id, updates);
      if (get().currentPost?.id === id) {
        set((state) => ({
          currentPost: state.currentPost ? { ...state.currentPost, ...updates } : null
        }));
      }
      set({ loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update post',
        loading: false
      });
      throw error;
    }
  },
  
  deletePost: async (id) => {
    try {
      set({ loading: true, error: null });
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');
      if (user.role !== 'admin') throw new Error('Only admins can delete posts');
      
      await blogService.deletePost(id);
      set((state) => ({
        posts: state.posts.filter(post => post.id !== id),
        currentPost: state.currentPost?.id === id ? null : state.currentPost,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete post',
        loading: false
      });
      throw error;
    }
  },
  
  incrementViewCount: async (id) => {
    try {
      await blogService.incrementPostViewCount(id);
      set((state) => ({
        currentPost: state.currentPost?.id === id 
          ? { ...state.currentPost, view_count: (state.currentPost.view_count || 0) + 1 }
          : state.currentPost,
        posts: state.posts.map(post => 
          post.id === id 
            ? { ...post, view_count: (post.view_count || 0) + 1 }
            : post
        )
      }));
    } catch (error) {
      console.error('Failed to increment view count:', error);
    }
  },
  
  fetchComments: async (postId) => {
    try {
      set({ loading: true, error: null });
      const comments = await blogService.getComments(postId);
      set({ comments, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch comments',
        loading: false
      });
    }
  },
  
  addComment: async (postId, content) => {
    try {
      set({ loading: true, error: null });
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');
      
      const commentId = await blogService.addComment(postId, user.id, content);
      set((state) => ({
        currentPost: state.currentPost?.id === postId 
          ? { ...state.currentPost, comments_count: (state.currentPost.comments_count || 0) + 1 }
          : state.currentPost,
        loading: false
      }));
      return commentId;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add comment',
        loading: false
      });
      throw error;
    }
  },
  
  updateComment: async (id, content) => {
    try {
      set({ loading: true, error: null });
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');
      
      await blogService.updateComment(id, content);
      set((state) => ({
        comments: state.comments.map(comment => 
          comment.id === id 
            ? { ...comment, content, updated_at: new Date().toISOString() }
            : comment
        ),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update comment',
        loading: false
      });
      throw error;
    }
  },
  
  deleteComment: async (id, postId) => {
    try {
      set({ loading: true, error: null });
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');
      
      await blogService.deleteComment(id);
      set((state) => ({
        comments: state.comments.filter(comment => comment.id !== id),
        currentPost: state.currentPost?.id === postId 
          ? { ...state.currentPost, comments_count: Math.max(0, (state.currentPost.comments_count || 0) - 1) }
          : state.currentPost,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete comment',
        loading: false
      });
      throw error;
    }
  },
  
  fetchLikes: async (userId) => {
    try {
      set({ loading: true, error: null });
      const likes = await blogService.getLikes(userId);
      set({ likes, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch likes',
        loading: false
      });
    }
  },
  
  togglePostLike: async (postId) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');
      
      const isLiked = get().isPostLiked(postId);
      const result = await blogService.togglePostLike(user.id, postId);
      
      if (result === !isLiked) {
        if (isLiked) {
          set((state) => ({
            likes: state.likes.filter(like => like.post_id !== postId),
            currentPost: state.currentPost?.id === postId 
              ? { ...state.currentPost, likes_count: Math.max(0, (state.currentPost.likes_count || 0) - 1) }
              : state.currentPost,
            posts: state.posts.map(post => 
              post.id === postId 
                ? { ...post, likes_count: Math.max(0, (post.likes_count || 0) - 1) }
                : post
            )
          }));
        } else {
          const newLike: Like = {
            id: 'temp-like-id-' + Date.now(),
            user_id: user.id,
            post_id: postId,
            created_at: new Date().toISOString()
          };
          
          set((state) => ({
            likes: [...state.likes, newLike],
            currentPost: state.currentPost?.id === postId 
              ? { ...state.currentPost, likes_count: (state.currentPost.likes_count || 0) + 1 }
              : state.currentPost,
            posts: state.posts.map(post => 
              post.id === postId 
                ? { ...post, likes_count: (post.likes_count || 0) + 1 }
                : post
            )
          }));
        }
      }
    } catch (error) {
      console.error('Failed to toggle post like:', error);
    }
  },
  
  toggleCommentLike: async (commentId) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');
      
      const isLiked = get().isCommentLiked(commentId);
      const result = await blogService.toggleCommentLike(user.id, commentId);
      
      if (result === !isLiked) {
        if (isLiked) {
          set((state) => ({
            likes: state.likes.filter(like => like.comment_id !== commentId),
            comments: state.comments.map(comment => 
              comment.id === commentId 
                ? { ...comment, likes_count: Math.max(0, (comment.likes_count || 0) - 1) }
                : comment
            )
          }));
        } else {
          const newLike: Like = {
            id: 'temp-like-id-' + Date.now(),
            user_id: user.id,
            comment_id: commentId,
            created_at: new Date().toISOString()
          };
          
          set((state) => ({
            likes: [...state.likes, newLike],
            comments: state.comments.map(comment => 
              comment.id === commentId 
                ? { ...comment, likes_count: (comment.likes_count || 0) + 1 }
                : comment
            )
          }));
        }
      }
    } catch (error) {
      console.error('Failed to toggle comment like:', error);
    }
  },
  
  isPostLiked: (postId) => {
    const { user } = useAuthStore.getState();
    if (!user) return false;
    return get().likes.some(like => like.post_id === postId);
  },
  
  isCommentLiked: (commentId) => {
    const { user } = useAuthStore.getState();
    if (!user) return false;
    return get().likes.some(like => like.comment_id === commentId);
  },
  
  uploadImage: async (file: File): Promise<string> => {
    try {
      set({ loading: true, error: null });
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;
      
      // Use the correct bucket name
      const bucketName = 'easycorkage-images';
      
      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }
      
      // Get public URL
      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      if (urlError) {
        console.error('URL error:', urlError);
        throw urlError;
      }
      
      console.log('Upload successful. Public URL:', publicUrl);
      set({ loading: false });
      return publicUrl;
      
    } catch (error) {
      console.error('Image upload error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to upload image',
        loading: false
      });
      throw error;
    }
  }
}));

// Initialize blog data
const initializeBlogData = async () => {
  try {
    // Fetch initial posts
    useBlogStore.getState().fetchPosts();
    useBlogStore.getState().fetchFeaturedPosts();
    
    // Fetch user's likes if authenticated
    const { user } = useAuthStore.getState();
    if (user) {
      useBlogStore.getState().fetchLikes(user.id);
    }
  } catch (error) {
    console.error('Error initializing blog data:', error);
  }
};

// Initialize when auth state changes
useAuthStore.subscribe(
  (state) => state.user,
  (user) => {
    if (user) {
      useBlogStore.getState().fetchLikes(user.id);
    } else {
      // Clear likes when logged out
      useBlogStore.setState({ likes: [] });
    }
  }
);

// Initialize blog data
initializeBlogData();

export default useBlogStore;