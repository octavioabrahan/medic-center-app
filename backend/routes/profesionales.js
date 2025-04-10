const express = require("express");
const router = express.Router();
const controller = require("../controllers/profesionalesController");

router.post("/", controller.crear);
router.get("/", controller.listar); // ✅ NUEVO
router.post("/asignar-categorias", ProfesionalesController.asignarCategorias);
router.post("/asignar-servicios", ProfesionalesController.asignarServicios);
router.get("/relaciones/:id", ProfesionalesController.obtenerCategoriasYServicios);

module.exports = router;
