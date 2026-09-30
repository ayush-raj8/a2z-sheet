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

/** Progress bar / tab tint by completion: <50 · ≥50 · >75 · ≥90 · 100 */
export function progressTierClass(percent) {
  if (percent >= 100) return 'progress-tier-100';
  if (percent >= 90) return 'progress-tier-90';
  if (percent > 75) return 'progress-tier-75';
  if (percent >= 50) return 'progress-tier-50';
  return 'progress-tier-0';
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
