const express = require("express");
const router = express.Router();
const controller = require("../controllers/tipoAtencionController");

router.post("/", controller.crear);

module.exports = router;
