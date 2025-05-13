import React, { useState } from "react";
import CheckboxField from "./CheckboxField";
import RadioField from "./RadioField";
import SwitchField from "./SwitchField";
import InputField from "./InputField";
import SelectField from "./SelectField";
import SearchField from "./SearchField";
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

  // Switch states
  const [switchDefault, setSwitchDefault] = useState(false);
  const [switchFill, setSwitchFill] = useState(false);

  // InputField states
  const [inputDefault, setInputDefault] = useState('Value');
  const [inputPlaceholder, setInputPlaceholder] = useState('');
  const [inputFill, setInputFill] = useState('Value');
  const [inputPlaceholderFill, setInputPlaceholderFill] = useState('');
  const [inputError, setInputError] = useState('Value');
  const [inputErrorPlaceholder, setInputErrorPlaceholder] = useState('');

  // SelectField states
  const selectOptions = [
    { label: 'Value', value: 'value' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
  ];
  const [selectDefault, setSelectDefault] = useState('value');
  const [selectPlaceholder, setSelectPlaceholder] = useState('');
  const [selectFill, setSelectFill] = useState('value');
  const [selectPlaceholderFill, setSelectPlaceholderFill] = useState('');
  const [selectError, setSelectError] = useState('value');
  const [selectErrorPlaceholder, setSelectErrorPlaceholder] = useState('');

  // SearchField states
  const [searchValue, setSearchValue] = useState("");
  const [searchValueDisabled, setSearchValueDisabled] = useState("");

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

      <h2>Switch Field Demo</h2>
      <div className="checkbox-demo-label">Default</div>
      <div className="checkbox-demo-row">
        <SwitchField
          label="Label"
          description="Description"
          checked={switchDefault}
          onChange={setSwitchDefault}
        />
        <SwitchField
          label="Label"
          description="Description"
          checked={!switchDefault}
          onChange={() => setSwitchDefault(v => !v)}
        />
      </div>
      <div className="checkbox-demo-label">Disabled</div>
      <div className="checkbox-demo-row">
        <SwitchField
          label="Label"
          description="Description"
          checked={true}
          disabled={true}
        />
        <SwitchField
          label="Label"
          description="Description"
          checked={false}
          disabled={true}
        />
      </div>

      <h2>Opciones de Ancho (Layout) Switch</h2>
      <div style={{ display: 'flex', gap: 48 }}>
        {/* Hug content */}
        <div style={{ minWidth: 0 }}>
          <div className="checkbox-demo-label">Hug Content (Default)</div>
          <div style={{ border: '1px dashed gray', padding: '1rem', width: 'fit-content', maxWidth: 300 }}>
            <SwitchField
              label="Hug Content"
              description="El switch se ajusta al contenido"
              checked={switchDefault}
              onChange={setSwitchDefault}
            />
          </div>
        </div>
        {/* Fill container */}
        <div style={{ flex: 1 }}>
          <div className="checkbox-demo-label">Fill Container</div>
          <div style={{ border: '1px dashed gray', padding: '1rem', width: '100%', maxWidth: 300 }}>
            <SwitchField
              label="Fill Container"
              description="El switch ocupa todo el ancho"
              checked={switchFill}
              onChange={setSwitchFill}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      <h2>Input Field Demo</h2>
      <div className="checkbox-demo-label">Default</div>
      <div className="checkbox-demo-row">
        <InputField
          label="Label"
          value={inputDefault}
          onChange={setInputDefault}
        />
        <InputField
          label="Label"
          value={inputPlaceholder}
          placeholder="Value"
          onChange={setInputPlaceholder}
        />
      </div>
      <div className="checkbox-demo-label">Disabled</div>
      <div className="checkbox-demo-row">
        <InputField
          label="Label"
          value={inputDefault}
          disabled={true}
        />
        <InputField
          label="Label"
          value={inputPlaceholder}
          placeholder="Value"
          disabled={true}
        />
      </div>
      <div className="checkbox-demo-label">Error</div>
      <div className="checkbox-demo-row">
        <InputField
          label="Label"
          value={inputError}
          error={true}
          onChange={setInputError}
        />
        <InputField
          label="Label"
          value={inputErrorPlaceholder}
          placeholder="Value"
          error={true}
          onChange={setInputErrorPlaceholder}
        />
      </div>
      <h2>Opciones de Ancho (Layout) Input</h2>
      <div style={{ display: 'flex', gap: 48 }}>
        {/* Hug content */}
        <div style={{ minWidth: 0 }}>
          <div className="checkbox-demo-label">Hug Content (Default)</div>
          <div style={{ border: '1px dashed gray', padding: '1rem', width: 'fit-content', maxWidth: 300 }}>
            <InputField
              label="Hug Content"
              value={inputDefault}
              onChange={setInputDefault}
            />
          </div>
        </div>
        {/* Fill container */}
        <div style={{ flex: 1 }}>
          <div className="checkbox-demo-label">Fill Container</div>
          <div style={{ border: '1px dashed gray', padding: '1rem', width: '100%', maxWidth: 300 }}>
            <InputField
              label="Fill Container"
              value={inputFill}
              onChange={setInputFill}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      <h2>Select Field Demo</h2>
      <div className="checkbox-demo-label">Default</div>
      <div className="checkbox-demo-row">
        <SelectField
          label="Label"
          value={selectDefault}
          options={selectOptions}
          onChange={setSelectDefault}
        />
        <SelectField
          label="Label"
          value={selectPlaceholder}
          placeholder="Value"
          options={selectOptions}
          onChange={setSelectPlaceholder}
        />
      </div>
      <div className="checkbox-demo-label">Disabled</div>
      <div className="checkbox-demo-row">
        <SelectField
          label="Label"
          value={selectDefault}
          options={selectOptions}
          disabled={true}
        />
        <SelectField
          label="Label"
          value={selectPlaceholder}
          placeholder="Value"
          options={selectOptions}
          disabled={true}
        />
      </div>
      <div className="checkbox-demo-label">Error</div>
      <div className="checkbox-demo-row">
        <SelectField
          label="Label"
          value={selectError}
          options={selectOptions}
          error={true}
          onChange={setSelectError}
        />
        <SelectField
          label="Label"
          value={selectErrorPlaceholder}
          placeholder="Value"
          options={selectOptions}
          error={true}
          onChange={setSelectErrorPlaceholder}
        />
      </div>
      <h2>Opciones de Ancho (Layout) Select</h2>
      <div style={{ display: 'flex', gap: 48 }}>
        {/* Hug content */}
        <div style={{ minWidth: 0 }}>
          <div className="checkbox-demo-label">Hug Content (Default)</div>
          <div style={{ border: '1px dashed gray', padding: '1rem', width: 'fit-content', maxWidth: 300 }}>
            <SelectField
              label="Hug Content"
              value={selectDefault}
              options={selectOptions}
              onChange={setSelectDefault}
            />
          </div>
        </div>
        {/* Fill container */}
        <div style={{ flex: 1 }}>
          <div className="checkbox-demo-label">Fill Container</div>
          <div style={{ border: '1px dashed gray', padding: '1rem', width: '100%', maxWidth: 300 }}>
            <SelectField
              label="Fill Container"
              value={selectFill}
              options={selectOptions}
              onChange={setSelectFill}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      <h2>Search Field Demo</h2>
      <div className="checkbox-demo-label">Default</div>
      <div className="checkbox-demo-row">
        <SearchField value={searchValue} onChange={setSearchValue} placeholder="Buscar..." onClear={() => setSearchValue("")} />
        <SearchField value="" onChange={() => {}} placeholder="Placeholder" />
      </div>
      <div className="checkbox-demo-label">Disabled</div>
      <div className="checkbox-demo-row">
        <SearchField value={searchValueDisabled} onChange={setSearchValueDisabled} disabled placeholder="Buscar..." />
        <SearchField value="" onChange={() => {}} disabled placeholder="Placeholder" />
      </div>
      <h2>Opciones de Ancho (Layout) Search</h2>
      <div style={{ display: 'flex', gap: 48 }}>
        {/* Hug content */}
        <div style={{ minWidth: 0 }}>
          <div className="checkbox-demo-label">Hug Content (Default)</div>
          <div style={{ border: '1px dashed gray', padding: '1rem', width: 'fit-content', maxWidth: 300 }}>
            <SearchField value={searchValue} onChange={setSearchValue} placeholder="Buscar..." />
          </div>
        </div>
        {/* Fill container */}
        <div style={{ flex: 1 }}>
          <div className="checkbox-demo-label">Fill Container</div>
          <div style={{ border: '1px dashed gray', padding: '1rem', width: '100%', maxWidth: 300 }}>
            <SearchField value={searchValue} onChange={setSearchValue} placeholder="Buscar..." style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
