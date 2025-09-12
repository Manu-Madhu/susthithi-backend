const {
  createApplicationService,
  updateApplicationPayment,
  getAApplicationByOrderIDService,
} = require("../services/application.service.js");
const { createCofeeOrder } = require("../services/payment.service.js");
const {
  normalizePaymentStatus,
  generateReferenceId,
} = require("../utils/helperFunction.js");

const FEE_MAP = {
  cetaa: 3000,
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

async function getApplications(req, res, next) {
  try {
    res.status(200),
      json({
        success: true,
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
async function cofeeWebhookHandler(req, res, next) {
  try {
    const { event_name, data } = req.body;

    if (!event_name || !data) {
      return res.status(400).json({ error: "Invalid webhook payload" });
    }

    // Extract order_id and status
    const { order_id, order_status } = data;

    // Find application by provider order id
    const app = await getAApplicationByOrderIDService(order_id);
    if (!app) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Normalize status (you can customize the function)
    let paymentStatus = "pending";
    if (event_name === "payment-order.paid" && order_status === "success") {
      paymentStatus = "paid";
    } else if (order_status === "failed" || order_status === "failure") {
      paymentStatus = "failed";
    }

    // Update application
    app.paymentStatus = paymentStatus;
    await app.save();

    res.status(200).json({ received: true, updatedStatus: paymentStatus });
  } catch (err) {
    console.error("CoFee Webhook Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server error",
      data: null,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}

module.exports = {
  createApplication,
  getApplications,
  cofeeWebhookHandler,
};
