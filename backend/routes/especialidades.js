const express = require("express");
const router = express.Router();
const EspecialidadesController = require("../controllers/especialidadesController");

router.post("/", EspecialidadesController.crear);
router.get("/", EspecialidadesController.listar);
router.patch("/:id", EspecialidadesController.actualizar); // ✅ NUEVO - Actualizar especialidad
router.delete("/:id", EspecialidadesController.eliminar); // ✅ NUEVO - Eliminar especialidad

module.exports = router;
