import { Request, Response, NextFunction } from "express";
import Redeemable, { IRedeemable } from "../models/Redeemable";
import responseErrorMsg from "./libs/responseMsg";
import mongoose from "mongoose";
import User from "../models/User";
import Data from "../models/Data";
interface GenericIRedeemable {
    type: string;
    name: string;
    point: number;
    remain: number;
}
interface IGift extends GenericIRedeemable {
    picture?: string;
    description?: string;
}

interface ICoupon extends GenericIRedeemable {
    discount: number;
    expire: number;
}
interface Pagination {
    prev?: {page: number, limit: number},
    next?: {page: number, limit: number},
    count?: number;
}
export async function getGiftsInRedeemables(req: Request, res: Response, next: NextFunction){
    try{    
            const pageSize = parseInt(req.query.pageSize as string) || 10;
            const page = parseInt(req.query.page as string) || 1;
            const pagination: Pagination = {}
            const total = await Redeemable.countDocuments({type: 'gift'});
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
            const gifts = await Redeemable.find({type: 'gift'}).skip(startIndex).limit(pageSize);
            pagination.count = gifts.length;
            res.status(200).json({success: true, total,pagination: pagination, data: gifts})
    }catch(err: any){
        console.log(err);
        responseErrorMsg(res, 500, err, 'Server Error');
    }
}

export async function getCouponsInRedeemables(req: Request, res: Response, next: NextFunction){
    try{    
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const page = parseInt(req.query.page as string) || 1;
        const pagination: Pagination = {}
        const total = await Redeemable.countDocuments({type: 'coupon'});
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
        const coupons = await Redeemable.find({type: 'coupon'}).skip(startIndex).limit(pageSize);
        pagination.count = coupons.length;
        res.status(200).json({success: true, total,pagination: pagination, data: coupons})
    }catch(err: any){
        console.log(err);
        responseErrorMsg(res, 500, err, 'Server Error');
    }
}

export async function getGift(req: Request, res: Response, next: NextFunction){
    try{
        const giftId = req.params.giftId;
        const gift = await Redeemable.findById(giftId).lean() as any as IGift;
        if(!gift){
            responseErrorMsg(res, 404, 'Not Found Gift', ' Not Found Gift');
            return;
        }
        if(gift.type !== 'gift'){
            responseErrorMsg(res, 400, 'นี่ id coupon', 'Bad Request');
            return;
        }
        res.status(200).json({success: true, ...gift});
    }catch(err: any){
        console.log(err);
        responseErrorMsg(res, 500, err, 'Server Error');
    }
}

export async function addRedeemable(req: Request, res: Response, next: NextFunction) {
    if(!req.user){
        res.status(401).json({ success: false, msg: "Not authorized to access this route" });
        return;
    }
    try{
        let reqRedeemable;
        if(req.body.type === 'gift'){
            reqRedeemable = req.body as IGift;
        }
        else if(req.body.type === 'coupon'){
            reqRedeemable = req.body as ICoupon;
        }
        else{
            responseErrorMsg(res,400,`type isn't gift or coupon`,'Bad Request');
        }
        await Redeemable.create(reqRedeemable);
        res.status(201).json({success: true})
    }catch(err: any){
        console.log(err);
        responseErrorMsg(res,500,err,'Server Error');
    }
}

export async function userRedemption(req: Request, res: Response, next: NextFunction){
    try{
        if(!req.user){
            res.status(401).json({ success: false, msg: "Not authorized to access this route" });
            return;
        }
        const redeemable = await Redeemable.findById(req.body.id);
        if(!redeemable){
            responseErrorMsg(res,404,'Not Found from ID','Not Found');
            return;
        }
        if(req.user.point < redeemable.point){
            responseErrorMsg(res,403,'แพงเกิน point ไม่พอ','Forbiden');
            return;
        }
        if(redeemable.remain <= 0) {
            responseErrorMsg(res,404,'หมดแล้วจ้า','Not Found');
            return;
        }
        redeemable.remain -= 1;
        const user = await User.findById(req.user._id);
        if(!user){
            responseErrorMsg(res,404,'who are you','Not Found');
            return;
        }
        user.point -= redeemable.point;
        let itemIndex = user.inventory.findIndex((data)=> data.redeemableId === redeemable._id);
        if(itemIndex !== -1 && user.inventory[itemIndex].count){
            user.inventory[itemIndex].count += 1;
        }
        else {
            user.inventory.push({redeemableId: redeemable._id,count: 1});
        }
        await redeemable.save();
        await user.save();
        res.status(200).json({sucess: true, remain: redeemable.remain});
    }catch(err: any){
        responseErrorMsg(res,500,err,'Server Error');
    }
}

export async function getPriceToPoint(req: Request, res: Response, next: NextFunction){
    try{
        const priceToPoint = await Data.findOne({name: "priceToPoint"});
        if(!priceToPoint){
            throw new Error("มันไม่มี priceToPoint อ่าาาา");
        }
        res.status(200).json({success: true, priceToPoint: priceToPoint.value});
    }catch(err: any){
        responseErrorMsg(res, 500, err, 'Server Error');
    }
}

export async function updatePriceToPoint(req: Request, res: Response, next: NextFunction){
    try{
        const priceToPoint: number = req.body.priceToPoint;
        await Data.updateOne({name: "priceToPoint"}, {$set: {
            value: priceToPoint
        }});
        const priceToPointData = await Data.findOne({name:"priceToPoint"});
        if(!priceToPointData){
            responseErrorMsg(res, 404, 'PriceToPoint not found', 'Not Found');
            return;
        }
        res.status(200).json({success: true, priceToPoint: priceToPointData.value});
    }catch(err: any){
        responseErrorMsg(res, 500, err, 'Server Error');
    }
}