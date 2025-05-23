const express = require("express");
const router = express.Router();
const controller = require("../controllers/especialidadesController");

router.post("/", controller.crear);
router.get("/", controller.listar);
router.patch("/:id", controller.actualizar); // ✅ NUEVO - Actualizar especialidad
router.delete("/:id", controller.eliminar); // ✅ NUEVO - Eliminar especialidad

module.exports = router;
