import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    car_id:         { type: Number, required: true, unique: true },
    owner_id:       { type: mongoose.Schema.Types.ObjectId, ref: "SignupUser", required: true },
    ownerEmail:     { type: String, required: true },
    carName:        { type: String, required: true },
    carModel:       { type: String, required: true },
    pricePerDay:    { type: Number, required: true },
    pricePerHour:   { type: Number, default: 0 },
    pickupLocation: { type: String, required: true },
    fuelType:       { type: String, enum: ["Petrol", "Diesel", "Electric", "Hybrid"], required: true },
    seats:          { type: Number, required: true },
    contactNumber:  { type: String, required: true },
    carImages: [
      {
        imageName: String,
        imageData: String,
        imageType: String,
      },
    ],
    isAvailable: { type: Boolean, default: true },
    isVerified:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CarList =
  mongoose.models.CarList ||
  mongoose.model("CarList", carSchema);

export default CarList;