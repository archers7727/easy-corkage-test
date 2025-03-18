import React from 'react';
import { Link } from 'react-router-dom';
import { BlogCard } from '../blog/BlogCard';
import { BlogPost } from '../../types';

interface FeaturedBlogPostsProps {
  posts: BlogPost[];
}

export function FeaturedBlogPosts({ posts }: FeaturedBlogPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">블로그</h2>
          <Link
            to="/blog"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            더보기
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.slice(0, 3).map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}