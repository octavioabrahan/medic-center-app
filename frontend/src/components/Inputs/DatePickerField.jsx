import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function DatePickerField({ value, onChange, ...props }) {
  return (
    <ReactDatePicker
      selected={value ? new Date(value) : null}
      onChange={date => onChange(date ? date.toISOString().split('T')[0] : '')}
      dateFormat="yyyy-MM-dd"
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
      placeholderText="Selecciona la fecha"
      {...props}
    />
  );
}
