import React, { useState } from 'react';

export default function AgendarHora() {
  const [form, setForm] = useState({ name: '', doctor: '', date: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      alert('Hora agendada con éxito');
      setForm({ name: '', doctor: '', date: '' });
    } catch (err) {
      console.error('Error al agendar:', err);
      alert('Error al agendar hora');
    }
  };

  return (
    <div>
      <h2>Agendar Hora</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="Tu nombre"
        />
        <input
          value={form.doctor}
          onChange={e => setForm({ ...form, doctor: e.target.value })}
          placeholder="Nombre del doctor"
        />
        <input
          type="date"
          value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value })}
        />
        <button type="submit">Agendar</button>
      </form>
    </div>
  );
}

