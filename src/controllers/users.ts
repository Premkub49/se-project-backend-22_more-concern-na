import { NextFunction, Request, Response } from 'express';
import User from 'models/User';

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      users: users,
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}
