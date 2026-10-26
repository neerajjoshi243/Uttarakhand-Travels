import mongoose from "mongoose";
import bcrypt    from "bcryptjs";

const signupSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },

  // Forgot password OTP fields
  resetOtp:       { type: String,  default: undefined },
  resetOtpExpiry: { type: Date,    default: undefined },

}, { timestamps: true });

// ✅ Fixed pre-save hook — async/await se next() conflict hota tha
signupSchema.pre("save", async function () {
  // Sirf tab hash karo jab password change hua ho
  if (!this.isModified("password")) return;
  const salt    = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Password compare method
signupSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const signupUser = mongoose.models.signupUser || mongoose.model("signupUser", signupSchema);
export default signupUser;