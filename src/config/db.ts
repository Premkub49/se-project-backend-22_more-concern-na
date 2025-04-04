import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.set("strictQuery", true);
  if(!process.env.MONGO_URI){
    console.log("mongo env uri not found");
    return;
  }
  const conn = await mongoose.connect(process.env.MONGO_URI as string);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

export default connectDB;