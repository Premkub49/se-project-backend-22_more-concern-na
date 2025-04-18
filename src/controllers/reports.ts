import { NextFunction, Request, Response } from 'express';
import Report, {IReport} from '../models/Report';
import responseErrorMsg from './libs/responseMsg';


export async function getReports(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  //TODO-reportReason, hotel, populateReview
  try {
    const reports = await Report.find();

    res.status(200).json({
      success: true,
      reports: reports,
    });
  } catch (err:any) {
    console.log(err);
    //res.status(500).json({ success: false, msg: 'Server error' });
    responseErrorMsg(res,500,err,'Server error');
  }
}

export async function updateReport( 
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (req.user && req.user.role !== "admin") {
      res.status(400).json({ success: false, msg: "you are not an admin" });
      return;
    }

    // Enforce updating only `isIgnore`
    if (!Object.prototype.hasOwnProperty.call(req.body, "isIgnore") || Object.keys(req.body).length !== 1) {
      res.status(400).json({ success: false, msg: "Only 'isIgnore' field can be updated" });
      return;
    }

    const isIgnore = req.body.isIgnore;
    if(isIgnore === null){
      res.status(400).json({ success: false, msg: "isIgnore can not be null" });
      return;
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      res.status(404).json({ success: false, msg: "Report not found" });
      return;
    }

    await Report.updateOne(
      { _id: req.params.id },
      { $set: { isIgnore } }
    );

    res.status(200).json({ success: true });
  } catch (err:any) {
    console.log(err);
    //res.status(500).json({ success: false, msg: "Server Error" });
    responseErrorMsg(res,500,err,'Server error');
  }
}



export async function addReport(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const reqReport:IReport = req.body;
    await Report.create(reqReport);
    res.status(201).json({ success: true });
  } catch (err:any) {
    if (err.message) {
      res.status(400).json({ success: false, msg: err.message });
    } else {
      //res.status(500).json({ success: false, msg: "Server Error" });
      responseErrorMsg(res,500,err,'Server error');
    }
  }
}