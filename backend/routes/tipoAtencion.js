const express = require("express");
const router = express.Router();
const controller = require("../controllers/tipoAtencionController");

router.post("/", controller.crear);
router.get("/", controller.listar);
router.get("/:id", controller.obtenerPorId);

module.exports = router;