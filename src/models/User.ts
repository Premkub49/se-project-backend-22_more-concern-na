import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose, { ObjectId } from 'mongoose';
export interface UserRedeemable {
  redeemableId: ObjectId;
  count: number;
}
export interface IUser {
  _id: ObjectId;
  id?: ObjectId;
  name: string;
  tel: string;
  picture?: string;
  email: string;
  password: string;
  role: string;
  hotel?: ObjectId;
  point: number;
  inventory: UserRedeemable[];
  resetPasswordToken?: string;
  resetPasswordExpired?: Date;
  createdAt: Date;
  getSignedJwtToken: () => string;
  matchPassword: (enteredPassword: string) => Promise<boolean>;
}

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  tel: {
    type: String,
    required: [true, 'Please add a telephone number'],
    match: [/^[0-9]{10}$/, 'Please add a valid tel_number'],
    trim: true,
  },
  picture: {
    type: String,
    /*match: [
      /^https?:\/\/.*\.(?:png|jpg|jpeg|gif)$/i,
      'Please provide a valid URL',
    ],*/
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
    trim:true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'hotelManager'],
    default: 'user',
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"Hotel"
  },
  point: {
    type: Number,
    default: 0,
  },
  inventory: {
    type: [
      {
        redeemableId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Redeemable',
        },
        count: {
          type: Number,
        },
      },
    ],
    default: [],
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

//Use salt to hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: parseInt(process.env.JWT_EXPIRES as string ,10) * 24* 60 *60,
  });
};

//Match user password
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', UserSchema);
