import { supabase, shouldUseMockData } from '../lib/supabase';
import { BlogPost, Comment, Like } from '../types';
import { mockData } from '../data/mockData';

// Get all blog posts
export const getAllPosts = async (category?: string, hashtag?: string): Promise<BlogPost[]> => {
  try {
    // If we should use mock data, return it immediately
    if (shouldUseMockData()) {
      console.log('Using mock blog posts data');
      let posts = [...mockData.blogPosts];
      
      if (category) {
        posts = posts.filter(post => post.category === category);
      }
      
      if (hashtag) {
        posts = posts.filter(post => post.hashtags.includes(hashtag));
      }
      
      return posts;
    }
    
    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        author:author_id(
          id,
          nickname,
          avatar_url,
          role
        )
      `)
      .eq('published', true)
      .order('published_at', { ascending: false });
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // If no data, return mock data for development
    if (!data || data.length === 0) {
      return hashtag 
        ? mockData.blogPosts.filter(post => post.hashtags.includes(hashtag))
        : mockData.blogPosts;
    }
    
    // Filter by hashtag if provided
    let posts = data.map(row => ({
      id: row.id.toString(),
      title: row.title,
      slug: row.slug,
      featured_image: row.featured_image,
      content: row.content,
      excerpt: row.excerpt,
      category: row.category,
      hashtags: row.hashtags,
      author_id: row.author_id,
      author: row.author,
      published: row.published,
      published_at: row.published_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      view_count: row.view_count,
      likes_count: row.likes_count,
      comments_count: row.comments_count
    }));
    
    if (hashtag) {
      posts = posts.filter(post => post.hashtags.includes(hashtag));
    }
    
    return posts;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    
    // Return mock data if there's an error
    let posts = [...mockData.blogPosts];
    
    if (category) {
      posts = posts.filter(post => post.category === category);
    }
    
    if (hashtag) {
      posts = posts.filter(post => post.hashtags.includes(hashtag));
    }
    
    return posts;
  }
};

// Get featured blog posts
export const getFeaturedPosts = async (limit: number = 4): Promise<BlogPost[]> => {
  try {
    // If we should use mock data, return it immediately
    if (shouldUseMockData()) {
      console.log('Using mock featured blog posts data');
      // Sort by view count and take the top ones
      return [...mockData.blogPosts]
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, limit);
    }
    
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        author:author_id(
          id,
          nickname,
          avatar_url,
          role
        )
      `)
      .eq('published', true)
      .order('view_count', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    // If no data, return mock data for development
    if (!data || data.length === 0) {
      return mockData.blogPosts
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, limit);
    }
    
    return data.map(row => ({
      id: row.id.toString(),
      title: row.title,
      slug: row.slug,
      featured_image: row.featured_image,
      content: row.content,
      excerpt: row.excerpt,
      category: row.category,
      hashtags: row.hashtags,
      author_id: row.author_id,
      author: row.author,
      published: row.published,
      published_at: row.published_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      view_count: row.view_count,
      likes_count: row.likes_count,
      comments_count: row.comments_count
    }));
  } catch (error) {
    console.error('Error fetching featured blog posts:', error);
    
    // Return mock data if there's an error
    return mockData.blogPosts
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, limit);
  }
};

