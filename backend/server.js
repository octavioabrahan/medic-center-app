const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

const examRoutes = require('./routes/exams');
const appointmentRoutes = require('./routes/appointments');
const exchangeRateRoutes = require('./routes/exchangeRate');
const quotesRoutes = require('./routes/quotes');
const agendamientoRoutes = require('./routes/agendamiento');
const profesionalesRoutes = require("./routes/profesionales");
const especialidadesRoutes = require("./routes/especialidades");
const tipoAtencionRoutes = require("./routes/tipoAtencion");
const horariosRoutes = require("./routes/horarios");
const rolesRoutes = require("./routes/roles");
const personaRolesRoutes = require("./routes/personaRoles");

app.use(cors());
app.use(express.json());

app.use('/api/exams', examRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/tasa-cambio', exchangeRateRoutes);
app.use('/api/cotizaciones', quotesRoutes);
app.use('/api/agendamientos', agendamientoRoutes);
app.use("/api/profesionales", profesionalesRoutes);
app.use("/api/especialidades", especialidadesRoutes);
app.use("/api/tipo-atencion", tipoAtencionRoutes);
app.use("/api/horarios", horariosRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/persona-roles", personaRolesRoutes);

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend corriendo en http://localhost:${port}`);
});

