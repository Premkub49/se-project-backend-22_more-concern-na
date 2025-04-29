import { NextFunction, Request, Response } from 'express';
import User, { IUser } from '../models/User';
import mongoose from "mongoose";
import sendTokenResponse from './auth';
import responseErrorMsg from './libs/responseMsg';
interface Pagination {
  next?: { page: number; limit: number; };
  prev?: { page: number; limit: number; };
  count?: number;
}
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
    if(!req.body){
      responseErrorMsg(res,400,'Send point in body!','Bad Request');
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
        res.status(200).json({ success: true , point});
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
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const pagination: Pagination = {}
    const total = (await User.countDocuments());
    const totalPage = Math.ceil(total / pageSize);

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;

    if (endIndex < total) {
      if(page == totalPage - 1) {
        const nextLimit = total % pageSize === 0 ? pageSize : total % pageSize;
        pagination.next = {
          page: page + 1,
          limit: nextLimit
        }
      }
      else {
        pagination.next = {
          page: page + 1,
          limit: pageSize
        }
      }
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit: pageSize
      }
    }
    const users = await User.find().skip(startIndex).limit(pageSize); 
    if(!users){
      responseErrorMsg(res,404,'Not Found Users', 'Not Found');
      return;
    }
    pagination.count = users.length;
    res.status(200).json({
      success: true,
      total,
      pagination,
      data: users
    })
  } catch (err: any) {
    console.log(err);
    responseErrorMsg(res, 500, err, 'Server error');
  }
}