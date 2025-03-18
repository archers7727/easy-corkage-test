import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Heart, MessageSquare, Eye, ArrowLeft, Edit, Trash2, Share2, X } from 'lucide-react';
import { useBlogStore } from '../store/blog';
import { useAuthStore } from '../store/auth';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { BlogComment } from '../components/blog/BlogComment';
import { BlogCommentForm } from '../components/blog/BlogCommentForm';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const { 
    currentPost, 
    fetchPostBySlug, 
    incrementViewCount, 
    deletePost, 
    comments, 
    fetchComments,
    togglePostLike,
    isPostLiked
  } = useBlogStore();
  
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const isLiked = currentPost ? isPostLiked(currentPost.id) : false;
  
  useEffect(() => {
    if (slug) {
      const loadPost = async () => {
        const post = await fetchPostBySlug(slug);
        if (post) {
          incrementViewCount(post.id);
          fetchComments(post.id);
        }
      };
      loadPost();
    }
  }, [slug, fetchPostBySlug, incrementViewCount, fetchComments]);
  
  const handleLike = () => {
    if (!user) {
      alert('좋아요를 누르려면 로그인이 필요합니다.');
      return;
    }
    
    if (currentPost) {
      togglePostLike(currentPost.id);
    }
  };
  
  const handleDelete = async () => {
    if (!currentPost) return;
    
    try {
      await deletePost(currentPost.id);
      navigate('/blog');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('게시글 삭제 중 오류가 발생했습니다.');
    }
  };
  
  const handleShare = () => {
    setShowShareModal(true);
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('링크가 클립보드에 복사되었습니다.');
    setShowShareModal(false);
  };
  
  if (!currentPost) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }
  
  const formattedDate = formatDistanceToNow(new Date(currentPost.published_at), { 
    addSuffix: true,
    locale: ko
  });
  
  const categoryLabels: Record<string, string> = {
    'wine-info': '와인 정보',
    'restaurant-news': '레스토랑 소식',
    'corkage-tips': '콜키지 팁',
    'events': '이벤트'
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 뒤로가기 */}
        <Link to="/blog" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          블로그로 돌아가기
        </Link>
        
        {/* 게시글 헤더 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <img
            src={currentPost.featured_image}
            alt={currentPost.title}
            className="w-full h-48 sm:h-64 object-cover"
          />
          
          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                {categoryLabels[currentPost.category] || currentPost.category}
              </span>
              {currentPost.hashtags.map((tag) => (
                <Link 
                  key={tag} 
                  to={`/blog?hashtag=${tag}`}
                  className=" px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                >
                  #{tag}
                </Link>
              ))}
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{currentPost.title}</h1>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                {currentPost.author?.avatar_url ? (
                  <img 
                    src={currentPost.author.avatar_url} 
                    alt={currentPost.author.nickname}
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-bold">
                      {currentPost.author?.nickname?.charAt(0) || 'A'}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {currentPost.author?.nickname || '익명'}
                    {currentPost.author?.role === 'admin' && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-sm">
                        관리자
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">{formattedDate}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                
                {isAdmin && (
                  <>
                    <Link
                      to={`/blog/edit/${currentPost.slug}`}
                      className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="prose max-w-none prose-img:rounded-lg prose-headings:text-gray-900 prose-a:text-primary-600">
              <div dangerouslySetInnerHTML={{ __html: currentPost.content }} />
            </div>
            
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-6">
                <button 
                  onClick={handleLike}
                  className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                  disabled={!user}
                >
                  <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{currentPost.likes_count}</span>
                </button>
                
                <div className="flex items-center space-x-2 text-gray-500">
                  <MessageSquare className="h-6 w-6" />
                  <span>{comments.length}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-500">
                  <Eye className="h-6 w-6" />
                  <span>{currentPost.view_count}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 댓글 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">댓글 {comments.length}개</h2>
          
          {user ? (
            <BlogCommentForm postId={currentPost.id} />
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 text-center mb-6">
              <p className="text-gray-600">댓글을 작성하려면 로그인이 필요합니다.</p>
              <Link to="/auth" className="text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block">
                로그인하기
              </Link>
            </div>
          )}
          
          <div className="mt-8">
            {comments.length > 0 ? (
              <div className="space-y-1">
                {comments.map((comment) => (
                  <BlogComment key={comment.id} comment={comment} postId={currentPost.id} />
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">
                아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">게시글 삭제</h3>
            <p className="text-gray-600 mb-6">
              이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 공유하기 모달 */}
      {showShareModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">공유하기</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <button
              onClick={handleCopyLink}
              className="w-full py-2 px-4 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors flex items-center justify-center gap-2 mb-4"
            >
              <Share2 className="h-5 w-5" />
              링크 복사하기
            </button>
            
            {/* 소셜 미디어 공유 버튼들 */}
            <div className="grid grid-cols-2 gap-3">
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-4 bg-[#3b5998] text-white rounded-lg hover:bg-[#2d4373] transition-colors text-center"
              >
                Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(currentPost.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-4 bg-[#1da1f2] text-white rounded-lg hover:bg-[#0c85d0] transition-colors text-center"
              >
                Twitter
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}