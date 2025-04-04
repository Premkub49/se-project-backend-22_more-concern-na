import mongoose, { ObjectId } from "mongoose";

export interface IReview {
   _id: ObjectId;
   booking: ObjectId;
   createdAt: Date;
   rating: number;
   parentReview?: ObjectId;
   comment: string;
}

const ReviewSchema = new mongoose.Schema({
   booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
   },
   createdAt: {
      type: Date,
      default: Date.now(),
   },
   rating: {
      type: Number,
      required: [true, 'Please add a rating'],
      min: 1,
      max: 5,
   },
   parentReview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
   },
   comment: {
      type: String,
      required: [true, 'Please add a comment'],
   },
})

export default mongoose.model("Review", ReviewSchema);