import mongoose from "mongoose";

const detailsSchema =
  new mongoose.Schema({

    hotel_id: {

      type: Number,

      required: true,

      unique: true

    },

    hotelDescription: {

      type: String,

      required: true

    },

    amenities: [

      {

        type: String

      }

    ]

  });

const HotelDetails =

  mongoose.models.HotelDetails ||

  mongoose.model(
    "HotelDetails",
    detailsSchema
  );

export default HotelDetails;