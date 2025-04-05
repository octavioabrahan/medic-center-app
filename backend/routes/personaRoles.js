const express = require("express");
const router = express.Router();
const controller = require("../controllers/personaRolesController");

router.post("/", controller.asignar);
router.get("/:cedula", controller.obtener);

module.exports = router;
