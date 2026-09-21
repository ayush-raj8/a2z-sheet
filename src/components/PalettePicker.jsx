import { PALETTES } from '../lib/palettes';

export default function PalettePicker({ value, onChange }) {
  return (
    <div className="palette-picker" role="radiogroup" aria-label="Color palette">
      {PALETTES.map((palette) => {
        const selected = palette.id === value;
        return (
          <button
            key={palette.id}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`palette-option${selected ? ' selected' : ''}`}
            title={palette.name}
            onClick={() => onChange(palette.id)}
          >
            <span className="palette-dots" aria-hidden="true">
              {Object.values(palette.colors).map((color, index) => (
                <span key={`${palette.id}-${index}`} className="palette-dot" style={{ background: color }} />
              ))}
            </span>
            <span className="palette-name">{palette.name}</span>
          </button>
        );
      })}
    </div>
  );
}
