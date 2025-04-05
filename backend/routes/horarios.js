const express = require("express");
const router = express.Router();
const controller = require("../controllers/horariosController");

router.post("/", controller.crear);

module.exports = router;
