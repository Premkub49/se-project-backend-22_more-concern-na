import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true,
  },
  status: {
    type: String,
    enum: ['comfirmed', 'canceled', 'checked In', 'completed', 'no show'],
    default: 'comfirmed',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  rooms: {
    type: Array,
    required: true,
    properties: {
      roomType: {
        type: String,
        required: [true, 'Please add a room type'],
      },
      numberOfRooms: {
        type: Number,
        required: [true, 'Please add a number of rooms'],
      },
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

export default mongoose.model('Booking', BookingSchema);
