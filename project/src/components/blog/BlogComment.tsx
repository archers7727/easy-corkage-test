import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Heart, Edit2, Trash2, X, Check } from 'lucide-react';
import { Comment } from '../../types';
import { useAuthStore } from '../../store/auth';
import { useBlogStore } from '../../store/blog';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface BlogCommentProps {
  comment: Comment;
  postId: string;
}

export function BlogComment({ comment, postId }: BlogCommentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuthStore();
  const { 
    deleteComment, 
    updateComment, 
    toggleCommentLike, 
    isCommentLiked 
  } = useBlogStore();
  
  const formattedDate = formatDistanceToNow(new Date(comment.created_at), { 
    addSuffix: true,
    locale: ko
  });
  
  const isLiked = isCommentLiked(comment.id);
  const isOwner = user?.id === comment.user_id;
  const isAdmin = user?.role === 'admin';
  const canModify = isOwner || isAdmin;
  
  const handleDelete = async () => {
    if (!window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;
    
    try {
      setLoading(true);
      await deleteComment(comment.id, postId);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('댓글 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdate = async () => {
    if (editContent.trim() === '') return;
    
    try {
      setLoading(true);
      await updateComment(comment.id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('댓글 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLike = async () => {
    if (!user) {
      alert('좋아요를 누르려면 로그인이 필요합니다.');
      return;
    }
    
    try {
      await toggleCommentLike(comment.id);
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  };
  
  return (
    <div className="border-b border-gray-200 py-4 last:border-b-0">
      <div className="flex items-start">
        {/* 사용자 아바타 */}
        {comment.user?.avatar_url ? (
          <img 
            src={comment.user.avatar_url} 
            alt={comment.user.nickname}
            className="w-10 h-10 rounded-full mr-3 object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
            <span className="text-primary-600 font-bold">
              {comment.user?.nickname?.charAt(0) || 'U'}
            </span>
          </div>
        )}
        
        <div className="flex-1">
          {/* 댓글 헤더 */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <span className="font-medium text-gray-900">
                {comment.user?.nickname || '익명'}
              </span>
              {comment.user?.role === 'admin' && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-sm">
                  관리자
                </span>
              )}
              <span className="mx-2 text-gray-300">•</span>
              <span className="text-sm text-gray-500">{formattedDate}</span>
            </div>
            
            {canModify && !isEditing && (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={handleDelete}
                  className="p-1 text-gray-400 hover:text-red-600"
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            )}
          </div>
          
          {/* 댓글 내용 */}
          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
              />
              <div className="flex justify-end mt-2 space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 flex items-center"
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-1" />
                  취소
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <LoadingSpinner className="h-4 w-4 mr-1" />
                  ) : (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  저장
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-800 whitespace-pre-line">{comment.content}</p>
          )}
          
          {/* 댓글 푸터 */}
          {!isEditing && (
            <div className="mt-2 flex items-center">
              <button 
                onClick={handleLike}
                className={`flex items-center text-sm ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                disabled={!user}
              >
                <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                <span>{comment.likes_count > 0 ? comment.likes_count : ''}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}