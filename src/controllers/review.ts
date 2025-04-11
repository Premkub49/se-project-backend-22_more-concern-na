import { Request, Response, NextFunction } from "express";
import Booking, { IBooking } from "models/Booking";
import Review, { IReview } from "models/Review";
import mongoose from "mongoose";

export async function addReview(req: Request, res: Response, next: NextFunction) {
   try {
      if(!req.user) {
         res.status(401).json({ success: false, msg: "Not authorized to access this route" });
         return;
      }

      const bookingId = req.params.bookingId;
      const booking: IBooking | null = await Booking.findById(bookingId)

      if (!booking) {
         res.status(404).json({ success: false, msg: "Booking not found" });
         return;
      }

      if(req.user.role !== "admin" && booking.user.toString() !== req.user._id.toString()) {
         res.status(401).json({ success: false, msg: "Not authorized to access this route" });
         return;
      }

      if(booking.status !== "completed") {
         res.status(400).json({ success: false, msg: "Booking is not completed" });
         return;
      }

      const reviewExists = await Review.findOne({ booking: bookingId });
      if (reviewExists) {
         res.status(400).json({ success: false, msg: "Review already exists" });
         return;
      }

      const review: IReview = req.body;
      review.booking = new mongoose.Schema.Types.ObjectId(bookingId);

      await Review.create(review);
      res.status(201).json({ success: true });
   } catch (error: any) {
      console.error(error.stack);
      res.status(500).json({ success: false, msg: "Server Error" });
   }
}
