import mongoose from "mongoose";

const basicInfoSchema = new mongoose.Schema(
  {
    hotel_id:      { type: Number, required: true, unique: true },
    owner_id:      { type: mongoose.Schema.Types.ObjectId, ref: "SignupUser", required: true },
    hotelName:     { type: String, required: true, trim: true },
    ownerName:     { type: String, required: true, trim: true },
    ownerEmail:    { type: String, required: true, trim: true },
    hotelLocation: { type: String, required: true, trim: true },
    pricePerNight: { type: Number, required: true },
    contactNumber: { type: String, required: true },
  },
  { timestamps: true }
);

const BasicInfo =
  mongoose.models.BasicInfo ||
  mongoose.model("BasicInfo", basicInfoSchema);

export default BasicInfo;