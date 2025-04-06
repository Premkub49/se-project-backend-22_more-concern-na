import { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export const protect: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res
      .status(401)
      .json({ success: false, message: 'Not authorized to access this route' });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;
    if (!decoded) {
      throw new Error('Token is not valid');
    }
    console.log(decoded);
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error('User not found');
    }
    req.user = user as unknown as IUser;
    next();
  } catch (err) {
    res
      .status(401)
      .json({ success: false, message: 'Not authorize to access this route' });
    return;
  }
};

export const authorize = (...roles: any[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user){
      res.status(401).json({
        success: false,
        message: 'User is not authenticated',
      });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
      return;
    }
    next();
  };
};
