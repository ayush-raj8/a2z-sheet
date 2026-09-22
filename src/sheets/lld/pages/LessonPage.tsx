import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LessonView from '../components/LessonView';
import { getAdjacent, getLesson } from '../content';
import {
  loadQuizAnswers,
  saveLastLesson,
  toggleBookmark,
  toggleCompleted,
} from '../lib/progress';

type Props = {
  completed: Set<string>;
  bookmarks: Set<string>;
  onProgressChange: (completed: string[]) => void;
  onBookmarksChange: (bookmarks: string[]) => void;
};

export default function LessonPage({
  completed,
  bookmarks,
  onProgressChange,
  onBookmarksChange,
}: Props) {
  const { lessonId = '' } = useParams();
  const lesson = getLesson(lessonId);
  const [quizAnswers, setQuizAnswers] = useState(loadQuizAnswers);

  useEffect(() => {
    if (lessonId) saveLastLesson(lessonId);
    setQuizAnswers(loadQuizAnswers());
  }, [lessonId]);

  if (!lesson) {
    return (
      <div className="px-6 py-10 text-zinc-400">
        Lesson not found. Pick one from the sidebar.
      </div>
    );
  }

  const { prev, next } = getAdjacent(lesson.id);

  return (
    <LessonView
      lesson={lesson}
      completed={completed.has(lesson.id)}
      bookmarked={bookmarks.has(lesson.id)}
      quizAnswers={quizAnswers}
      prev={prev}
      next={next}
      onToggleComplete={() => {
        const nextState = toggleCompleted(lesson.id);
        onProgressChange(nextState.completed);
      }}
      onToggleBookmark={() => {
        onBookmarksChange(toggleBookmark(lesson.id));
      }}
    />
  );
}
