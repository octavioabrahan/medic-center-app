const express = require("express");
const router = express.Router();
const controller = require("../controllers/especialidadesController");

router.post("/", controller.crear);
router.get("/", controller.listar); // ✅ NUEVO

module.exports = router;
