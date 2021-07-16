const express = require("express");

const getTrust = require("../controller/getTrust.js");

const router = express.Router();

router.get("/getTrust", getTrust.get);

module.exports = router;
