import { NextFunction, Request, Response } from "express";
import User from "../models/User";
import responseErrorMsg from "./libs/responseMsg";
import Redeemable from "../models/Redeemable";

interface pagination {
  next?: { page: number; limit: number; };
  prev?: { page: number; limit: number; };
  count?: number;
}

export async function getInventoryByType(type: string, req: Request, res: Response, next: NextFunction) {
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
    if (!user.inventory) {
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
        { $match: { 'redeemable.type': type } },
        {
          $project: {
            id: '$inventory.redeemableId',
            remain: '$inventory.remain',
            count: '$inventory.count',
            name: '$redeemable.name',
            type: '$redeemable.type',
            description: '$redeemable.description',
            expire: '$redeemable.expire',
            point: '$redeemable.pointUse',
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

    res.status(200).json({
      success: true,
      count: total,
      pagination: pagination,
      data: coupons
    })
  }
  catch (err: any) {
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

    user.inventory[index].count -= 1;
    if (user.inventory[index].count <= 0) {
      user.inventory.splice(index, 1);
    }
    await user.save();

    res.status(200).json({
      success: true,
      data: user.inventory
    })
  } catch (error: any) {
    responseErrorMsg(res, 500, error, "Server error");
  }
}