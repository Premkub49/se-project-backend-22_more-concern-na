import { NextFunction, Request, Response } from 'express';
import Hotel, { IHotel } from '../models/Hotel';
import Booking from '../models/Booking';
import mongoose from 'mongoose';
import User from '../models/User';

function noSQLInjection(data:object | string) {
  let dataStr = JSON.stringify(data);
    dataStr = dataStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`,
    );
  const dataJSON = JSON.parse(dataStr);
  return dataJSON;
}

export async function getHotels(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    let query;
    const reqQuery = {...req.query};
    const removeFields = ["select", "sort", "page", "limit"];
    removeFields.forEach((param)=> delete reqQuery[param]);
    const filters = await noSQLInjection(reqQuery);

    if (typeof req.query.name === "string" && req.query.name.trim() !== "") {
      filters.name = { $regex: req.query.name, $options: "i" };
    }

    if (typeof req.query.province === "string" && req.query.province.trim() !== "") {
      filters.province = {
        $regex: req.query.province,
        $options: "i",
      };
    }

    query = Hotel.find(filters);

    // projection
    if (typeof req.query.select === "string") {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    // sort
    if (typeof req.query.sort === "string") {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // pagination
    const page = typeof req.query.page === 'string' ? parseInt(req.query.page, 10) : 1;
    const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Hotel.countDocuments();
    query = query.skip(startIndex).limit(limit);

    const hotels = await query;

    // executing pagination
    const pagination: { next?: { page: number; limit: number }; prev?: { page: number; limit: number } } = {};
    if (endIndex < total) pagination.next = { page: page + 1, limit };
    if (startIndex > 0) pagination.prev = { page: page - 1, limit };

    res
      .status(200)
      .json({ success: true, count: hotels.length, pagination, data: hotels });
  } catch (err:any) {
    if (err.message) {
      res.status(400).json({ success: false, msg: err.message });
    } else {
      res.status(500).json({ success: false, msg: "Server Error" });
    }
  }
}

export async function getHotel(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const hotelId = req.params.hotelId;
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      res.status(404).json({ success: false, msg: 'Not Found Hotel' });
      return;
    }
    res.status(200).json({
      success: true,
      hotel: hotel,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({success:false, msg:"Server Error"});
  }
}

export async function addHotel(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const reqHotel:IHotel = req.body;
    await Hotel.create(reqHotel);
    res.status(201).json({ success: true });
  } catch (err:any) {
    if (err.message) {
      res.status(400).json({ success: false, msg: err.message });
    } else {
      res.status(500).json({ success: false, msg: "Server Error" });
    }
  }
}

export async function updateHotel(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const reqBody:IHotel = req.body;
    if(req.user && req.user.role === "hotelManager"){
      if(req.params.HotelId !== req.user.hotel as unknown as string){
        res.status(400).json({success:false, msg:"It isn't your hotel get out."})
        return;
      }
    }
    await Hotel.updateOne({ _id: req.params.hotelId }, reqBody);
    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({success:false, msg:"Server Error"});
  }
}

export async function deleteHotel(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await Hotel.deleteOne({ _id: req.params.hotelId });
    await User.updateMany(
      { hotel: new mongoose.Types.ObjectId(req.params.hotelId) },
      { $unset: { hotel: "" } }
    );
    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({success:false, msg:"Server Error"});
  }
}

export async function checkAvailable(req:Request, res:Response, next: NextFunction){
  try{
    const reqQuery = {...req.query};
    const query = await noSQLInjection(reqQuery);
    const hotelId:string = await noSQLInjection(req.params.hotelId);
    const checkIn = new Date(query.checkin)
    const checkOut = new Date(query.checkout)
    const checkinUTC = new Date(checkIn.getTime() - (checkIn.getTimezoneOffset() * 60000));
  const checkoutUTC = new Date(checkOut.getTime() - (checkOut.getTimezoneOffset() * 60000));
    const roomsUsed =  await Booking.aggregate([
      {
        $match: {
          hotel: new mongoose.Types.ObjectId(hotelId),
          status:{$in:["reserved", "checkedIn"]},
          startDate: {$gte:checkinUTC,$lte:checkoutUTC},
          endDate:  {$gte:checkinUTC,$lte:checkoutUTC}
        }
      },
      {
        $unwind: "$rooms"
      },
      {
        $group: {
          _id: "$rooms.roomType",
          totalCount: { $sum: "$rooms.count" }
        }
      },
      {
        $project: {
          type: "$_id", 
          sumCount: "$totalCount", 
          _id: 0
        }
      }
    ])
    const hotel = await Hotel.find({_id:hotelId});
    const rooms = hotel[0].rooms;
    let returnRooms: { type: string; remainCount: number }[] = [];
    for(let i=0;i<rooms.length;i++){
      returnRooms.push({type: rooms[i].roomType,remainCount: rooms[i].maxCount});
      const index = roomsUsed.findIndex(({type})=>type===rooms[i].roomType);
      if(index !== -1){
        returnRooms[i].remainCount = returnRooms[i].remainCount - roomsUsed[index].sumCount;
      }
    }
    res.status(200).json({success:true, rooms:returnRooms});
  }catch(err:any){
    console.log(err);
    res.status(500).json({success:false, msg:"Server Error"});
  }
}