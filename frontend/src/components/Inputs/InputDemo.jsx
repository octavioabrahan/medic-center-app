import React, { useState } from "react";
import CheckboxField from "./CheckboxField";
import RadioField from "./RadioField";
import './CheckboxFieldDemo.css';

export default function InputDemo() {
  // Checkbox states
  const [checkedHug, setCheckedHug] = useState(false);
  const [indeterminateHug, setIndeterminateHug] = useState(false);
  const [checkedFill, setCheckedFill] = useState(false);
  const [indeterminateFill, setIndeterminateFill] = useState(false);

  // Radio states
  const [radioDefault, setRadioDefault] = useState('a');
  const [radioFill, setRadioFill] = useState('a');

  return (
    <section className="checkbox-demo-section">
      <h2>Checkbox Field Demo</h2>
      <div className="checkbox-demo-label">Default</div>
      <div className="checkbox-demo-row">
        <CheckboxField label="Label" description="Description" checked={checkedHug} onChange={setCheckedHug} />
        <CheckboxField label="Label" description="Description" checked={!checkedHug} onChange={() => setCheckedHug(v => !v)} />
        <CheckboxField label="Label" description="Description" checked={indeterminateHug} indeterminate={indeterminateHug} onChange={() => setIndeterminateHug(v => !v)} />
      </div>
      <div className="checkbox-demo-label">Disabled</div>
      <div className="checkbox-demo-row">
        <CheckboxField label="Label" description="Description" checked={true} disabled={true} onChange={() => {}} />
        <CheckboxField label="Label" description="Description" checked={false} disabled={true} onChange={() => {}} />
        <CheckboxField label="Label" description="Description" checked={false} indeterminate={true} disabled={true} onChange={() => {}} />
      </div>

      <h2>Opciones de Ancho (Layout) Checkbox</h2>
      <div style={{ display: 'flex', gap: 48 }}>
        {/* Hug content */}
        <div style={{ minWidth: 0 }}>
          <div className="checkbox-demo-label">Hug Content (Default)</div>
          <div style={{ border: '1px dashed gray', padding: '1rem', width: 'fit-content', maxWidth: 300 }}>
            <CheckboxField
              label="Hug Content"
              description="El checkbox se ajusta al contenido"
              checked={checkedHug}
              onChange={setCheckedHug}
            />
          </div>
        </div>
        {/* Fill container */}
        <div style={{ flex: 1 }}>
          <div className="checkbox-demo-label">Fill Container</div>
          <div style={{ border: '1px dashed gray', padding: '1rem', width: '100%', maxWidth: 300 }}>
            <CheckboxField
              label="Fill Container"
              description="El checkbox ocupa todo el ancho"
              checked={checkedFill}
              onChange={setCheckedFill}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      <h2>Radio Field Demo</h2>
      <div className="checkbox-demo-label">Default</div>
      <div className="checkbox-demo-row">
        <RadioField
          label="Label"
          description="Description"
          checked={radioDefault === 'a'}
          name="radio-default"
          onChange={() => setRadioDefault('a')}
        />
        <RadioField
          label="Label"
          description="Description"
          checked={radioDefault === 'b'}
          name="radio-default"
          onChange={() => setRadioDefault('b')}
        />
      </div>
      <div className="checkbox-demo-label">Disabled</div>
      <div className="checkbox-demo-row">
        <RadioField
          label="Label"
          description="Description"
          checked={true}
          disabled={true}
        />
        <RadioField
          label="Label"
          description="Description"
          checked={false}
          disabled={true}
        />
      </div>

      <h2>Opciones de Ancho (Layout) Radio</h2>
      <div style={{ display: 'flex', gap: 48 }}>
        {/* Hug content */}
        <div style={{ minWidth: 0 }}>
          <div className="checkbox-demo-label">Hug Content (Default)</div>
          <div style={{ border: '1px dashed gray', padding: '1rem', width: 'fit-content', maxWidth: 300 }}>
            <RadioField
              label="Hug Content"
              description="El radio se ajusta al contenido"
              checked={radioFill === 'hug'}
              name="radio-hug"
              onChange={() => setRadioFill('hug')}
            />
          </div>
        </div>
        {/* Fill container */}
        <div style={{ flex: 1 }}>
          <div className="checkbox-demo-label">Fill Container</div>
          <div style={{ border: '1px dashed gray', padding: '1rem', width: '100%', maxWidth: 300 }}>
            <RadioField
              label="Fill Container"
              description="El radio ocupa todo el ancho"
              checked={radioFill === 'fill'}
              name="radio-hug"
              onChange={() => setRadioFill('fill')}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
