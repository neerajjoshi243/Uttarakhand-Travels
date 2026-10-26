import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/UserData");
  console.log("MongoDB Connected ✅");
};

export default connectDB;