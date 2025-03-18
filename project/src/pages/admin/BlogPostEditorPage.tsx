import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Image, X, Plus } from 'lucide-react';
import { useBlogStore } from '../../store/blog';
import { useAuthStore } from '../../store/auth';
import { useHashtagStore } from '../../store/hashtags';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { BlogPost } from '../../types';

interface BlogPostForm {
  title: string;
  slug: string;
  category: 'wine-info' | 'restaurant-news' | 'corkage-tips' | 'events';
  content: string;
  excerpt: string;
  featured_image: string;
  hashtags: string[];
  published: boolean;
}

export function BlogPostEditorPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentPost, fetchPostBySlug, createPost, updatePost, uploadImage } = useBlogStore();
  const { hashtags: availableHashtags } = useHashtagStore();
  
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [hashtagInput, setHashtagInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const isEditMode = !!slug;
  
  // Filter blog hashtags (different from restaurant hashtags)
  const blogHashtags = availableHashtags.filter(tag => 
    ['와인정보', '레스토랑소식', '콜키지팁', '이벤트', '와인추천', '와인상식', '음식페어링'].includes(tag)
  );
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<BlogPostForm>({
    defaultValues: {
      title: '',
      slug: '',
      category: 'wine-info',
      content: '',
      excerpt: '',
      featured_image: '',
      hashtags: [],
      published: true
    }
  });
  
  const selectedHashtags = watch('hashtags');
  const featuredImage = watch('featured_image');
  
  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/blog');
      return;
    }
    
    // If editing, fetch the post
    if (isEditMode && slug) {
      const loadPost = async () => {
        const post = await fetchPostBySlug(slug);
        if (post) {
          setValue('title', post.title);
          setValue('slug', post.slug);
          setValue('category', post.category);
          setValue('content', post.content);
          setValue('excerpt', post.excerpt);
          setValue('featured_image', post.featured_image);
          setValue('hashtags', post.hashtags);
          setValue('published', post.published);
        } else {
          navigate('/blog');
        }
      };
      loadPost();
    }
  }, [isEditMode, slug, user, navigate, fetchPostBySlug, setValue]);
  
  const handleAddHashtag = () => {
    if (hashtagInput.trim()) {
      const currentTags = watch('hashtags') || [];
      if (currentTags.length < 5) {
        setValue('hashtags', [...currentTags, hashtagInput.trim()]);
        setHashtagInput('');
      }
    }
  };
  
  const handleRemoveHashtag = (index: number) => {
    const currentTags = watch('hashtags');
    setValue('hashtags', currentTags.filter((_, i) => i !== index));
  };
  
  const handleHashtagToggle = (tag: string) => {
    const currentTags = watch('hashtags') || [];
    if (currentTags.includes(tag)) {
      setValue('hashtags', currentTags.filter(t => t !== tag));
    } else if (currentTags.length < 5) {
      setValue('hashtags', [...currentTags, tag]);
    }
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setImageUploading(true);
      setError(null);
      
      const file = files[0];
      const imageUrl = await uploadImage(file);
      setValue('featured_image', imageUrl);
    } catch (err) {
      setError('이미지 업로드에 실패했습니다.');
      console.error('Image upload error:', err);
    } finally {
      setImageUploading(false);
    }
  };
  
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  };
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setValue('title', title);
    
    // Only auto-generate slug if it's a new post or slug hasn't been manually edited
    if (!isEditMode || watch('slug') === '') {
      setValue('slug', generateSlug(title));
    }
  };
  
  const onSubmit = async (data: BlogPostForm) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        setError('로그인이 필요합니다.');
        return;
      }
      
      // Generate excerpt if empty
      if (!data.excerpt) {
        // Strip HTML tags and get first 150 characters
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data.content;
        const textContent = tempDiv.textContent || tempDiv.innerText;
        data.excerpt = textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '');
      }
      
      if (isEditMode && currentPost) {
        // Update existing post
        await updatePost(currentPost.id, data);
        navigate(`/blog/${data.slug}`);
      } else {
        // Create new post
        const postData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'likes_count' | 'comments_count'> = {
          ...data,
          author_id: user.id,
          published_at: new Date().toISOString()
        };
        
        const postId = await createPost(postData);
        navigate(`/blog/${data.slug}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '게시글 저장에 실패했습니다.');
      console.error('Post save error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            돌아가기
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? '게시글 수정' : '새 게시글 작성'}
          </h1>
          
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-6">
            {/* 제목 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                제목 *
              </label>
              <input
                type="text"
                {...register('title', { required: '제목을 입력해주세요' })}
                onChange={handleTitleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            
            {/* 슬러그 */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                슬러그 (URL) *
              </label>
              <input
                type="text"
                {...register('slug', { required: '슬러그를 입력해주세요' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                URL에 사용될 고유 식별자입니다. 영문, 숫자, 하이픈(-)만 사용 가능합니다.
              </p>
            </div>
            
            {/* 카테고리 */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                카테고리 *
              </label>
              <select
                {...register('category', { required: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="wine-info">와인 정보</option>
                <option value="restaurant-news">레스토랑 소식</option>
                <option value="corkage-tips">콜키지 팁</option>
                <option value="events">이벤트</option>
              </select>
            </div>
            
            {/* 대표 이미지 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대표 이미지 *
              </label>
              <div className="flex items-center space-x-4">
                {featuredImage ? (
                  <div className="relative w-32 h-32">
                    <img
                      src={featuredImage}
                      alt="Featured image preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setValue('featured_image', '')}
                      className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 cursor-pointer">
                    {imageUploading ? (
                      <LoadingSpinner className="h-8 w-8" />
                    ) : (
                      <>
                        <Image className="h-8 w-8 text-gray-400" />
                        <span className="mt-2 text-sm text-gray-500">업로드</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                    />
                  </label>
                )}
              </div>
              {errors.featured_image && (
                <p className="mt-1 text-sm text-red-600">대표 이미지를 업로드해주세요</p>
              )}
            </div>
            
            {/* 해시태그 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                해시태그 (최대 5개)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="해시태그 입력 후 엔터"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddHashtag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddHashtag}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  추가
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedHashtags?.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-50 text-primary-700"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveHashtag(index)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">추천 해시태그:</p>
                <div className="flex flex-wrap gap-2">
                  {blogHashtags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleHashtagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedHashtags?.includes(tag)
                          ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* 요약 */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                요약 (선택사항)
              </label>
              <textarea
                {...register('excerpt')}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="게시글의 간략한 요약을 입력하세요. 입력하지 않으면 자동으로 생성됩니다."
              />
            </div>
            
            {/* 본문 */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                본문 *
              </label>
              <textarea
                {...register('content', { required: '본문을 입력해주세요' })}
                rows={15}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="게시글 내용을 입력하세요. HTML 태그를 사용할 수 있습니다."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>
            
            {/* 게시 상태 */}
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="published"
                  {...register('published')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                  게시하기
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                체크하지 않으면 임시저장됩니다. 나중에 게시할 수 있습니다.
              </p>
            </div>
            
            {/* 제출 버튼 */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading || imageUploading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? (
                  <LoadingSpinner className="h-5 w-5" />
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    {isEditMode ? '게시글 수정하기' : '게시글 작성하기'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}