import React from 'react';
import './Button.css';

const variants = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },   // aquí podrías renombrar "danger" si en tu CSS lo llamas así
  { key: 'neutral',   label: 'Neutral' },
  { key: 'danger',    label: 'Danger' },
  { key: 'text',      label: 'Text' },
];

export default function ButtonDemo() {
  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Button Variants</h1>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {variants.map(({ key, label }) => (
          <React.Fragment key={key}>
            <button className={`btn btn--${key}`}>{label}</button>
            <button className={`btn btn--${key} btn--disabled`} disabled>
              {label} Disabled
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
