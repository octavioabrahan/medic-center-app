const express = require("express");
const router = express.Router();
const controller = require("../controllers/excepcionesController");

router.get("/", controller.listarTodos);
router.post("/", controller.crear);
router.get("/profesional/:id", controller.listarPorProfesional);

module.exports = router;
