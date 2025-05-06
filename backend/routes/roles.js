const express = require("express");
const router = express.Router();
const controller = require("../controllers/rolesController");
const { authenticateJWT, authorizeRoles } = require("../middleware/auth");

// Rutas básicas para roles
router.post("/", controller.crear);
router.get("/", controller.listar);
router.put("/:id_rol", controller.actualizar);
router.delete("/:id_rol", controller.eliminar);

module.exports = router;
