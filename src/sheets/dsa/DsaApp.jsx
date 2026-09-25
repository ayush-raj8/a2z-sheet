import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import DsaSheet from './DsaSheet';

const BlogPage = lazy(() => import('./pages/BlogPage'));
const CompaniesPage = lazy(() => import('./pages/CompaniesPage'));
const CompanyDetailPage = lazy(() => import('./pages/CompanyDetailPage'));

function PageFallback() {
  return (
    <div className="app">
      <p className="page-status">Loading…</p>
    </div>
  );
}

export default function DsaApp() {
  return (
    <Routes>
      <Route index element={<DsaSheet />} />
      <Route
        path="companies"
        element={
          <Suspense fallback={<PageFallback />}>
            <CompaniesPage />
          </Suspense>
        }
      />
      <Route
        path="companies/:companySlug"
        element={
          <Suspense fallback={<PageFallback />}>
            <CompanyDetailPage />
          </Suspense>
        }
      />
      <Route
        path="blog/:topicId"
        element={
          <Suspense fallback={<PageFallback />}>
            <BlogPage />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/dsa" replace />} />
    </Routes>
  );
}
