import { Request, Response, NextFunction } from "express";
import Review from "../models/Review";
import mongoose from "mongoose";
import responseErrorMsg from "./libs/responseMsg";

export async function addRespond( req: Request, res: Response, next: NextFunction) {
   try {
      if(!req.user) {
         res.status(401).json({ success: false, msg: "Not authorized to access this route" });
         return;
      }

      if(req.user.role !== "admin" && req.user.role !== "hotelManager") {
         res.status(401).json({ success: false, msg: "Not authorized to access this route" });
         return;
      }

      const populateBooking = {
         path: 'booking',
         select: 'hotel'
      }
      const review: any = await Review.findById(req.params.reviewId).populate(populateBooking);
      if(!review) {
         res.status(404).json({ success: false, msg: "Review not found" });
         return;
      }

      const respondExists = await Review.findOne({ parentReviewId: req.params.reviewId });
      if(respondExists) {
         res.status(400).json({ success: false, msg: "Respond already exists" });
         return;
      }

      if(!review.booking) {
         res.status(404).json({ success: false, msg: "Booking not found" });
         return;
      }
      if(req.user.role !== 'admin' && review.booking.hotel.toString() !== req.user.hotel?.toString()) {
         res.status(403).json({ success: false, msg: "Not authorized to access this route" });
         return;
      }
      const reviewId = new mongoose.Types.ObjectId(req.params.reviewId);
      const respond = {
         parentReviewId: reviewId,
         title: req.body.title as string,
         text: req.body.text as string,
      }

      const reply = await Review.create(respond);
      await Review.updateOne({_id: reviewId},{$set: {reply: reply._id}});
      res.status(201).json({ success: true });
   } catch (err: any) {
      console.error(err.stack);
      //res.status(500).json({ success: false, msg: "Server Error" });
      responseErrorMsg(res,500,err,'Server error');
   }
}

export async function updateRespond( req: Request, res: Response, next: NextFunction) {
   try {
      if(!req.user) {
         res.status(401).json({ success: false, msg: "Not authorized to access this route" });
         return;
      }

      const respond: any = await Review.findById(req.params.respondId);
      if(!respond) {
         res.status(404).json({ success: false, msg: "Respond not found" });
         return;
      }

      const populateBooking = {
         path: 'booking',
         select: 'hotel'
      }
      console.log(respond.parentReiewId);
      const review: any = await Review.findById(respond.parentReviewId).populate(populateBooking);
      if(!review) {
         res.status(404).json({ success: false, msg: "Review not found" });
         return;
      }
      if(!review.booking) {
         res.status(404).json({ success: false, msg: "Booking not found" });
         return;
      }

      if(req.user.role !== 'admin' && review.booking.hotel.toString() !== req.user.hotel?.toString()) {
         res.status(403).json({ success: false, msg: "Not authorized to access this route" });
         return;
      }

      if(!req.body.title && !req.body.text) {
         res.status(400).json({ success: false, msg: "Please provide title or text" });
         return;
      }

      if(req.body.title) {
         respond.title = req.body.title;
      }
      if(req.body.text) {
         respond.text = req.body.text;
      }

      await respond.save();
      res.status(200).json({ success: true });
   } catch (err: any) {
      console.error(err.stack);
      //res.status(500).json({ success: false, msg: "Server Error" });
      responseErrorMsg(res,500,err,'Server error');
   }
}