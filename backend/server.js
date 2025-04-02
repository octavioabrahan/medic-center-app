const medicosRoutes = require('./routes/medicos');
const especialidadesRoutes = require('./routes/especialidades');
const horariosRoutes = require('./routes/horarios');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

const examRoutes = require('./routes/exams');
const appointmentRoutes = require('./routes/appointments');
const exchangeRateRoutes = require('./routes/exchangeRate');
const quotesRoutes = require('./routes/quotes');

app.use(cors());
app.use(express.json());

app.use('/api/exams', examRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/tasa-cambio', exchangeRateRoutes);
app.use('/api/cotizaciones', quotesRoutes);
app.use('/api/medicos', medicosRoutes);
app.use('/api/especialidades', especialidadesRoutes);
app.use('/api/horarios', horariosRoutes);

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend corriendo en http://localhost:${port}`);
});

