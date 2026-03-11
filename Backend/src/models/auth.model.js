import mongoose from "mongoose";

const authSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    resetToken: String,
    resetTokenExpire: Date,
  },
  { timestamps: true },
);

const User = mongoose.model("User", authSchema);
export default User;
