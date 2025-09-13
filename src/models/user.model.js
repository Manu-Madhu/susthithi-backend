const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true },
    phone: { type: Number },
    password: { type: String },
    role: { type: String, enum: ['admin', 'user'], default:'user' }

}, { timestamps: true })

const User = mongoose.model("User", UserSchema);

module.exports = User;