import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/Layout/MainLayout';
import AdminLayout from '@/components/Layout/AdminLayout';
import PrivateRoute from '@/components/Common/PrivateRoute';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

// Lazy load pages
import { lazy, Suspense } from 'react';

const HomePage = lazy(() => import('@/pages/Home'));
const AboutPage = lazy(() => import('@/pages/About'));
const TeamPage = lazy(() => import('@/pages/Team'));
const ProjectsPage = lazy(() => import('@/pages/Projects'));
// Temporarily comment out ProjectDetail until it's implemented
// const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetail'));
const DevelopmentPage = lazy(() => import('@/pages/Development'));
const ContactPage = lazy(() => import('@/pages/Contact'));
const LoginPage = lazy(() => import('@/pages/Login'));

// Admin pages
const AdminDashboard = lazy(() => import('@/pages/Admin/Dashboard'));
const AdminProjects = lazy(() => import('@/pages/Admin/Projects'));
const AdminContacts = lazy(() => import('@/pages/Admin/Contacts'));
// const AdminTags = lazy(() => import('@/pages/Admin/Tags'));
const AdminSettings = lazy(() => import('@/pages/Admin/Settings'));
const AdminEmailSettings = lazy(() => import('@/pages/Admin/Settings/Email'));
const AdminPasswordSettings = lazy(() => import('@/pages/Admin/Settings/Password'));

// Admin loading component
const AdminLoading = () => (
  <div className="flex items-center justify-center h-64">
    <LoadingSpinner size="medium" />
  </div>
);

const Router = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <HomePage />
          </Suspense>
        } />
        <Route path="about" element={
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <AboutPage />
          </Suspense>
        } />
        <Route path="team" element={
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <TeamPage />
          </Suspense>
        } />
        <Route path="projects" element={
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <ProjectsPage />
          </Suspense>
        } />
        <Route path="projects/:slug" element={
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <div className="container mx-auto px-4 py-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">專案詳情頁面</h1>
                <p className="text-gray-600">此頁面正在開發中...</p>
              </div>
            </div>
          </Suspense>
        } />
        <Route path="development" element={
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <DevelopmentPage />
          </Suspense>
        } />
        <Route path="contact" element={
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <ContactPage />
          </Suspense>
        } />
      </Route>

      {/* Auth routes */}
      <Route path="/login" element={
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <LoginPage />
        </Suspense>
      } />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <PrivateRoute roles={['admin', 'editor']}>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={
          <Suspense fallback={<AdminLoading />}>
            <AdminDashboard />
          </Suspense>
        } />
        <Route path="projects" element={
          <Suspense fallback={<AdminLoading />}>
            <AdminProjects />
          </Suspense>
        } />
        <Route path="contacts" element={
          <Suspense fallback={<AdminLoading />}>
            <AdminContacts />
          </Suspense>
        } />
        {/* <Route path="tags" element={
          <Suspense fallback={<AdminLoading />}>
            <AdminTags />
          </Suspense>
        } /> */}
        <Route path="settings" element={
          <Suspense fallback={<AdminLoading />}>
            <AdminSettings />
          </Suspense>
        } />
        <Route path="settings/email" element={
          <Suspense fallback={<AdminLoading />}>
            <AdminEmailSettings />
          </Suspense>
        } />
        <Route path="settings/password" element={
          <Suspense fallback={<AdminLoading />}>
            <AdminPasswordSettings />
          </Suspense>
        } />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Router;