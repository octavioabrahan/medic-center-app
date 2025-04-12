const express = require("express");
const router = express.Router();
const controller = require("../controllers/agendamientoController");

router.post("/", controller.crear);
router.get("/", controller.listar);
router.put("/:id", controller.actualizarEstado);
router.get("/:id/historial", controller.obtenerHistorial);

module.exports = router;
