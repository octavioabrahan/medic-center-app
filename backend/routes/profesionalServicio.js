const express = require("express");
const router = express.Router();
const ProfesionalServicioController = require("../controllers/profesionalServicioController");

router.get("/", ProfesionalServicioController.listar);

module.exports = router;