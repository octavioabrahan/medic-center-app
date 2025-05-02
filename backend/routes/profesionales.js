const express = require("express");
const router = express.Router();
const controller = require("../controllers/profesionalesController");

router.post("/", controller.crear);
router.get("/", controller.listar); // ✅ NUEVO
router.post("/asignar-categorias", controller.asignarCategorias);
router.post("/asignar-servicios", controller.asignarServicios);
router.get("/relaciones/:id", controller.obtenerCategoriasYServicios);
router.put("/estado/:id", controller.cambiarEstado); // Ruta para cambiar el estado activo/inactivo

module.exports = router;
