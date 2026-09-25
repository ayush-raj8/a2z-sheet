import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import DsaSheet from './DsaSheet';

const BlogPage = lazy(() => import('./pages/BlogPage'));

function BlogFallback() {
  return (
    <div className="app">
      <p className="page-status">Loading lesson…</p>
    </div>
  );
}

export default function DsaApp() {
  return (
    <Routes>
      <Route index element={<DsaSheet />} />
      <Route
        path="blog/:topicId"
        element={
          <Suspense fallback={<BlogFallback />}>
            <BlogPage />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/dsa" replace />} />
    </Routes>
  );
}
