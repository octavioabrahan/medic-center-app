import React, { useState } from "react";
import CheckboxField from "./CheckboxField";
import './CheckboxFieldDemo.css';

export default function InputDemo() {
  const [checked, setChecked] = useState(true);
  const [unchecked, setUnchecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  // Hug content
  const [checkedHug, setCheckedHug] = useState(false);
  const [indeterminateHug, setIndeterminateHug] = useState(false);
  // Fill container
  const [checkedFill, setCheckedFill] = useState(false);
  const [indeterminateFill, setIndeterminateFill] = useState(false);

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

      <h2>Opciones de Ancho (Layout)</h2>
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
    </section>
  );
}
