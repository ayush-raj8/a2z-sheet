export function parseTags(quesTopic) {
  if (!quesTopic) return '';
  try {
    return JSON.parse(quesTopic).map((tag) => tag.label).join(', ');
  } catch {
    return '';
  }
}

export function getDifficultyClass(difficulty) {
  return ['difficulty-easy', 'difficulty-medium', 'difficulty-hard'][difficulty] || '';
}

export function countProgress(steps, progress) {
  let total = 0;
  let completed = 0;

  for (const step of steps) {
    for (const subStep of step.sub_steps || []) {
      for (const topic of subStep.topics || []) {
        total += 1;
        if (progress[topic.id]) completed += 1;
      }
    }
  }

  return { total, completed };
}

export function countGroup(topics, progress) {
  const total = topics.length;
  const completed = topics.filter((topic) => progress[topic.id]).length;
  const percent = total > 0 ? (completed / total) * 100 : 0;
  return { total, completed, percent, isComplete: total > 0 && completed === total };
}

export function collectExpandKeys(steps) {
  const keys = [];
  for (const step of steps) {
    keys.push(`step-${step.step_no}`);
    for (const subStep of step.sub_steps || []) {
      keys.push(`sub-${step.step_no}-${subStep.sub_step_no}`);
    }
  }
  return keys;
}
