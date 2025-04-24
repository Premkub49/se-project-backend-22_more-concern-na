import mongoose, { ObjectId } from 'mongoose';
import { IHotel } from './Hotel';
import { IUser } from './User';
export interface BookingType {
  roomType: string;
  count: number;
}
export interface IBooking {
  _id: ObjectId;
  user: ObjectId;
  hotel: ObjectId;
  status: string;
  price: number;
  startDate: Date;
  endDate: Date;
  rooms: BookingType[];
  coupon?: ObjectId;
  createdAt: Date;
}

export interface PBooking {
  _id: ObjectId;
  user: IUser;
  hotel: IHotel;
  status: string;
  price: number;
  startDate: Date;
  endDate: Date;
  rooms: BookingType[];
  coupon?: ObjectId;
  createdAt: Date;
}

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add a user id'],
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Please add a hotel id'],
  },
  status: {
    type: String,
    enum: ['reserved', 'checkedIn', 'completed'],
    default: 'reserved',
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date'],
  },
  rooms: {
    type: [
      {
        roomType: {
          type: String,
          required: [true, 'Please add a room type'],
        },
        count: {
          type: Number,
          required: [true, 'Please add a number of rooms'],
        },
      },
    ],
    required: true,
  },
  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

export default mongoose.model('Booking', BookingSchema);
