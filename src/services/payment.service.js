const axios = require("axios");

const cofeeClient = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://partner-api.cofee.life/v1"
      : "https://partner-api.sandbox.cofee.life/v1",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-api-key": process.env.COFE_API_KEY,
  },
});

function formatPhone(phone) {
  if (!phone) return "";
  let cleaned = phone.toString().replace(/\D/g, "");
  if (!cleaned.startsWith("91")) {
    cleaned = "91" + cleaned;
  }
  return "+" + cleaned;
}

function formatCustomerRefId(input) {
  if (!input) return "customer_" + Date.now();
  return input.replace(/[^a-zA-Z0-9 _-]/g, "_"); 
}

// Call CoFee API to create payment order
async function createCofeeOrder({
  amount,
  currency,
  customer,
  merchantOrderId,
  redirectUrl,
}) {
  try {
    const body = {
      branch_id: process.env.COFE_BRANCH_ID,
      amount,
      currency,
      merchant_order_id: merchantOrderId,
      order_purpose: "Event Registration Fee",
      notify_customer: true,
      customer_details: {
        name: customer.name,
        email: customer.email,
        mobile: formatPhone(customer.mobile),
        customer_reference_id:
          formatCustomerRefId(customer.referenceId || customer.email),
      },
      order_items: [{ item_name: "Registration Fee", amount }],
      redirect_url: redirectUrl,
      send_receipt_to_customer: false,
    };

    const { data } = await cofeeClient.post("/payment-order", body);

    if (data.status !== "SUCCESS" || !data.data) {
      throw new Error(data.error?.message || "CoFee order creation failed");
    }

    return {
      orderId: data.data.order_id,
      paymentLink: data.data.payment_link,
      orderStatus: data.data.order_status, 
    };
  } catch (err) {
    console.error("CoFee API Error:", err.response?.data || err.message);
    throw new Error("Payment provider error");
  }
}


module.exports = { createCofeeOrder };
