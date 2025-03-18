import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Heart, MessageSquare, Eye } from 'lucide-react';
import { BlogPost } from '../../types';
import { cn } from '../../lib/utils';

interface BlogCardProps {
  post: BlogPost;
  className?: string;
  featured?: boolean;
}

export function BlogCard({ post, className, featured = false }: BlogCardProps) {
  const formattedDate = formatDistanceToNow(new Date(post.published_at), { 
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
    <Link 
      to={`/blog/${post.slug}`} 
      className={cn(
        "block group h-full",
        className
      )}
    >
      <div className={cn(
        "flex flex-col h-full overflow-hidden rounded-lg shadow-md transition-all duration-200 hover:shadow-lg bg-white",
        featured && "md:flex-row"
      )}>
        {/* 이미지 컨테이너 */}
        <div className={cn(
          "relative w-full overflow-hidden",
          featured ? "md:w-1/2 h-48 md:h-auto" : "h-48"
        )}>
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
          <div className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full bg-white text-gray-900 shadow-sm">
            {categoryLabels[post.category] || post.category}
          </div>
        </div>
        
        {/* 카드 내용 */}
        <div className={cn(
          "flex flex-col p-4",
          featured ? "md:w-1/2 md:p-6" : ""
        )}>
          <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{post.title}</h3>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {post.excerpt}
          </p>
          
          {/* 해시태그 */}
          <div className="flex flex-wrap gap-1 mb-3 overflow-hidden">
            {post.hashtags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full truncate">
                #{tag}
              </span>
            ))}
          </div>
          
          {/* 메타 정보 */}
          <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              {post.author?.avatar_url ? (
                <img 
                  src={post.author.avatar_url} 
                  alt={post.author.nickname}
                  className="w-6 h-6 rounded-full mr-2 object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                  <span className="text-primary-600 text-xs font-bold">
                    {post.author?.nickname?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              <span className="truncate max-w-[80px]">{post.author?.nickname || '익명'}</span>
              <span className="mx-2">•</span>
              <span>{formattedDate}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                <span>{post.view_count}</span>
              </div>
              <div className="flex items-center">
                <Heart className="h-3 w-3 mr-1" />
                <span>{post.likes_count}</span>
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-3 w-3 mr-1" />
                <span>{post.comments_count}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}