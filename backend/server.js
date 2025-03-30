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

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend corriendo en http://localhost:${port}`);
});

