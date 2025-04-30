const express = require("express");
const router = express.Router();
const controller = require("../controllers/horariosController");

router.post("/", controller.crear);
router.get("/", controller.listarTodos);  // Nuevo endpoint para listar todos los horarios
router.get("/profesional/:id", controller.listarPorProfesional);
router.get("/fechas/:id", controller.listarFechasPorProfesional);

module.exports = router;
