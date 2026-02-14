const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String, // ❌ FIXED: Changed from Number to String
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    // ❌ REMOVED: confirmPassword - Never store in DB
    address: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
); // ✅ ADDED: createdAt/updatedAt timestamps

module.exports = mongoose.model("User", userSchema);
