import mongoose from "mongoose";

const mergedHotelSchema = new mongoose.Schema({
  hotel_id:         { type: Number, required: true, unique: true },
  hotelName:        { type: String, default: "" },
  ownerName:        { type: String, default: "" },
  ownerEmail:       { type: String, default: "" },
  hotelLocation:    { type: String, default: "" },
  pricePerNight:    { type: Number, default: 0  },
  contactNumber:    { type: String, default: "" },
  hotelDescription: { type: String, default: "" },
  amenities:        { type: [String], default: [] },

  hotelImages: {
    type: [
      {
        imageName: { type: String, default: "" },
        imageType: { type: String, default: "" },
        imageUrl:  { type: String, default: "" },  // ✅ Cloudinary URL
        publicId:  { type: String, default: "" },  // ✅ Cloudinary public ID
        imageData: { type: String, default: "" },  // legacy base64
      }
    ],
    default: []
  }
});

const MergedHotels = mongoose.models.MergedHotels || mongoose.model("MergedHotels", mergedHotelSchema);
export default MergedHotels;