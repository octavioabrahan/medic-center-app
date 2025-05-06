const express = require("express");
const router = express.Router();
const controller = require("../controllers/adminUsersController");
const { authenticateJWT, authorizeRoles } = require("../middleware/auth");

// Rutas públicas
router.post("/login", controller.login);

// Ruta específica para registro - coincide con la nueva función del frontend
router.post("/registro", authenticateJWT, authorizeRoles(['superadmin', 'admin']), controller.registro);

// Rutas protegidas
router.post("/", authenticateJWT, authorizeRoles(['superadmin', 'admin']), controller.registro);
router.get("/perfil", authenticateJWT, controller.perfil);
router.get("/", authenticateJWT, authorizeRoles(['superadmin', 'admin']), controller.listar);
router.put("/:id", authenticateJWT, authorizeRoles(['superadmin', 'admin']), controller.actualizar);
router.post("/:id/cambiar-password", authenticateJWT, controller.cambiarPassword);
router.delete("/:id", authenticateJWT, authorizeRoles(['superadmin']), controller.eliminar);

module.exports = router;