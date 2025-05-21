import React from 'react';
import CheckboxField from '../../../components/Inputs/CheckboxField';

/**
 * A wrapper around CheckboxField that ensures it takes up 100% width
 */
const AgendamientoCheckbox = (props) => {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ width: '100%' }}>
        <CheckboxField {...props} />
      </div>
    </div>
  );
};

export default AgendamientoCheckbox;
