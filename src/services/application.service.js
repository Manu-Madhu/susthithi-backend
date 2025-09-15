const Application = require("../models/Application.model.js");

async function createApplicationService(data, fee) {
  // Check if application already exists
  const existing = await Application.findOne({
    email: data.email,
    category: data.category,
    paymentStatus: "paid",
  });

  if (existing) {
    const error = new Error("Application already exists for this email and category");
    error.statusCode = 400;
    throw error;
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

async function getAllApplicationService({
  page,
  limit,
  search,
  startDate,
  endDate,
  status,
  pg
}) {
  const query = {};

  if (search) {
    query.$or = [{
        fullName: {
          $regex: search,
          $options: "i"
        }
      }, // Changed from name to fullName
      {
        email: {
          $regex: search,
          $options: "i"
        }
      },
    ];
  }

  if (status) {
    query.paymentStatus = status;
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      query.createdAt = {
        $gte: start,
        $lte: end,
      };
    }
  }

  const skip = (page - 1) * limit;


  // Base query
  let dbQuery = Application.find(query).sort({ createdAt: -1 });

  if (!pg) {
    dbQuery = dbQuery.skip(skip).limit(Number(limit));
  }

  const [data, total] = await Promise.all([
    dbQuery,
    Application.countDocuments(query),
  ]);

  return { data, total };
}

async function getAApplicationByOrderIDService(order_id) {
  return await Application.findOne({
    paymentProviderOrderId: order_id
  });
}

async function getApplicationByIdService(paymentProviderOrderId) {
  return await Application.findOne(paymentProviderOrderId);
}

async function updateApplicationPayment(appId, paymentData) {
  return await Application.findByIdAndUpdate(
    appId, {
      paymentProviderOrderId: paymentData.orderId,
      paymentStatus: paymentData.orderStatus,
    }, {
      new: true
    }
  );
}

module.exports = {
  createApplicationService,
  updateApplicationPayment,
  getAApplicationByOrderIDService,
  getAllApplicationService,
  getApplicationByIdService
};