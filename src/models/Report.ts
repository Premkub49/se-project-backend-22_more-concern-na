import mongoose, { ObjectId } from "mongoose";

export interface IReport {
   _id: ObjectId;
   review: ObjectId;
   reportDate: Date;
   reportDescription: string;
}

const ReportSchema = new mongoose.Schema({
   review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      required: true,
   },
   reportDate: {
      type: Date,
      default: Date.now(),
   },
   reportDescription: {
      type: String,
      enum: ["pedo", "bully", "suicide", "violence", "nsfw", "spam", "scam", "other"],
      required: [true, "Please add a report description"],
   },
});

export default mongoose.model("Report", ReportSchema);