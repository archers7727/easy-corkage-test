import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useBlogStore } from '../../store/blog';
import { useAuthStore } from '../../store/auth';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface BlogCommentFormProps {
  postId: string;
}

export function BlogCommentForm({ postId }: BlogCommentFormProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { addComment } = useBlogStore();
  const { user } = useAuthStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    if (!user) {
      setError('댓글을 작성하려면 로그인이 필요합니다.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await addComment(postId, content);
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '댓글 작성 중 오류가 발생했습니다.');
      console.error('Error adding comment:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="댓글을 작성해주세요..."
          className="w-full p-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          rows={3}
          disabled={loading}
        />
        
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="absolute bottom-3 right-3 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <LoadingSpinner className="h-5 w-5" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </form>
    </div>
  );
}