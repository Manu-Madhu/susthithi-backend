const express = require("express");
const authCtrl = require("../controllers/auth.controller.js");
const router = express.Router()

router.post("/login", authCtrl.Login);
router.post("/refresh-token", authCtrl.regenerateTokens);

module.exports = router;