import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { loadBookmarks, loadLastLesson, loadProgress } from './lib/progress';
import BookmarksPage from './pages/BookmarksPage';
import Dashboard from './pages/Dashboard';
import LessonPage from './pages/LessonPage';
import SearchPage from './pages/SearchPage';

export default function LldApp() {
  const location = useLocation();
  const [completed, setCompleted] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [lastLesson, setLastLesson] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setCompleted(loadProgress().completed);
    setBookmarks(loadBookmarks());
    setLastLesson(loadLastLesson());
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-black text-zinc-100">
      <Sidebar
        completed={new Set(completed)}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3 lg:hidden">
          <button
            type="button"
            className="rounded border border-zinc-700 px-2 py-1 text-sm"
            onClick={() => setSidebarOpen(true)}
          >
            Menu
          </button>
          <span className="text-sm text-zinc-400">Java → OOP → LLD</span>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route
              index
              element={<Dashboard completed={completed} lastLesson={lastLesson} />}
            />
            <Route
              path="lesson/:lessonId"
              element={
                <LessonPage
                  completed={new Set(completed)}
                  bookmarks={new Set(bookmarks)}
                  onProgressChange={setCompleted}
                  onBookmarksChange={setBookmarks}
                />
              }
            />
            <Route path="bookmarks" element={<BookmarksPage bookmarks={bookmarks} />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="*" element={<Navigate to="/lld" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
