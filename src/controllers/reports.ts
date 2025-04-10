import { NextFunction, Request, Response } from 'express';
import Report, {IReport} from '../models/Report';

function noSQLInjection(data:object | string) {
  let dataStr = JSON.stringify(data);
    dataStr = dataStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`,
    );
  const dataJSON = JSON.parse(dataStr);
  return dataJSON;
}

export async function getReports(
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
  
      query = Report.find(filters);
  
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
        query = query.sort("-reportDate");
      }
    const reports = await query;
    res.status(200).json({
      success: true,
      reports: reports,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, msg: 'Server error' });
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

    await Report.updateOne(
      { _id: req.params.id },
      { $set: { isIgnore } }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, msg: "Server Error" });
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
      res.status(500).json({ success: false, msg: "Server Error" });
    }
  }
}