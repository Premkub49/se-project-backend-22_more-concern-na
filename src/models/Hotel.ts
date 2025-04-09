import mongoose, { ObjectId } from 'mongoose';
export interface Rooms {
  roomType: string;
  picture?: string;
  capacity: number;
  maxCount: number;
  price: number;
}

export interface IHotel {
  _id: ObjectId;
  name: string;
  description?: string;
  picture?: string;
  buildingNumber: string;
  street: string;
  district: string;
  province: string;
  postalCode: string;
  tel: string;
  rooms: Rooms[];
  ratingSum: number;
  ratingCount: number;
}

const HotelSchema = new mongoose.Schema(
  {
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
    buildingNumber: {
      type: String,
      required: [true, 'Please provide a building number'],
    },
    street: {
      type: String,
      required: [true, 'Please provide a street'],
    },
    district: {
      type: String,
      required: [true, 'Please provide a city'],
    },
    province: {
      type: String,
      required: [true, 'Please provide a state'],
    },
    postalCode: {
      type: String,
      required: [true, 'Please provide a postalCode'],
      maxlength: [5, 'postalcode cannot be more than 5 characters'],
      minlength: [5, 'postalcode cannot be less than 5 characters'],
    },
    tel: {
      type: String,
      required: [true, 'Please add a telephone number'],
      match: [/^[0-9]{10}$/, 'Please add a valid tel_number'],
      trim: true,
    },
    rooms: {
      type: [
        {
          roomType: {
            type: String,
            required: [true, 'Please add a room type'],
          },
          picture: {
            type: String,
            match: [
              /^https?:\/\/.*\.(?:png|jpg|jpeg|gif)$/i,
              'Please provide a valid URL',
            ],
          },
          capacity: {
            type: Number,
            required: [true, 'Please add a capacity'],
          },
          maxCount: {
            type: Number,
            required: [true, 'Please add a maxCount'],
          },
          price: {
            type: Number,
            required: [true, 'Please add a price'],
          },
        },
      ],
      required: [true, 'Please add rooms'],
      validate: {
        validator: function (rooms: Rooms[]){
          const uniqueRoomTypes = new Set(rooms.map((room)=>room.roomType));
          uniqueRoomTypes.size === rooms.length;
        },
        message: 'Room types must be unique',
      }
    },
    ratingSum: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    autoIndex: true
  },
);

HotelSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'hotel',
  justOne: false,
});

export default mongoose.model('Hotel', HotelSchema);
// module.exports = mongoose.model("Hotel", HotelSchema);
