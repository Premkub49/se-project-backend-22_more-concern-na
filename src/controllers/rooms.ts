import { Request, Response, NextFunction } from "express";
import Hotel, { Rooms } from "../models/Hotel";
import responseErrorMsg from "./libs/responseMsg";

function roomCheckHotel(req:Request, res:Response):boolean {
    if(!req.user){
        res.status(401).json({ success: false, msg: 'Not authorized to access this route' });
        return true;
    }
    if(req.user.role === "hotelManager"){
        if(req.user.hotel?.toString() !== req.params.hotelId){
            res.status(401).json({success: false ,msg: "Not authorized to access this route"});
            return true;
        }
    }
    return false;
}

export async function addRoom(req:Request, res:Response, next:NextFunction) {
    try{
        if(roomCheckHotel(req,res)){
            return;
        }
        const reqBody:Rooms = req.body;
        const hotel = await Hotel.findById(req.params.hotelId);
        if(!hotel){
            res.status(404).json({success: false, msg: "Not found hotel"})
            return;
        }
        hotel.rooms.push(reqBody);
        await hotel.save();
        res.status(201).json({success: true});
    }catch(err:any){
        console.log(err.stack);
        //res.status(500).json({success: false, msg:"Server Error"})
        responseErrorMsg(res,500,err,'Server error');
    }
    
}

export async function updateRoom(req:Request, res:Response, next:NextFunction){
    try{
        if(roomCheckHotel(req,res)){
            return;
        }
        const reqBody:Rooms = req.body;
        const hotel = await Hotel.findById(req.params.hotelId);
        if(!hotel){
            res.status(404).json({success: false, msg: "Not found hotel"})
            return;
        }
        const index = hotel.rooms.findIndex((element) => {
            return element._id?.toString() === req.params.roomId;
        });
        if (index === -1) {
            res.status(404).json({success:false, msg:"Room not found"});
            return;
        }
        for(const key in reqBody){
            if(key in hotel.rooms[index] && key !== "_id"){
                (hotel.rooms[index] as any)[key] = reqBody[key as keyof Rooms];
            }
        }
        await hotel.save();
        res.status(200).json({success: true});
    }catch(err:any){
        console.log(err);
        //res.status(500).json({success: false, msg: "Server Error"});
        responseErrorMsg(res,500,err,'Server error');
    }
}

export async function deleteRoom(req: Request, res: Response, next: NextFunction){
    try{
        if(roomCheckHotel(req,res)){
            return;
        }
        const hotel = await Hotel.findById(req.params.hotelId);
        if(!hotel){
            res.status(404).json({success: false, msg: "Not found hotel"})
            return;
        }
        const index = hotel.rooms.findIndex((element) => {
            return element._id?.toString() === req.params.roomId;
        });
        if (index === -1) {
            res.status(404).json({success:false, msg:"Room not found"});
            return;
        }
        hotel.rooms.splice(index, 1);
        await hotel.save();
        res.status(200).json({success: true});
    }catch(err:any){
        console.log(err);
        //res.status(500).json({success: false, msg: "Server Error"});
        responseErrorMsg(res,500,err,'Server error');
    }
}