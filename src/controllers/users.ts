import { NextFunction, Request, Response } from 'express';
import User, { IUser } from '../models/User';
import mongoose from "mongoose";
import sendTokenResponse from './auth';
import responseErrorMsg from './libs/responseMsg';
export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const users = await User.find();
    const total = await User.countDocuments();
    res.status(200).json({
      success: true,
      total,
      users: users,
    });
  } catch (err: any) {
    console.log(err);
    //res.status(500).json({ success: false, msg: 'Server error' });
    responseErrorMsg(res,500,err,'Server error');
  }
}

export async function updateUser(req: Request, res:Response, next: NextFunction){
  try{
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, msg: 'Not authorized to access this route' });
      return;
    }
    const {picture, name, tel, password} = req.body;
    const user = await User.findById(req.user._id);
    if(!user){
      res
      .status(401)
      .json({ success: false, msg: 'Not authorized to access this route' });
    return;
    }
    if(name) user.name = name;
    if(picture) user.picture = picture;
    if(tel) user.tel = tel;
    if(password) user.password = password;
    await user.save();
    const newUser = await User.findById(req.user._id) as any as IUser;
    sendTokenResponse(newUser, 200, res);
  }catch(err: any){
    console.log(err);
    //res.status(500).json({ success: false, msg: 'Server error' });
    responseErrorMsg(res,500,err,'Server error');
  }
}

export async function updateRole(req: Request, res: Response, next: NextFunction){
  try{
    if (!mongoose.isValidObjectId(req.body.user)) {
      res.status(400).json({ success: false, msg: "Invalid user ID" });
      return;
    }
    if(req.body.role === "hotelManager"){
      await User.updateOne({_id: req.body.user},{$set:{hotel: req.body.hotel}});
    }
    await User.updateOne({_id: req.body.user},{$set:{role: req.body.role}});
    res.status(200).json({success: true})
  }catch(err:any){
    console.log(err);
    //res.status(500).json({ success: false, msg: 'Server error' });
    responseErrorMsg(res,500,err,'Server error');
  }
}

export async function updateUserPoint(req: Request, res:Response, next: NextFunction){
  //console.log("test");
  try{
    if (!req.user||req.user.role!="admin") {
      res
        .status(401)
        .json({ success: false, msg: 'Not authorized to access this route' });
      return;
    }

    if (!Object.prototype.hasOwnProperty.call(req.body, "point") || Object.keys(req.body).length !== 1) {
      res.status(400).json({ success: false, msg: "Only 'point' field can be updated" });
      return;
    }
    const point = req.body.point;
    if(point === null){
      res.status(400).json({ success: false, msg: "point can not be null" });
      return;
    }
    if(point < 0){
      res.status(400).json({ success: false, msg: "point can not be less than 0" });
      return;
    }
    const user = await User.findById(req.params.userId);
    if(!user){
      res
      .status(404)
      .json({ success: false, msg: 'user not found' });
    return;
    }
    
    await User.updateOne(
          { _id: req.params.userId },
          { $set: { point } }
        );
        res.status(200).json({ success: true , point:point});
  }catch(err: any){
    console.log(err);
    //res.status(500).json({ success: false, msg: 'Server error' });
    responseErrorMsg(res,500,err,'Server error');
  }
}

export async function getUsersPoints(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Get page and pageSize from request body, default to page 1 and pageSize 10
    const { page = 1, pageSize = 10 } = req.body;

    // Validate input
    const parsedPage = Math.max(1, parseInt(page));
    const parsedPageSize = Math.max(1, parseInt(pageSize));

    const skip = (parsedPage - 1) * parsedPageSize;

    // Get total count of documents
    const total = await User.countDocuments();

    // Get paginated users
    const users = await User.find().select('id name email point')
      .skip(skip)
      .limit(parsedPageSize);

    // Calculate total pages
    const totalPages = Math.ceil(total / parsedPageSize);

    res.status(200).json({
      success: true,
      pagination: {
        next:{
          page: parsedPage+1,
          limit: parsedPageSize
        },
        prev:{
          page: parsedPage-1,
          limit: parsedPageSize
        }
      },
      data: users,
    });
  } catch (err: any) {
    console.log(err);
    responseErrorMsg(res, 500, err, 'Server error');
  }
}