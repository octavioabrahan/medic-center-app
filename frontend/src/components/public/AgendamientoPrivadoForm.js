import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CalendarioFechasDisponibles from './CalendarioFechasDisponibles';

const AgendamientoPrivadoForm = () => {
  const [step, setStep] = useState(1);

  const [sinCedula, setSinCedula] = useState(false);
  const [datosRepresentante, setDatosRepresentante] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    numeroHijo: '',
    sexo: '',
    telefono: '',
    email: '',
  });
  const [datosPaciente, setDatosPaciente] = useState({
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    sexo: '',
  });
  const [tieneSeguro, setTieneSeguro] = useState(false);

  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  const [especialidades, setEspecialidades] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState('');
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

  useEffect(() => {
    if (step === 2) {
      axios.get('/api/categorias')
        .then(res => setCategorias(res.data))
        .catch(err => console.error('Error cargando categorías:', err));
    }
  }, [step]);

  useEffect(() => {
    if (categoriaSeleccionada) {
      axios.get('/api/profesionales')
        .then(res => {
          const filtrados = res.data.filter(p =>
            p.categorias?.includes(categoriaSeleccionada.nombre_categoria)
          );
          setProfesionales(filtrados);
        })
        .catch(err => console.error('Error cargando profesionales:', err));
    }
  }, [categoriaSeleccionada]);

  const handleSubmitPaso1 = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleCategoriaClick = (cat) => {
    setCategoriaSeleccionada(cat);
    setEspecialidadSeleccionada('');
    setProfesionalSeleccionado('');
  };

  return (
    <div>
      {step === 1 && (
        <form onSubmit={handleSubmitPaso1}>
          <h2>Agendamiento Particular</h2>

          <div>
            <label>Cédula:</label>
            <input
              type="text"
              disabled={sinCedula}
              value={datosRepresentante.cedula}
              onChange={e =>
                setDatosRepresentante({ ...datosRepresentante, cedula: e.target.value })
              }
            />
            <label>
              <input
                type="checkbox"
                checked={sinCedula}
                onChange={() => setSinCedula(!sinCedula)}
              />
              La persona que se atenderá no tiene cédula
            </label>
          </div>

          {sinCedula && (
            <>
              <fieldset>
                <legend>Datos del representante legal</legend>
                <input placeholder="¿Qué número de hijo(a) es este menor?"
                  value={datosRepresentante.numeroHijo}
                  onChange={e =>
                    setDatosRepresentante({ ...datosRepresentante, numeroHijo: e.target.value })
                  } />
                <input placeholder="Nombre"
                  value={datosRepresentante.nombre}
                  onChange={e =>
                    setDatosRepresentante({ ...datosRepresentante, nombre: e.target.value })
                  } />
                <input placeholder="Apellidos"
                  value={datosRepresentante.apellido}
                  onChange={e =>
                    setDatosRepresentante({ ...datosRepresentante, apellido: e.target.value })
                  } />
                <select
                  value={datosRepresentante.sexo}
                  onChange={e =>
                    setDatosRepresentante({ ...datosRepresentante, sexo: e.target.value })
                  }>
                  <option value="">Sexo</option>
                  <option value="F">Femenino</option>
                  <option value="M">Masculino</option>
                </select>
                <input placeholder="Teléfono"
                  value={datosRepresentante.telefono}
                  onChange={e =>
                    setDatosRepresentante({ ...datosRepresentante, telefono: e.target.value })
                  } />
                <input placeholder="Correo electrónico"
                  value={datosRepresentante.email}
                  onChange={e =>
                    setDatosRepresentante({ ...datosRepresentante, email: e.target.value })
                  } />
              </fieldset>

              <fieldset>
                <legend>Datos del paciente</legend>
                <input placeholder="Nombre"
                  value={datosPaciente.nombre}
                  onChange={e =>
                    setDatosPaciente({ ...datosPaciente, nombre: e.target.value })
                  } />
                <input placeholder="Apellidos"
                  value={datosPaciente.apellido}
                  onChange={e =>
                    setDatosPaciente({ ...datosPaciente, apellido: e.target.value })
                  } />
                <input type="date"
                  value={datosPaciente.fechaNacimiento}
                  onChange={e =>
                    setDatosPaciente({ ...datosPaciente, fechaNacimiento: e.target.value })
                  } />
                <select
                  value={datosPaciente.sexo}
                  onChange={e =>
                    setDatosPaciente({ ...datosPaciente, sexo: e.target.value })
                  }>
                  <option value="">Sexo</option>
                  <option value="F">Femenino</option>
                  <option value="M">Masculino</option>
                </select>
              </fieldset>
            </>
          )}

          <div>
            <label>
              ¿Tiene seguro médico?
              <input
                type="checkbox"
                checked={tieneSeguro}
                onChange={() => setTieneSeguro(!tieneSeguro)}
              />
            </label>
          </div>

          <button type="submit">Continuar</button>
        </form>
      )}

      {step === 2 && (
        <div>
          <h2>Selecciona la especialidad, el médico y el día.</h2>

          <div>
            <h4>Selecciona la categoría de atención</h4>
            {categorias.map(cat => (
              <button
                key={cat.id_categoria}
                onClick={() => handleCategoriaClick(cat)}
                style={{
                  marginRight: '10px',
                  background: categoriaSeleccionada?.id_categoria === cat.id_categoria ? '#ccc' : '#fff'
                }}
              >
                {cat.nombre_categoria}
              </button>
            ))}
          </div>

          {categoriaSeleccionada && (
            <div>
              <label>Especialidad:</label>
              <select
                value={especialidadSeleccionada}
                onChange={e => setEspecialidadSeleccionada(e.target.value)}
              >
                <option value="">Selecciona una opción</option>
                {[...new Set(profesionales.map(p => p.nombre_especialidad))]
                  .filter(Boolean)
                  .map((esp, i) => (
                    <option key={i} value={esp}>{esp}</option>
                  ))}
              </select>

              <label>Profesional:</label>
              <select
                value={profesionalSeleccionado}
                onChange={e => setProfesionalSeleccionado(e.target.value)}
              >
                <option value="">Selecciona al profesional</option>
                {profesionales
                  .filter(p => !especialidadSeleccionada || p.nombre_especialidad === especialidadSeleccionada)
                  .map(p => (
                    <option key={p.profesional_id} value={p.profesional_id}>
                      {p.nombre} {p.apellido}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {profesionalSeleccionado && (
            <div>
              <CalendarioFechasDisponibles
                profesionalId={profesionalSeleccionado}
                onFechaSeleccionada={setFechaSeleccionada}
              />

              {fechaSeleccionada && (
                <div style={{ marginTop: '20px' }}>
                  <strong>Fecha seleccionada:</strong> {fechaSeleccionada.toLocaleDateString()}
                  <br />
                  <strong>Hora de inicio:</strong> Desde las 08:30 AM
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgendamientoPrivadoForm;
