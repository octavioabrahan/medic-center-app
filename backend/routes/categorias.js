const express = require("express");
const router = express.Router();
const CategoriasController = require("../controllers/categoriasController");

router.get("/", CategoriasController.listar);
router.get("/:id", CategoriasController.obtenerPorId);

module.exports = router;