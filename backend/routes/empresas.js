const express = require("express");
const router = express.Router();
const controller = require("../controllers/empresasController");

router.post("/", controller.crear);
router.get("/", controller.listar);
router.put("/", controller.actualizar);
router.delete("/:id", controller.desactivar);
router.patch("/:id/activar", controller.activar);

module.exports = router;