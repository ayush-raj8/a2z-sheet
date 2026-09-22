import { useState } from 'react';
import type { Quiz } from '../lib/types';
import { saveQuizAnswer } from '../lib/progress';

type Props = {
  quiz: Quiz;
  savedAnswer?: number;
  onAnswered?: (index: number) => void;
};

export default function QuizCard({ quiz, savedAnswer, onAnswered }: Props) {
  const [selected, setSelected] = useState<number | null>(
    typeof savedAnswer === 'number' ? savedAnswer : null
  );

  function choose(index: number) {
    setSelected(index);
    saveQuizAnswer(quiz.id, index);
    onAnswered?.(index);
  }

  const answered = selected !== null;
  const correct = answered && selected === quiz.correctIndex;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-sm font-medium text-zinc-100">{quiz.question}</p>
      <div className="mt-3 space-y-2">
        {quiz.options.map((option, index) => {
          const isSelected = selected === index;
          const isCorrect = index === quiz.correctIndex;
          let cls = 'border-zinc-800 hover:border-zinc-600';
          if (answered && isCorrect) cls = 'border-emerald-700 bg-emerald-950/30';
          else if (answered && isSelected && !isCorrect) cls = 'border-rose-800 bg-rose-950/20';
          else if (isSelected) cls = 'border-zinc-500';

          return (
            <button
              key={option}
              type="button"
              disabled={answered}
              onClick={() => choose(index)}
              className={`block w-full rounded-md border px-3 py-2 text-left text-sm text-zinc-200 disabled:cursor-default ${cls}`}
            >
              <span className="mr-2 text-zinc-500">{String.fromCharCode(65 + index)}.</span>
              {option}
            </button>
          );
        })}
      </div>
      {answered ? (
        <p className={`mt-3 text-sm ${correct ? 'text-emerald-400' : 'text-rose-300'}`}>
          {correct ? 'Correct. ' : 'Not quite. '}
          {quiz.explain}
        </p>
      ) : null}
    </div>
  );
}
