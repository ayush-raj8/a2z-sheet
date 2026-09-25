import { countGroup } from '../lib/topics';
import TopicTable from './TopicTable';

function CollapsibleButton({ className, open, complete, percent, title, count, onClick }) {
  return (
    <button
      type="button"
      className={`${className}${open ? ' active' : ''}${complete ? ' completed' : ''}`}
      style={{ '--progress-width': `${percent}%` }}
      onClick={onClick}
      aria-expanded={open}
    >
      <span className="collapsible-title">{title}</span>
      <span className="collapsible-meta">
        <span className="progress-counter">{count}</span>
        <span className="collapsible-icon" aria-hidden="true">{open ? '–' : '+'}</span>
      </span>
    </button>
  );
}

function SubStep({
  stepNo,
  subStep,
  open,
  progress,
  notes,
  onToggleOpen,
  onToggleTopic,
  onEditNote,
  topicFilterIds,
}) {
  const topics = topicFilterIds
    ? (subStep.topics || []).filter((t) => topicFilterIds.has(t.id))
    : subStep.topics || [];
  const stats = countGroup(topics, progress);
  const key = `sub-${stepNo}-${subStep.sub_step_no}`;

  if (topicFilterIds && topics.length === 0) return null;

  return (
    <div className="sub-step">
      <CollapsibleButton
        className="sub-collapsible"
        open={open}
        complete={stats.isComplete}
        percent={stats.percent}
        title={`${subStep.sub_step_no}. ${subStep.sub_step_title.replace(/\n/g, ' ')}`}
        count={`${stats.completed}/${stats.total}`}
        onClick={() => onToggleOpen(key)}
      />
      {open ? (
        <div className="content-inner">
          <TopicTable
            topics={topics}
            progress={progress}
            notes={notes}
            onToggle={onToggleTopic}
            onEditNote={onEditNote}
          />
        </div>
      ) : null}
    </div>
  );
}

export default function StepSection({
  step,
  openKeys,
  progress,
  notes,
  onToggleOpen,
  onToggleTopic,
  onEditNote,
  topicFilterIds,
}) {
  const allTopics = (step.sub_steps || []).flatMap((subStep) => subStep.topics || []);
  const visibleTopics = topicFilterIds
    ? allTopics.filter((t) => topicFilterIds.has(t.id))
    : allTopics;
  if (topicFilterIds && visibleTopics.length === 0) return null;

  const stats = countGroup(visibleTopics, progress);
  const stepKey = `step-${step.step_no}`;
  const open = openKeys.has(stepKey);

  return (
    <section className="step-section">
      <CollapsibleButton
        className="collapsible"
        open={open}
        complete={stats.isComplete}
        percent={stats.percent}
        title={`Step ${step.step_no}: ${step.step_title}`}
        count={`${stats.completed}/${stats.total}`}
        onClick={() => onToggleOpen(stepKey)}
      />
      {open ? (
        <div className="content-inner">
          {(step.sub_steps || []).map((subStep) => (
            <SubStep
              key={`${step.step_no}-${subStep.sub_step_no}`}
              stepNo={step.step_no}
              subStep={subStep}
              open={openKeys.has(`sub-${step.step_no}-${subStep.sub_step_no}`)}
              progress={progress}
              notes={notes}
              onToggleOpen={onToggleOpen}
              onToggleTopic={onToggleTopic}
              onEditNote={onEditNote}
              topicFilterIds={topicFilterIds}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
