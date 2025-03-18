import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { RestaurantDetailPage } from './pages/RestaurantDetailPage';
import { RestaurantsPage } from './pages/RestaurantsPage';
import { SubmitRestaurantPage } from './pages/SubmitRestaurantPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { UsersPage } from './pages/admin/UsersPage';
import { AdminRestaurantsPage } from './pages/admin/RestaurantsPage';
import { ManageRestaurantsPage } from './pages/admin/ManageRestaurantsPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { BlogPostEditorPage } from './pages/admin/BlogPostEditorPage';
import { ProfilePage } from './pages/ProfilePage';
import { Wine } from 'lucide-react';
import { ScrollToTop } from './components/ScrollToTop';

// Temporary placeholder component for routes being developed
const Placeholder = ({ name }: { name: string }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
    <Wine className="w-12 h-12 text-purple-600 mb-4" />
    <h1 className="text-2xl font-semibold text-gray-900 mb-2">EasyCorkage</h1>
    <p className="text-gray-600">{name} page coming soon...</p>
  </div>
);

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/restaurants" element={<RestaurantsPage />} />
            <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
            <Route path="/submit" element={<SubmitRestaurantPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="users" element={<UsersPage />} />
              <Route path="restaurants" element={<AdminRestaurantsPage />} />
              <Route path="manage-restaurants" element={<ManageRestaurantsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="blog/new" element={<BlogPostEditorPage />} />
              <Route path="blog/edit/:slug" element={<BlogPostEditorPage />} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}