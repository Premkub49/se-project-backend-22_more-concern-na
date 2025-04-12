import { NextFunction, Request, Response } from 'express';
import User from '../models/User';
import mongoose from "mongoose";
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
    res.status(500).json({ success: false, msg: 'Server error' });
  }
}

export async function updateRole(req:Request, res:Response, next:NextFunction){
  try{
    if (!mongoose.isValidObjectId(req.body.user)) {
      res.status(400).json({ success: false, msg: "Invalid user ID" });
      return;
    }
    await User.updateOne({_id: req.body.user},{$set:{role: req.body.role}});
    res.status(200).json({success: true})
  }catch(err:any){
    console.log(err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
}