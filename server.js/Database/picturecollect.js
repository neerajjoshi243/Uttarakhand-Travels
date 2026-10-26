import mongoose from "mongoose";

const pictureSchema = new mongoose.Schema({
  hotel_id: {
    type:     Number,
    required: true,
  },
  hotelImages: [
    {
      imageName: { type: String, default: "" },
      imageType: { type: String, default: "" },

      // ✅ Cloudinary fields
      imageUrl:  { type: String, default: "" },  // Cloudinary secure URL
      publicId:  { type: String, default: "" },  // Cloudinary public ID (delete ke liye)

      // Legacy base64 — purane data ke liye rakha hai
      imageData: { type: String, default: "" },
    }
  ]
});

const HotelPhotos = mongoose.models.HotelPhotos || mongoose.model("HotelPhotos", pictureSchema);
export default HotelPhotos;