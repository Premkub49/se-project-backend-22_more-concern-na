import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import responseErrorMsg from "./libs/responseMsg";
import Redeemable from "../models/Redeemable";

interface pagination {
  next?: { page: number; limit: number; };
  prev?: { page: number; limit: number; };
  count?: number;
}

export async function getCouponsInInventory(req: Request, res: Response, next: NextFunction) {
  try {
    if(!req.user) {
      res.status(401).json({ success: false, msg: "Not authorized to access this route" });
      return;
    }
    
    const user = await User.findById(req.user._id).populate({
      path: "inventory",
      populate: {
        path: "redeemableId",
        model: "Redeemable"
      }
    })
    if (!user) {
      res.status(404).json({ success: false, msg: "User not found" });
      return;
    }
    if (!user.inventory || user.inventory.length <= 0 || !user.inventory.some((item: any) => item.redeemableId && item.redeemableId.type === 'coupon')) {
      res.status(404).json({ success: false, msg: "User has no items in inventory" });
      return;
    }

    const aggregate = [
        {
          $match: {
            _id: user._id
          }
        },
        { $unwind: { path: '$inventory' } },
        {
          $lookup: {
            from: 'redeemables',
            localField: 'inventory.redeemableId',
            foreignField: '_id',
            as: 'redeemable'
          }
        },
        { $project: { redeemable: 1, inventory: 1 } },
        { $unwind: { path: '$redeemable' } },
        { $match: { 'redeemable.type': 'coupon' } },
        {
          $project: {
            id: '$inventory.redeemableId',
            name: '$redeemable.name',
            point: '$redeemable.point',
            discount: '$redeemable.discount',
            expire: '$redeemable.expire',
            count: '$inventory.count',
            _id: 0
          }
        }
    ];

    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const pagination: pagination = {}
    const total = (await User.aggregate(aggregate).count("total"))[0].total;
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

    const coupons = await User.aggregate(aggregate).skip(startIndex).limit(pageSize);

    if (coupons.length === 0) {
      res.status(404).json({ success: false, msg: "No coupons found" });
      return;
    }

    pagination.count = coupons.length;

    res.status(200).json({
      success: true,
      total: total,
      pagination: pagination,
      data: coupons
    })
  }
  catch (err: any) {
    responseErrorMsg(res, 500, err, "Server error");
  }
}

export async function getGiftsInInventory(req: Request, res: Response, next: NextFunction) {
  try {
    if(!req.user) {
      res.status(401).json({ success: false, msg: "Not authorized to access this route" });
      return;
    }
    
    const user = await User.findById(req.user._id).populate({
      path: "inventory",
      populate: {
        path: "redeemableId",
        model: "Redeemable"
      }
    })

    if (!user) {
      res.status(404).json({ success: false, msg: "User not found" });
      return;
    }
    if (!user.inventory || user.inventory.length <= 0 || !user.inventory.some((item: any) => item.redeemableId && item.redeemableId.type === 'gift')) {
      res.status(404).json({ success: false, msg: "User has no items in inventory" });
      return;
    }

    const aggregate = [
        {
          $match: {
            _id: user._id
          }
        },
        { $unwind: { path: '$inventory' } },
        {
          $lookup: {
            from: 'redeemables',
            localField: 'inventory.redeemableId',
            foreignField: '_id',
            as: 'redeemable'
          }
        },
        { $project: { redeemable: 1, inventory: 1 } },
        { $unwind: { path: '$redeemable' } },
        { $match: { 'redeemable.type': 'gift' } },
        {
          $project: {
            id: '$inventory.redeemableId',
            name: '$redeemable.name',
            description: '$redeemable.description',
            point: '$redeemable.point',
            picture: '$redeemable.picture',
            count: '$inventory.count',
            _id: 0
          }
        }
    ];
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const pagination: pagination = {}
    const total = (await User.aggregate(aggregate).count("total"))[0].total;
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

    const gifts = await User.aggregate(aggregate).skip(startIndex).limit(pageSize);

    if (gifts.length === 0) {
      res.status(404).json({ success: false, msg: "No gifts found" });
      return;
    }

    pagination.count = gifts.length;

    res.status(200).json({
      success: true,
      total: total,
      pagination: pagination,
      data: gifts
    })
  }
  catch (err: any) {
    console.log(err);
    responseErrorMsg(res, 500, err, "Server error");
  }
}

export async function useRedeemableInInventory(req: Request, res: Response, next: NextFunction) {
  try {
    if(!req.user) {
      res.status(401).json({ success: false, msg: "Not authorized to access this route" });
      return;
    }

    const redeemableId = req.params.redeemableId;

    if (!redeemableId) {
      res.status(400).json({ success: false, msg: "Please provide redeemableId" });
      return;
    }

    const redeemable = await Redeemable.findById(redeemableId);
    if (!redeemable) {
      res.status(404).json({ success: false, msg: "Redeemable not found" });
      return;
    }
    
    const user: any = await User.findById(req.user._id);

    const index = user.inventory.findIndex((item: any) => {
      return item.redeemableId.toString() === redeemableId;
    })

    if (index === -1) {
      res.status(404).json({ success: false, msg: "Item not found in inventory" });
      return;
    }

    if (redeemable.expire && redeemable.expire < new Date()) {
      res.status(400).json({ success: false, msg: "Item has expired" });
      return;
    }

    user.inventory[index].count -= 1;
    if (user.inventory[index].count <= 0) {
      user.inventory.splice(index, 1);
    }
    await user.save();

    if (req.params.noResponse === "true") {
      return;
    }

    res.status(200).json({
      success: true,
      data: user.inventory
    })
  } catch (error: any) {
    responseErrorMsg(res, 500, error, "Server error");
  }
}