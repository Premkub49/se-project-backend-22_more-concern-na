import User from "models/User";
import { Request, Response, NextFunction } from "express";

export async function getUsers(req:Request, res:Response, next:NextFunction){
    try{
        const users = await User.find();
        res.status(200).json({
            success: true,
            users: users
        })
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }
}

