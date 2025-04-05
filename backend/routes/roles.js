const express = require("express");
const router = express.Router();
const controller = require("../controllers/rolesController");

router.post("/", controller.crear);
router.get("/", controller.listar);

module.exports = router;
