const express = require("express");
const router = express.Router();
const controller = require("../controllers/profesionalRolesController");

router.post("/", controller.asignar);

module.exports = router;
