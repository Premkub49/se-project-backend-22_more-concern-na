import mongoose, { ObjectId } from 'mongoose';
export interface IRedeemable {
  _id: ObjectId;
  type: string;
  name: string;
  description?: string;
  picture?: string;
  point: number;
  discount?: number;
  expire?: Date;
  remain: number;
}
const RedeemableSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Please add a type'],
    enum: ['gift', 'coupon'],
  },
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  description: {
    type: String,
  },
  picture: {
    type: String,
    match: [
      /^https?:\/\/.*\.(?:png|jpg|jpeg|gif)$/i,
      'Please provide a valid URL',
    ],
  },
  point: {
    type: Number,
    required: [true, 'Please add a pointUse'],
  },
  discount: {
    type: Number,
  },
  expire: {
    type: Date,
  },
  remain: {
    type: Number,
    required: [true, 'Please add a remainCount'],
  },
});

export default mongoose.model('Redeemable', RedeemableSchema);
