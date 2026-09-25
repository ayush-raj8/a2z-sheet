import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';

const DsaApp = lazy(() => import('./sheets/dsa/DsaApp'));
const LldApp = lazy(() => import('./sheets/lld/LldApp'));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-zinc-400">
      Loading…
    </div>
  );
}

export default function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dsa/*" element={<DsaApp />} />
        <Route path="/lld/*" element={<LldApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
