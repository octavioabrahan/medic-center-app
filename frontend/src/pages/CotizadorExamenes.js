import React, { useEffect, useState } from 'react';

export default function CotizadorExamenes() {
  const [examenes, setExamenes] = useState([]);
  const [tasaCambio, setTasaCambio] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionados, setSeleccionados] = useState([]);
  const [form, setForm] = useState({ nombre: '', rut: '', email: '', telefono: '' });
  const [acepta, setAcepta] = useState(false);
  const [captchaValido, setCaptchaValido] = useState(false);
  const [modalInfo, setModalInfo] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/exams`)
      .then(res => res.json())
      .then(data => setExamenes(Array.isArray(data) ? data : []));

    fetch(`${process.env.REACT_APP_API_URL}/api/tasa-cambio`)
      .then(res => res.json())
      .then(data => setTasaCambio(data.tasa));
  }, []);

  const handleCheckboxChange = (codigo) => {
    setSeleccionados(prev =>
      prev.includes(codigo)
        ? prev.filter(c => c !== codigo)
        : [...prev, codigo]
    );
  };

  const handleSubmit = async () => {
    const seleccionFinal = examenes.filter(e => seleccionados.includes(e.codigo));
    if (!form.nombre || !form.rut || !form.email || !acepta || !captchaValido || seleccionFinal.length === 0 || !tasaCambio) {
      alert('Completa todos los campos, acepta los términos, selecciona al menos un examen y espera que se cargue la tasa de cambio.');
      return;
    }

    const resumen = {
      paciente: form,
      cotizacion: seleccionFinal.map(e => ({
        codigo: e.codigo,
        nombre: e.nombre,
        tiempo_entrega: e.tiempo_entrega || null,
        precioUSD: Number(e.precio),
        precioVES: Number(e.precio) * tasaCambio
      })),
      totalUSD: seleccionFinal.reduce((sum, e) => sum + Number(e.precio), 0),
      totalVES: seleccionFinal.reduce((sum, e) => sum + Number(e.precio), 0) * tasaCambio
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/cotizaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, resumen })
      });

      if (!res.ok) throw new Error('Fallo al enviar la cotización');
      alert('Cotización enviada exitosamente ✅');
      setSeleccionados([]);
      setForm({ nombre: '', rut: '', email: '', telefono: '' });
      setAcepta(false);
      setCaptchaValido(false);
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al enviar la cotización');
    }
  };

  const filtrados = examenes.filter(e => e.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <div>
      <h2>EXÁMENES</h2>

      <input
        type="text"
        placeholder="Buscar examen..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        style={{ marginBottom: '10px', width: '100%' }}
      />

      <div>
        {filtrados.map(ex => (
          <div key={ex.codigo} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <label style={{ flex: 1 }}>
              <input
                type="checkbox"
                checked={seleccionados.includes(ex.codigo)}
                onChange={() => handleCheckboxChange(ex.codigo)}
              />
              {ex.nombre}
            </label>
            <button onClick={() => setModalInfo(ex)} style={{ marginLeft: '10px' }}>
              ℹ️
            </button>
          </div>
        ))}
      </div>

      {modalInfo && (
        <div style={{
          position: 'fixed',
          top: '20%',
          left: '30%',
          width: '40%',
          background: '#fff',
          border: '1px solid #ccc',
          padding: '20px',
          zIndex: 1000
        }}>
          <h3>{modalInfo.nombre}</h3>
          <p>{modalInfo.informacion ? modalInfo.informacion : 'Información no disponible (desactivado).'}</p>
          <button onClick={() => setModalInfo(null)}>Cerrar</button>
        </div>
      )}

      {seleccionados.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>Resumen de exámenes seleccionados</h3>
          <ul>
            {examenes
              .filter(e => seleccionados.includes(e.codigo))
              .map((e) => (
                <li key={e.codigo}>
                  {e.nombre}{' '}
                  <button
                    onClick={() =>
                      setSeleccionados(seleccionados.filter(c => c !== e.codigo))
                    }
                    style={{
                      marginLeft: '10px',
                      color: 'white',
                      background: 'red',
                      border: 'none',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                    }}
                    title="Eliminar examen"
                  >
                    ✕
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <h3>Datos del Paciente</h3>
        <input placeholder="Nombre completo" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /><br />
        <input placeholder="RUT o ID" value={form.rut} onChange={e => setForm({ ...form, rut: e.target.value })} /><br />
        <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /><br />
        <input placeholder="Teléfono (opcional)" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} /><br />

        <label>
          <input type="checkbox" checked={acepta} onChange={e => setAcepta(e.target.checked)} />
          Acepto que mis datos serán almacenados con fines de contacto.
        </label>

        <br />
        <button onClick={() => setCaptchaValido(true)}>Simular CAPTCHA ✔️</button>

        <br /><br />
        <button onClick={handleSubmit}>Enviar Cotización</button>
      </div>
    </div>
  );
}

