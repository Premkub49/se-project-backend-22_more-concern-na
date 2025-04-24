import { Request, Response, NextFunction } from "express";
import Redeemable, { IRedeemable } from "../models/Redeemable";
import responseErrorMsg from "./libs/responseMsg";
import { start } from "pm2";
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