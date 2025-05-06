const express = require("express");
const router = express.Router();
const controller = require("../controllers/roleScreenPermissionsController");
const { authenticateJWT, authorizeRoles } = require("../middleware/auth");

// Rutas para gestionar permisos de pantallas por rol
router.post("/", authenticateJWT, authorizeRoles(['superadmin', 'admin']), controller.asignarPantallas);
router.get("/rol/:id_rol", authenticateJWT, authorizeRoles(['superadmin', 'admin']), controller.obtenerPorRol);
router.get("/usuario", authenticateJWT, controller.pantallasPorUsuario);
router.post("/rol/:id_rol/todas", authenticateJWT, authorizeRoles(['superadmin']), controller.asignarTodasPantallasARol);

module.exports = router;