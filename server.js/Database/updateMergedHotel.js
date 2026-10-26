import BasicInfo    from "./hotellistdata.js";
import HotelDetails from "./detailsdata.js";
import HotelPhotos  from "./picturecollect.js";
import MergedHotels from "./MergedHotels.js";

const updateMergedHotel = async (hotel_id) => {
  try {
    hotel_id = Number(hotel_id);

    const basicInfo    = await BasicInfo.findOne({ hotel_id });
    const hotelDetails = await HotelDetails.findOne({ hotel_id });
    const hotelPhotos  = await HotelPhotos.findOne({ hotel_id });

    const finalData = {
      hotel_id,
      hotelName:        basicInfo?.hotelName        || "",
      ownerName:        basicInfo?.ownerName        || "",
      ownerEmail:       basicInfo?.ownerEmail       || "", // ✅ ownerEmail add kiya
      hotelLocation:    basicInfo?.hotelLocation    || "",
      pricePerNight:    basicInfo?.pricePerNight    || 0,
      contactNumber:    basicInfo?.contactNumber    || "",
      hotelDescription: hotelDetails?.hotelDescription || "",
      amenities:        hotelDetails?.amenities        || [],

      // ✅ imageUrl aur publicId bhi include karo
      hotelImages: (hotelPhotos?.hotelImages || []).map(img => ({
        imageName: img.imageName || "",
        imageType: img.imageType || "",
        imageUrl:  img.imageUrl  || "",   // ✅ Cloudinary URL
        publicId:  img.publicId  || "",   // ✅ Cloudinary public ID
        imageData: img.imageData || "",   // legacy base64
      })),
    };

    await MergedHotels.findOneAndUpdate(
      { hotel_id },
      finalData,
      { upsert: true, returnDocument: 'after', strict: false } // ✅ deprecated fix
    );

  } catch (error) {
    console.error("updateMergedHotel ERROR:", error.message);
  }
};

export default updateMergedHotel;