const express = require('express');
const router = express.Router();
const axios = require('axios');

// Obtener tasa de cambio USD → VES desde pyDolarVenezuela (BCV real = Banco de Venezuela)
router.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://pydolarve.org/api/v1/dollar?page=bcv');
    const tasa = response.data.monitors?.bdv?.price;

    if (!tasa) {
      console.warn('[TASA] No se encontró el valor de BDV en la respuesta');
      return res.status(502).json({ error: 'No se pudo obtener la tasa del Banco de Venezuela (BDV)' });
    }

    res.json({ tasa });
  } catch (err) {
    console.error('Error al obtener tasa de cambio:', err.message);
    res.status(500).json({ error: 'Error al obtener tasa de cambio', detalle: err.message });
  }
});

module.exports = router;

