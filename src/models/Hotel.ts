import mongoose from 'mongoose';

interface Address {
  building_number: string;
  street: string;
  district: string;
  province: string;
  postalcode: string;
}

interface Rooms {
  roomType: string;
  picture: string;
  numberOfRooms: number;
  price: number;
}

export interface IHotel {
  name: string;
  picture: string;
  adress: Address;
  tel: string;
  rooms: Rooms[];
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
    address: {
      type: Object,
      required: [true, 'Please add an address'],
      properties: {
        buidling_number: {
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
        postalcode: {
          type: String,
          required: [true, 'Please provide a postalcode'],
          maxlength: [5, 'postalcode cannot be more than 5 characters'],
          minlength: [5, 'postalcode cannot be less than 5 characters'],
        },
      },
    },
    tel: {
      type: String,
      required: [true, 'Please add a telephone number'],
      match: [/^[0-9]{10}$/, 'Please add a valid tel_number'],
    },
    rooms: {
      type: Array,
      required: [true, 'Please add rooms'],
      properties: {
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
        numberOfRooms: {
          type: Number,
          required: [true, 'Please add a number of rooms'],
        },
        price: {
          type: Number,
          required: [true, 'Please add a price'],
        },
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
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
