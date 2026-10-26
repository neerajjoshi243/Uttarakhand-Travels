import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  booking_id:    { type: Number, unique: true, required: true },

  // ✅ user_id — booking karne wala
  user_id:       { type: String, default: "" },

  // ✅ owner_id — jiske hotel/car/bike ki booking hai
  owner_id:      { type: String, default: "" },

  serviceType:   { type: String, enum: ["hotel", "car", "bike"], required: true },
  service_id:    { type: Number, required: true },
  serviceName:   { type: String, default: "" },

  ownerContact:  { type: String, default: "" },
  ownerEmail:    { type: String, default: "" },

  guestName:     { type: String, required: true },
  guestPhone:    { type: String, required: true },
  guestEmail:    { type: String, default: "" },

  checkInDate:   { type: String, required: true },
  checkOutDate:  { type: String, required: true },
  guests:        { type: Number, default: 1 },
  totalAmount:   { type: Number, required: true },

  status: {
    type:    String,
    enum:    ["pending", "confirmed", "cancelled"],
    default: "pending",
  },

  // ✅ Razorpay payment fields
  paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
  paymentId:     { type: String, default: "" },

  bookedAt: { type: Date, default: Date.now },

}, { timestamps: true });

const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
export default Booking;