import { NextFunction, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User, { AuthRequest } from '../models/User';

export async function protect(req: any, res: Response, next: NextFunction) {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorize to access this route' });
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
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    console.log(err);
    return res
      .status(401)
      .json({ success: false, message: 'Not authorize to access this route' });
  }
}

export const authorize = async (...roles: any[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
