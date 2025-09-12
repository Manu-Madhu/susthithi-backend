const Application = require("../models/Application.model.js");

async function createApplicationService(data, fee) {
  // Check if application already exists
  const existing = await Application.findOne({
    email: data.email,
    category: data.category,
  });

  if (existing) {
    throw new Error("Application already exists for this email and category");
  }

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

  return await app.save();
}

async function updateApplicationPayment(appId, paymentData) {
  return await Application.findByIdAndUpdate(
    appId,
    {
      paymentLink: paymentData.paymentLink,
      providerOrderId: paymentData.orderId,
      paymentStatus: paymentData.orderStatus,
    },
    { new: true }
  );
}

module.exports = {
  createApplicationService,
  updateApplicationPayment,
};