// Get blog post by slug
export const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  try {
    // If we should use mock data, return it immediately
    if (shouldUseMockData()) {
      console.log('Using mock blog post data for slug:', slug);
      const mockPost = mockData.blogPosts.find(p => p.slug === slug);
      return mockPost || null;
    }
    
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        author:author_id(
          id,
          nickname,
          avatar_url,
          role
        )
      `)
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      // Return mock data if not found
      const mockPost = mockData.blogPosts.find(p => p.slug === slug);
      return mockPost || null;
    }
    
    return {
      id: data.id.toString(),
      title: data.title,
      slug: data.slug,
      featured_image: data.featured_image,
      content: data.content,
      excerpt: data.excerpt,
      category: data.category,
      hashtags: data.hashtags,
      author_id: data.author_id,
      author: data.author,
      published: data.published,
      published_at: data.published_at,
      created_at: data.created_at,
      updated_at: data.updated_at,
      view_count: data.view_count,
      likes_count: data.likes_count,
      comments_count: data.comments_count
    };
  } catch (error) {
    console.error('Error fetching blog post by slug:', error);
    
    // Return mock data if there's an error
    const mockPost = mockData.blogPosts.find(p => p.slug === slug);
    return mockPost || null;
  }
};

// Increment post view count
export const incrementPostViewCount = async (id: string): Promise<void> => {
  try {
    // If we should use mock data, update the mock data
    if (shouldUseMockData()) {
      console.log('Using mock data for incrementing view count');
      return;
    }
    
    const { error } = await supabase
      .from('blog_posts')
      .update({ view_count: supabase.rpc('increment', { value: 1 }) })
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error incrementing post view count:', error);
  }
};

// Create blog post
export const createPost = async (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'likes_count' | 'comments_count'>): Promise<string> => {
  try {
    // If we should use mock data, simulate creating a post
    if (shouldUseMockData()) {
      console.log('Using mock data for creating blog post');
      return 'mock-post-' + Date.now();
    }
    
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([{
        title: post.title,
        slug: post.slug,
        featured_image: post.featured_image,
        content: post.content,
        excerpt: post.excerpt,
        category: post.category,
        hashtags: post.hashtags,
        author_id: post.author_id,
        published: post.published,
        published_at: post.published ? post.published_at : null,
        view_count: 0,
        likes_count: 0,
        comments_count: 0
      }])
      .select('id')
      .single();
    
    if (error) throw error;
    
    return data.id.toString();
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }
};

// Update blog post
export const updatePost = async (id: string, updates: Partial<BlogPost>): Promise<void> => {
  try {
    // If we should use mock data, simulate updating a post
    if (shouldUseMockData()) {
      console.log('Using mock data for updating blog post');
      return;
    }
    
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.slug !== undefined) updateData.slug = updates.slug;
    if (updates.featured_image !== undefined) updateData.featured_image = updates.featured_image;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.excerpt !== undefined) updateData.excerpt = updates.excerpt;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.hashtags !== undefined) updateData.hashtags = updates.hashtags;
    if (updates.published !== undefined) {
      updateData.published = updates.published;
      if (updates.published && !updates.published_at) {
        updateData.published_at = new Date().toISOString();
      }
    }
    if (updates.published_at !== undefined) updateData.published_at = updates.published_at;
    
    const { error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating blog post:', error);
    throw error;
  }
};

// Delete blog post
export const deletePost = async (id: string): Promise<void> => {
  try {
    // If we should use mock data, simulate deleting a post
    if (shouldUseMockData()) {
      console.log('Using mock data for deleting blog post');
      return;
    }
    
    // Delete all comments for this post
    const { error: commentsError } = await supabase
      .from('comments')
      .delete()
      .eq('post_id', id);
    
    if (commentsError) throw commentsError;
    
    // Delete all likes for this post
    const { error: likesError } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', id);
    
    if (likesError) throw likesError;
    
    // Delete the post
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting blog post:', error);
    throw error;
  }
};

// Get comments for a post
export const getComments = async (postId: string): Promise<Comment[]> => {
  try {
    // If we should use mock data, return mock comments
    if (shouldUseMockData()) {
      console.log('Using mock comments data');
      return mockData.comments.filter(c => c.post_id === postId);
    }
    
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:user_id(
          id,
          nickname,
          avatar_url,
          role
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      // Return mock comments for this post
      return mockData.comments.filter(c => c.post_id === postId);
    }
    
    return data.map(row => ({
      id: row.id.toString(),
      post_id: row.post_id.toString(),
      user_id: row.user_id,
      user: row.user,
      content: row.content,
      created_at: row.created_at,
      updated_at: row.updated_at,
      likes_count: row.likes_count
    }));
  } catch (error) {
    console.error('Error fetching comments:', error);
    return mockData.comments.filter(c => c.post_id === postId);
  }
};

// Add comment
export const addComment = async (postId: string, userId: string, content: string): Promise<string> => {
  try {
    // If we should use mock data, simulate adding a comment
    if (shouldUseMockData()) {
      console.log('Using mock data for adding comment');
      return 'mock-comment-' + Date.now();
    }
    
    // Add comment
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        post_id: postId,
        user_id: userId,
        content,
        likes_count: 0
      }])
      .select('id')
      .single();
    
    if (error) throw error;
    
    // Increment comment count on post
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({ comments_count: supabase.rpc('increment', { value: 1 }) })
      .eq('id', postId);
    
    if (updateError) throw updateError;
    
    return data.id.toString();
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Update comment
export const updateComment = async (id: string, content: string): Promise<void> => {
  try {
    // If we should use mock data, simulate updating a comment
    if (shouldUseMockData()) {
      console.log('Using mock data for updating comment');
      return;
    }
    
    const { error } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
};

// Delete comment
export const deleteComment = async (id: string): Promise<void> => {
  try {
    // If we should use mock data, simulate deleting a comment
    if (shouldUseMockData()) {
      console.log('Using mock data for deleting comment');
      return;
    }
    
    // Get post ID first
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('post_id')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Delete likes for this comment
    const { error: likesError } = await supabase
      .from('likes')
      .delete()
      .eq('comment_id', id);
    
    if (likesError) throw likesError;
    
    // Delete the comment
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Decrement comment count on post
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({ comments_count: supabase.rpc('decrement', { value: 1 }) })
      .eq('id', comment.post_id);
    
    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// Get likes for a user
export const getLikes = async (userId: string): Promise<Like[]> => {
  try {
    // If we should use mock data, return mock likes
    if (shouldUseMockData()) {
      console.log('Using mock likes data');
      return mockData.likes.filter(l => l.user_id === userId);
    }
    
    const { data, error } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      // Return mock likes for this user
      return mockData.likes.filter(l => l.user_id === userId);
    }
    
    return data.map(row => ({
      id: row.id.toString(),
      user_id: row.user_id,
      post_id: row.post_id?.toString(),
      comment_id: row.comment_id?.toString(),
      created_at: row.created_at
    }));
  } catch (error) {
    console.error('Error fetching likes:', error);
    return mockData.likes.filter(l => l.user_id === userId);
  }
};

// Toggle post like
export const togglePostLike = async (userId: string, postId: string): Promise<boolean> => {
  try {
    // If we should use mock data, simulate toggling a like
    if (shouldUseMockData()) {
      console.log('Using mock data for toggling post like');
      return true; // Simulate successful like
    }
    
    // Check if already liked
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw checkError;
    }
    
    if (existingLike) {
      // Unlike
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);
      
      if (deleteError) throw deleteError;
      
      // Decrement like count on post
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({ likes_count: supabase.rpc('decrement', { value: 1 }) })
        .eq('id', postId);
      
      if (updateError) throw updateError;
      
      return false;
    } else {
      // Like
      const { error: insertError } = await supabase
        .from('likes')
        .insert([{
          user_id: userId,
          post_id: postId
        }]);
      
      if (insertError) throw insertError;
      
      // Increment like count on post
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({ likes_count: supabase.rpc('increment', { value: 1 }) })
        .eq('id', postId);
      
      if (updateError) throw updateError;
      
      return true;
    }
  } catch (error) {
    console.error('Error toggling post like:', error);
    throw error;
  }
};

// Toggle comment like
export const toggleCommentLike = async (userId: string, commentId: string): Promise<boolean> => {
  try {
    // If we should use mock data, simulate toggling a like
    if (shouldUseMockData()) {
      console.log('Using mock data for toggling comment like');
      return true; // Simulate successful like
    }
    
    // Check if already liked
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('comment_id', commentId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw checkError;
    }
    
    if (existingLike) {
      // Unlike
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);
      
      if (deleteError) throw deleteError;
      
      // Decrement like count on comment
      const { error: updateError } = await supabase
        .from('comments')
        .update({ likes_count: supabase.rpc('decrement', { value: 1 }) })
        .eq('id', commentId);
      
      if (updateError) throw updateError;
      
      return false;
    } else {
      // Like
      const { error: insertError } = await supabase
        .from('likes')
        .insert([{
          user_id: userId,
          comment_id: commentId
        }]);
      
      if (insertError) throw insertError;
      
      // Increment like count on comment
      const { error: updateError } = await supabase
        .from('comments')
        .update({ likes_count: supabase.rpc('increment', { value: 1 }) })
        .eq('id', commentId);
      
      if (updateError) throw updateError;
      
      return true;
    }
  } catch (error) {
    console.error('Error toggling comment like:', error);
    throw error;
  }
};

export default {
  getAllPosts,
  getFeaturedPosts,
  getPostBySlug,
  incrementPostViewCount,
  createPost,
  updatePost,
  deletePost,
  getComments,
  addComment,
  updateComment,
  deleteComment,
  getLikes,
  togglePostLike,
  toggleCommentLike
};