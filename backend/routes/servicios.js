const express = require("express");
const router = express.Router();
const ServiciosController = require("../controllers/serviciosController");

// Obtener todos los servicios
router.get("/", ServiciosController.listar);

// Obtener un servicio específico
router.get("/:id", ServiciosController.obtenerPorId);

// Crear un nuevo servicio
router.post("/", ServiciosController.crear);

// Actualizar un servicio existente
router.put("/:id", ServiciosController.actualizar);

// Archivar un servicio
router.put("/:id/archivar", ServiciosController.archivar);

// Desarchivar un servicio
router.put("/:id/desarchivar", ServiciosController.desarchivar);

module.exports = router;
