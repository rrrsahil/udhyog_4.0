import mongoose from "mongoose";

const authSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },

    resetToken: String,
    resetTokenExpire: Date
  },
  { timestamps: true }
);

const User = mongoose.model("User", authSchema);
export default User;
