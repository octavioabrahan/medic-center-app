const express = require("express");
const router = express.Router();
const controller = require("../controllers/empresasController");

router.post("/", controller.crear);
router.get("/", controller.listar);

module.exports = router;