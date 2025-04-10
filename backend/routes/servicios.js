const express = require("express");
const router = express.Router();
const ServiciosController = require("../controllers/serviciosController");

router.get("/", ServiciosController.listar);

module.exports = router;
