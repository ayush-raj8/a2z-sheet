import blogLogo from '../../../../assets/logo/post.svg';
import ytLogo from '../../../../assets/logo/yt.svg';
import tufLogo from '../../../../assets/logo/tuf.svg';
import gfgLogo from '../../../../assets/logo/gfg.svg';
import cnLogo from '../../../../assets/logo/cn.svg';
import lcLogo from '../../../../assets/logo/lc.svg';
import { getDifficultyClass, parseTags } from '../lib/topics';

const platformLogos = {
  BLOG: blogLogo,
  YT: ytLogo,
  TUF: tufLogo,
  GFG: gfgLogo,
  CN: cnLogo,
  LC: lcLogo,
};

function LinkCell({ url, label }) {
  if (!url) {
    return <td className="na-cell">—</td>;
  }

  return (
    <td className="link-cell">
      <a href={url} target="_blank" rel="noopener noreferrer" title={label}>
        <img src={platformLogos[label]} alt="" />
        <span className="sr-only">{label}</span>
      </a>
    </td>
  );
}

function TopicRow({ topic, completed, note, onToggle, onEditNote }) {
  const tags = parseTags(topic.ques_topic);
  const className = [getDifficultyClass(topic.difficulty), completed ? 'completed' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <tr className={className}>
      <td className="topic-cell" title={tags}>
        <div className="topic-title">{topic.question_title}</div>
      </td>
      <LinkCell url={topic.post_link} label="BLOG" />
      <LinkCell url={topic.yt_link} label="YT" />
      <LinkCell url={topic.lc_link} label="LC" />
      <LinkCell url={topic.gfg_link} label="GFG" />
      <LinkCell url={topic.cs_link} label="CN" />
      <LinkCell url={topic.plus_link} label="TUF" />
      <td className="note-cell">
        <button
          type="button"
          className={`note-btn${note ? ' has-note' : ''}`}
          onClick={() => onEditNote(topic)}
          aria-label={note ? `Edit note for ${topic.question_title}` : `Add note for ${topic.question_title}`}
          title={note ? 'Edit note' : 'Add note'}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M5 4.75h10.5A2.75 2.75 0 0 1 18.25 7.5V14L14 18.25H5A.75.75 0 0 1 4.25 17.5V5.5A.75.75 0 0 1 5 4.75Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path d="M14 18.25V15a1 1 0 0 1 1-1h3.25" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
      </td>
      <td className="status-cell" onClick={() => onToggle(topic.id)}>
        <input
          type="checkbox"
          className="status-checkbox"
          checked={completed}
          readOnly
          aria-label={`Mark ${topic.question_title} as done`}
        />
      </td>
    </tr>
  );
}

export default function TopicTable({ topics, progress, notes, onToggle, onEditNote }) {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Topic</th>
            <th title="Blog">Blog</th>
            <th title="YouTube">YT</th>
            <th title="LeetCode">LC</th>
            <th title="GeeksForGeeks">GFG</th>
            <th title="CodingNinjas">CN</th>
            <th title="TakeUForward+">TUF</th>
            <th>Note</th>
            <th>Done</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((topic) => (
            <TopicRow
              key={topic.id}
              topic={topic}
              completed={Boolean(progress[topic.id])}
              note={notes[topic.id]}
              onToggle={onToggle}
              onEditNote={onEditNote}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
