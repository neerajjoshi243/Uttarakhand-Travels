import mongoose from "mongoose";

const bikeSchema = new mongoose.Schema(
  {
    bike_id:        { type: Number, required: true, unique: true },
    owner_id:       { type: mongoose.Schema.Types.ObjectId, ref: "SignupUser", required: true },
    ownerEmail:     { type: String, default: "" },        // ✅ required hataya
    bikeName:       { type: String, required: true },
    bikeModel:      { type: String, required: true },
    bikeType:       { type: String, enum: ["Scooter", "Sport", "Cruiser", "Adventure"], required: true },
    pricePerDay:    { type: Number, required: true },
    pricePerHour:   { type: Number, default: 0 },
    pickupLocation: { type: String, required: true },
    fuelType:       { type: String, enum: ["Petrol", "Electric"], required: true },
    contactNumber:  { type: String, required: true },
    bikeImages: [
      {
        imageName: { type: String, default: "" },
        imageType: { type: String, default: "" },
        imageUrl:  { type: String, default: "" },  // ✅ Cloudinary URL
        publicId:  { type: String, default: "" },  // ✅ Cloudinary public ID
        imageData: { type: String, default: "" },  // legacy base64
      },
    ],
    helmetIncluded: { type: Boolean, default: false },
    isAvailable:    { type: Boolean, default: true },
    isVerified:     { type: Boolean, default: false },
  },
  { timestamps: true }
);

const BikeList = mongoose.models.BikeList || mongoose.model("BikeList", bikeSchema);
export default BikeList;