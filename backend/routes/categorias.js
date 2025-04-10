const express = require("express");
const router = express.Router();
const CategoriasController = require("../controllers/categoriasController");

router.get("/", CategoriasController.listar);

module.exports = router;
