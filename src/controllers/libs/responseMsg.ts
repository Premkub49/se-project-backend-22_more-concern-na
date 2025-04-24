import {Response} from "express";
export default function responseErrorMsg(res:Response,status:number, err: string, msg: string){
    if(process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production"){
        res.status(status).json({success: false, msg: err});
    }
    else {
        res.status(status).json({success: false, msg: msg});
    }
}