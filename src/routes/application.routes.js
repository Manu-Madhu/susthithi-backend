const express = require("express");
const router = express.Router();
const controller = require("../controllers/application.controller.js");

// Create application + return payment client secret
router.post("/applications",  controller.createApplication);

// fetch
// router.get("/applications", controller.getApplications);
// router.get("/applications/:id", controller.getApplicationById);

// webhook endpoint (stripe)
router.post("/webhooks/cofee", controller.cofeeWebhookHandler);

module.exports = router;
