import { useEffect, useRef, useState } from 'react';

export default function NoteEditor({ topic, initialText, onSave, onClose }) {
  const [text, setText] = useState(initialText || '');
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  function save() {
    onSave(topic.id, text);
    onClose();
  }

  function clear() {
    setText('');
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-editor-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="modal-kicker">Note</p>
            <h2 id="note-editor-title">{topic.question_title}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <textarea
          ref={textareaRef}
          className="note-input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Add a short note for this question…"
          rows={8}
        />
        <div className="modal-actions">
          <button type="button" className="ghost-btn" onClick={clear} disabled={!text}>
            Clear
          </button>
          <div className="modal-actions-right">
            <button type="button" className="ghost-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="primary-btn" onClick={save}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
