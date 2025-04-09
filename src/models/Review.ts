import mongoose, { ObjectId } from 'mongoose';
export interface IReview {
  _id: ObjectId;
  booking?: ObjectId;
  rating?: number;
  reply?: ObjectId;
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
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

ReviewSchema.post("deleteOne", async function (doc, next){
  try{
    if(doc){
      await mongoose.model('Report').deleteMany({review: doc._id});
    }
    next();
  }catch(err:any){
    console.log(err);
    next(err);
  }
});

export default mongoose.model('Review', ReviewSchema);
