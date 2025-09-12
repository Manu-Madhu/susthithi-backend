const Application = require("../models/Application.model.js");
const { createCofeeOrder } = require("../services/payment.service.js");

const FEE_MAP = {
  cetaa: 3000,
  engineers_club: 3000,
  delegate: 5000,
};

async function createApplication(req, res, next) {
  try {
    const data = req.body;
    const fee = FEE_MAP[data.category];
    if (!fee) return res.status(400).json({ error: "Invalid category fee" });

    // Save initial application with pending payment
    const app = new Application({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      category: data.category,
      batch: data.batch,
      department: data.department,
      membershipId: data.membershipId,
      organization: data.organization,
      feeAmount: fee,
      currency: "INR",
      paymentStatus: "processing",
      paymentProvider: "cofee",
    });

    await app.save();

    // Create CoFee order
    const cofeeOrder = await createCofeeOrder({
      amount: fee,
      currency: "INR",
      customer: {
        name: data.fullName,
        email: data.email,
        mobile: data.phone,
      },
      merchantOrderId: `order_${app._id}`,
      redirectUrl: `${process.env.BASE_URL}/payment/success`,
    });

    // Update DB with CoFee order details
    app.paymentLink = cofeeOrder.paymentLink;
    app.providerOrderId = cofeeOrder.orderId;
    app.paymentStatus = normalizePaymentStatus(cofeeOrder.orderStatus);
    await app.save();

    res.json({
      applicationId: app._id,
      fee,
      currency: app.currency,
      paymentProvider: "cofee",
      paymentLink: cofeeOrder.paymentLink,
      orderId: cofeeOrder.orderId,
    });
  } catch (err) {
    next(err);
  }
}

// Normalize provider status into our DB format
function normalizePaymentStatus(status) {
  switch (status) {
    case "success":
      return "paid";
    case "failed":
      return "failed";
    case "processing":
    default:
      return "processing";
  }
}

// Webhook handler (CoFee sends POST callbacks on success/failure)
async function cofeeWebhookHandler(req, res, next) {
  try {
    const { order_id, order_status } = req.body;

    const app = await Application.findOne({ providerOrderId: order_id });
    if (!app) return res.status(404).json({ error: "Application not found" });

    app.paymentStatus = normalizePaymentStatus(order_status);
    await app.save();

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createApplication,
  cofeeWebhookHandler,
};
