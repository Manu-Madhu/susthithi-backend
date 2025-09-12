const Application = require("../models/Application.model.js");
const crypto = require("crypto");

const {
  createApplicationService,
  updateApplicationPayment,
  getAllApplicationService,
} = require("../services/application.service.js");
const { createCofeeOrder } = require("../services/payment.service.js");
const {
  normalizePaymentStatus,
  generateReferenceId,
} = require("../utils/helperFunction.js");

const FEE_MAP = {
  cetaa: 1,
  // cetaa: 3000,
  engineers_club: 3000,
  delegate: 5000,
};

async function createApplication(req, res) {
  try {
    const data = req.body;
    const fee = FEE_MAP[data.category];
    if (!fee) {
      return res.status(400).json({ error: "Invalid category fee" });
    }

    const referenceId = generateReferenceId(data);

    // Save initial application
    const app = await createApplicationService(data, fee);

    if (!app || !app._id) {
      return res.status(500).json({
        success: false,
        message: "Failed to save initial application",
      });
    }

    // Create CoFee order
    const cofeeOrder = await createCofeeOrder({
      amount: fee,
      currency: "INR",
      customer: {
        name: data.fullName,
        email: data.email,
        mobile: data.phone,
        referenceId,
      },
      merchantOrderId: `order_${app._id}`,
      redirectUrl: `${process.env.BASE_URL}/payment/success/`,
    });

    if (!cofeeOrder || !cofeeOrder.orderId) {
      return res.status(502).json({
        success: false,
        message: "Failed to create payment order",
      });
    }

    // Update DB with payment details
    const updatedApp = await updateApplicationPayment(app._id, {
      paymentLink: cofeeOrder.paymentLink,
      orderId: cofeeOrder.orderId,
      orderStatus: normalizePaymentStatus(cofeeOrder.orderStatus),
    });

    console.log(cofeeOrder);

    res.status(200).json({
      success: true,
      message: "Application saved with status processing",
      data: {
        applicationId: updatedApp._id,
        fee,
        currency: updatedApp.currency,
        paymentProvider: "cofee",
        paymentLink: cofeeOrder.paymentLink,
        orderId: cofeeOrder.orderId,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
}

async function getAllApplications(req, res, next) {
  try {
    const data = await getAllApplicationService();
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Internal Server error",
      data: null,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}

// Webhook handler (CoFee sends POST callbacks on success/failure)
async function cofeeWebhookHandler(req, res) {
  try {
    const rawBody = JSON.stringify(req.body);
    const signature = req.headers["x-cofee-signature"];
    const verificationKey = process.env.COFE_WEBHOOK_SECRET;

    // Recreate signature
    const expectedSignature = crypto
      .createHmac("sha256", verificationKey)
      .update(rawBody)
      .digest("base64");

    if (signature !== expectedSignature) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    console.log("hi i am here from webhook", rawBody);

    // Safe to trust the request now
    const { event_name, data } = req.body;
    const { order_id, order_status } = data;

    const app = await Application.findOne({ providerOrderId: order_id });
    if (!app) return res.status(404).json({ error: "Application not found" });

    app.paymentStatus =
      event_name === "payment-order.paid" && order_status === "success"
        ? "paid"
        : "failed";

    await app.save();

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  createApplication,
  getAllApplications,
  cofeeWebhookHandler,
};
