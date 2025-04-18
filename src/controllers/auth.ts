import { NextFunction, Request, Response } from 'express';
import User, { IUser } from '../models/User';
import Booking from '../models/Booking';
import responseMsg from './libs/responseMsg';

interface IOption {
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
}

const userDataResponse = (user:IUser) => {
  return {
    name: user.name,
    email: user.email,
    picture: user.picture,
    tel: user.tel,
    hotel: user.hotel,
    role:user.role,
    point:user.point
  }
}

const errMongoChecker = (err: any) => {
  if (err.code === 11000) {
    return 'Email Already Exists';
  } else if (err.name === 'ValidationError') {
    if (err.errors.password) {
      return 'Password must be at least 6 characters';
    }
    if (err.errors.tel_number) {
      return 'Invalid Tel Number';
    }
    if (err.errors.email) {
      return 'Invalid Email';
    }
    if (err.errors.name) {
      return 'Invalid Name';
    }
    return 'Invalid Data';
  } else if (err.name === 'CastError') {
    return 'Invalid Id';
  } else {
    return 'Error';
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reqUser:IUser = req.body;
    const user = await User.create({
      name: reqUser.name,
      tel: reqUser.tel,
      picture: reqUser.picture,
      email: reqUser.email,
      password: reqUser.password,
    });
    sendTokenResponse(user as unknown as IUser, 200, res);
    return;
  } catch (err: any) {
    const message = errMongoChecker(err);
    //res.status(400).json({ success: false, msg: message });
    responseMsg(res,400,err,message);
    console.log(err.stack);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, msg: 'Please provide an email and password' });
    return;
  }

  const user: IUser | null = await User.findOne({ email }).select('+password');
  if (!user) {
    res.status(400).json({ success: false, msg: 'Invalid credentials' });
    return;
  }
  if (!user.matchPassword) {
    res.status(500).json({success: false, msg: "Server Error"});
    return;
  }
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401).json({ success: false, msg: 'Invalid credentials' });
    return;
  }

  sendTokenResponse(user, 200, res);
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.cookie('token', '', {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({ success: true, token: '' });
};

const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
  const token = user.getSignedJwtToken();
  const options: IOption = {
    expires: new Date(
      Date.now() +
        (Number(process.env.JWT_COOKIE_EXPIRE) || 30) * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    data: userDataResponse(user)
  });
};
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try{
  if (!req.user || !req.user.id) {
    res
      .status(401)
      .json({ success: false, msg: 'Not authorized to access this resource' });
    return;
  }
  const user = await User.findById(req.user.id) as any as IUser;
  if(!user){
    res.status(404).json({success: false, msg: "Not found User"});
    return;
  }
  const userBookings = await Booking.find({user: user._id});
  const activeBookings = userBookings.filter(booking => booking.status === "checkedIn");
  const upcomingBookings = userBookings.filter(booking => booking.status === "reserved");
  const pastBookings = userBookings.filter(booking => booking.status === "completed");
  const userData = userDataResponse(user);
  res.status(200).json({
    success: true,
    ...userData,
    bookings: {
      count: userBookings.length,
      active: {
        count: activeBookings.length,
        data: activeBookings
      },
      upcoming: {
        count: upcomingBookings.length,
        data: upcomingBookings
      },
      past: {
        count: pastBookings.length,
        data: pastBookings
      }
    }
  });
  }catch(err: any){
    console.log(err);
    //res.status(500).json({success: false, msg: "Server Error"})
    responseMsg(res,500,err,"Server Error");
  }
};

export default sendTokenResponse;