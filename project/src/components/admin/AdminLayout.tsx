import React from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { Users, Store, Settings, Star, FileText, PenSquare } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/auth';
import { LoadingSpinner } from '../ui/LoadingSpinner';

const navItems = [
  { path: '/admin/users', label: '사용자 관리', icon: Users },
  { path: '/admin/restaurants', label: '레스토랑 관리', icon: Store },
  { path: '/admin/manage-restaurants', label: '등록 레스토랑 관리', icon: Star },
  { path: '/admin/blog/new', label: '블로그 작성', icon: PenSquare },
  { path: '/admin/settings', label: '설정', icon: Settings },
];

export function AdminLayout() {
  const location = useLocation();
  const { user, loading } = useAuthStore();
  
  // If still loading auth state, show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }
  
  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen fixed">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800">관리자 대시보드</h2>
          </div>
          <nav className="mt-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50",
                  location.pathname === path && "bg-primary-50 text-primary-700 border-r-4 border-primary-600"
                )}
              >
                <Icon className="h-5 w-5 mr-3" />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}