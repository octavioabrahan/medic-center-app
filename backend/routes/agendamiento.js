const express = require("express");
const router = express.Router();
const controller = require("../controllers/agendamientoController");

router.post("/", controller.crear);
router.get("/", controller.listar); // Nuevo
router.put("/:id", controller.actualizarEstado); // Nuevo

module.exports = router;
