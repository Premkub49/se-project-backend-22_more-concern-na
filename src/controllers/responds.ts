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

      if(review.reply) {
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
         title: req.body.title as string,
         text: req.body.text as string,
      }
      if (
         respond.text == null || 
         respond.text.trim() === ""
       ){
         res
        .status(400)
        .json({ success: false, msg: 'Rating, title, and text are required' });
         return;
       }
      if(respond) 
      await Review.updateOne({_id: reviewId},{$set: {reply: respond}});
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
      if(!review.reply) {
         res.status(400).json({ success: false, msg: "Respond not found" });
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
         title: req.body.title as string,
         text: req.body.text as string,
         _id: review.reply._id
      }
      if (
         respond.title == null || 
         respond.text == null || 
         respond.title.trim() === "" || 
         respond.text.trim() === ""
       ){
         res
        .status(400)
        .json({ success: false, msg: 'Rating, title, and text are required' });
         return;
       }
      await Review.updateOne({_id: reviewId},{$set: {reply: respond}});
      res.status(200).json({ success: true });
   } catch (err: any) {
      console.error(err.stack);
      responseErrorMsg(res,500,err,'Server error');
   }
}

export async function deleteRespond( req: Request, res: Response, next: NextFunction) {
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
      if(!review.reply) {
         res.status(400).json({ success: false, msg: "Respond not found" });
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
      await Review.updateOne({_id: reviewId},{$set: {reply: null}});
      res.status(200).json({ success: true});
   }
   catch (err: any) {
      console.error(err.stack);
      responseErrorMsg(res,500,err,'Server error');
   }
}