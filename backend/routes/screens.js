const express = require("express");
const router = express.Router();
const controller = require("../controllers/screensController");
const { authenticateJWT, authorizeRoles } = require("../middleware/auth");

// Rutas para gestionar pantallas (solo admin y superadmin pueden modificarlas)
router.get("/", authenticateJWT, controller.listar);
router.post("/", authenticateJWT, authorizeRoles(['superadmin', 'admin']), controller.crear);
router.put("/:id_screen", authenticateJWT, authorizeRoles(['superadmin', 'admin']), controller.actualizar);
router.delete("/:id_screen", authenticateJWT, authorizeRoles(['superadmin', 'admin']), controller.eliminar);

module.exports = router;