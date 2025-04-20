import mongoose, { ObjectId } from 'mongoose';

export interface IReply {
  text?: string;
  title?: string;
}
export interface IReview {
  _id: ObjectId;
  booking?: ObjectId;
  rating?: number;
  reply?: IReply;
  title?: string;
  text?: string;
  createdAt: Date;
}

const ReviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must be at most 5'],
    validate: {
      validator: function (value: number) {
        return value === undefined || (value >= 1 && value <= 5);
      },
      message: 'Rating must be between 1 and 5',
    },
  },
  reply: {
    type: {
      text: { type: String },
      title: { type: String },
    },
  },
  title: {
    type: String,
  },
  text: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

ReviewSchema.pre("deleteOne", async function (next){
  try{
    await mongoose.model('Report').deleteMany({ review: new mongoose.Types.ObjectId(this.getQuery()._id) });
    next();
  }catch(err:any){
    console.log(err);
    next(err);
  }
});

export default mongoose.model('Review', ReviewSchema);
