import React from 'react';
import '../../styles/tokens.css';
import './Button.css'; // your button styles

const ButtonDemo = () => (
  <div style={{ display: 'grid', gap: '1rem', padding: '2rem', background: '#f5f5f5' }}>
    <h1>Button Variants</h1>
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <button className="btn btn-primary">Primary</button>
      <button className="btn btn-primary" disabled>Primary Disabled</button>

      <button className="btn btn-secondary">Secondary</button>
      <button className="btn btn-secondary" disabled>Secondary Disabled</button>

      <button className="btn btn-neutral">Neutral</button>
      <button className="btn btn-neutral" disabled>Neutral Disabled</button>

      <button className="btn btn-danger">Danger</button>
      <button className="btn btn-danger" disabled>Danger Disabled</button>

      <button className="btn btn-text">Text</button>
      <button className="btn btn-text" disabled>Text Disabled</button>
    </div>
  </div>
);

export default ButtonDemo;