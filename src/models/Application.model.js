const { default: mongoose, Schema } = require("mongoose");

const ApplicationSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    category: {
      type: String,
      enum: ["cetaa", "engineers_club", "delegate","startup"],
      required: true,
    },
    // optional fields depending on category
    batch: { type: String },
    department: { type: String },
    membershipId: { type: String },
    organization: { type: String },

    feeAmount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    paymentStatus: {
      type: String,
      enum: ["processing", "pending", "paid", "failed"],
      default: "pending",
    },
    paymentProvider: {
      type: String,
      default: "cofee",
    },
    paymentProviderOrderId: { type: String },
  },
  { timestamps: true }
);

const Application = mongoose.model("Application", ApplicationSchema);

module.exports = Application;
