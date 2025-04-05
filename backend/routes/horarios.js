const express = require("express");
const router = express.Router();
const controller = require("../controllers/horariosController");

router.post("/", controller.crear);
router.get("/profesional/:id", controller.listarPorProfesional); // ✅ NUEVO

module.exports = router;
