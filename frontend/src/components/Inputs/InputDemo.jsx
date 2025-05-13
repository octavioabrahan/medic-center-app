import React, { useState } from "react";
import CheckboxField from "./CheckboxField";
import './CheckboxFieldDemo.css';

export default function InputDemo() {
  const [checked, setChecked] = useState(true);
  const [unchecked, setUnchecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);

  return (
    <section className="checkbox-demo-section">
      <h2>Checkbox Field Demo</h2>
      <div className="checkbox-demo-label">Default</div>
      <div className="checkbox-demo-row">
        <CheckboxField label="Label" description="Description" checked={true} onChange={() => {}} />
        <CheckboxField label="Label" description="Description" checked={false} onChange={() => {}} />
        <CheckboxField label="Label" description="Description" checked={false} indeterminate={true} onChange={() => {}} />
      </div>
      <div className="checkbox-demo-label">Disabled</div>
      <div className="checkbox-demo-row">
        <CheckboxField label="Label" description="Description" checked={true} disabled={true} onChange={() => {}} />
        <CheckboxField label="Label" description="Description" checked={false} disabled={true} onChange={() => {}} />
        <CheckboxField label="Label" description="Description" checked={false} indeterminate={true} disabled={true} onChange={() => {}} />
      </div>
    </section>
  );
}
