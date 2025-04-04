import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export interface AuthRequest extends Request {
  user?: any;
}

export interface IUser {
  name: string;
  tel: string;
  email: string;
  password: string;
  role: string;
  point: number;
  resetPasswordToken: string;
  resetPasswordExpired: Date;
  createdAt: Date;
  getSignedJwtToken: Function;
  matchPassword: Function;
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
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
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
  point: {
    type: Number,
    default: 0,
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
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET as string, {
    expiresIn: parseInt(process.env.JWT_EXPIRE as string, 10),
  });
};

//Match user password
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', UserSchema);
