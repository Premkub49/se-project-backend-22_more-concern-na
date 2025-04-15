import { Request, Response, NextFunction } from "express";
import Booking, { IBooking } from "../models/Booking";
import Review, { IReview } from "../models/Review";
import mongoose from "mongoose";

export async function getReview(req: Request, res: Response, next: NextFunction) {
   try {
      if(!req.user) {
         res.status(401).json({ success: false, msg: "Not authorized to access this route" });
         return;
      }

      const reviewId = req.params.reviewId;
      const review: IReview | null = await Review.findById(reviewId).populate("reply").populate("booking") as any as IReview | null;

      if (!review) {
         res.status(404).json({ success: false, msg: "Review not found" });
         return;
      }

      const booking: IBooking | null = await Booking.findById(review.booking);
      if (!booking) {
         res.status(404).json({ success: false, msg: "Booking not found" });
         return;
      }

      if(req.user.role !== "admin" && (req.user.role!=="hotelManager"||req.user.hotel!==booking.hotel)&& booking.user.toString() !== req.user._id.toString()) {
         res.status(403).json({ success: false, msg: "Not authorized to access this route" });
         return;
      }

      res.status(200).json({ success: true, data: review });
   } catch (error: any) {
      console.error(error.stack);
      res.status(500).json({ success: false, msg: "Server Error" });
   }
}

export async function addReview(req: Request, res: Response, next: NextFunction) {
   try {
      if(!req.user) {
         res.status(401).json({ success: false, msg: "Not authorized to access this route" });
         return;
      }
      if(!req.params.bookingId){
         res.status(400).json({ success: false, msg: "Booking ID is required" });
         return;
      }
      const bookingId = req.params.bookingId;
      const booking: IBooking | null = await Booking.findById(bookingId)

      if (!booking) {
         res.status(404).json({ success: false, msg: "Booking not found" });
         return;
      }

      if(req.user.role !== "admin" && booking.user.toString() !== req.user._id.toString()) {
         res.status(403).json({ success: false, msg: "Not authorized to access this route" });
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

      if (req.body.reply) {
         res.status(400).json({ success: false, msg: "Cannot create a review with a reply field" });
         return;
      }
      
      if (!req.body.rating || !req.body.title || !req.body.text) {
         res.status(400).json({ success: false, msg: "Rating, title, and text are required" });
         return;
      }

      const review: IReview = req.body;
      review.booking = new mongoose.Types.ObjectId(bookingId) as any;

      await Review.create(review);
      res.status(201).json({ success: true });
   } catch (error: any) {
      console.error(error.stack);
      res.status(500).json({ success: false, msg: "Server Error" });
   }
}

export async function updateReview(req: Request, res: Response, next: NextFunction) {
   try {
      if(!req.user) {
         res.status(401).json({ success: false, msg: "Not authorized to access this route" });
         return;
      }

      const reviewId = req.params.reviewId;
      const review: IReview | null = await Review.findById(reviewId);

      if (!review) {
         res.status(404).json({ success: false, msg: "Review not found" });
         return;
      }

      if(!review.booking) {
         res.status(400).json({ success: false, msg: "Review does not have a booking" });
         return;
      }

      const booking: IBooking | null = await Booking.findById(review.booking);
      if (!booking) {
         res.status(404).json({ success: false, msg: "Booking not found" });
         return;
      }

      if(req.user.role !== "admin" && booking.user.toString() !== req.user._id.toString()) {
         console.log("User ID:", req.user._id.toString());
         res.status(403).json({ success: false, msg: "Not authorized to access this route" });
         return;
      }

      const { rating, title, text } = req.body;
      if (!rating || !title || !text) {
         res.status(400).json({ success: false, msg: "Rating, title, and text are required" });
         return;
      }

      await Review.updateOne({ _id: reviewId }, { $set: { rating, title, text } });
      res.status(200).json({ success: true });
   } catch (error: any) {
      console.error(error.stack);
      res.status(500).json({ success: false, msg: "Server Error" });
   }
}

export const getHotelReviews = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const bookings = await Booking.find({ hotel: req.params.hotelId }).select("_id user").populate("user");
      const bookingIds = bookings.map((booking) => booking._id);
      const yourBooking = bookings.map((booking) => booking.user);

      // pagination
      const selfPage = typeof req.query.selfPage === 'string' ? parseInt(req.query.selfPage, 10) : 1;
      const selfPageSize = typeof req.query.selfPageSize === 'string' ? parseInt(req.query.selfPageSize, 10) : 5;
      const selfStartIndex = (selfPage - 1) * selfPageSize;
      const selfEndIndex = selfPage * selfPageSize;
      const selfTotal = await Review.countDocuments({ booking: { $in: bookingIds.filter(id => yourBooking.includes(id)) }});
      const selfReview = await Review.find({ booking: { $in: bookingIds.filter(id => yourBooking.includes(id)) }})
         .populate("booking")
         .populate("reply")
         .skip(selfStartIndex)
         .limit(selfPageSize);

      // pagination for other reviews
      const otherPage = typeof req.query.otherPage === 'string' ? parseInt(req.query.otherPage, 10) : 1;
      const otherPageSize = typeof req.query.otherPageSize === 'string' ? parseInt(req.query.otherPageSize, 10) : 5;
      const otherStartIndex = (otherPage - 1) * otherPageSize;
      const otherEndIndex = otherPage * otherPageSize;
      const otherTotal = await Review.countDocuments({ booking: { $in: bookingIds.filter(id => !yourBooking.includes(id)) }});
      const otherReview = await Review.find({ booking: { $in: bookingIds.filter(id=>!yourBooking.includes(id)) } })
         .populate("booking")
         .populate("reply")
         .skip(otherStartIndex)
         .limit(otherPageSize);

      // executing pagination for self reviews
      const selfPagination: { next?: { page: number; limit: number }; prev?: { page: number; limit: number }; count:number } = { count: selfTotal};
      if (selfEndIndex < selfTotal) selfPagination.next = { page: selfPage + 1, limit: selfPageSize };
      if (selfStartIndex > 0) selfPagination.prev = { page: selfPage - 1, limit: selfPageSize};
      // executing pagination for other reviews
      const otherPagination: { next?: { page: number; limit: number }; prev?: { page: number; limit: number }; count:number } = { count: otherTotal };
      if (otherEndIndex < otherTotal) otherPagination.next = { page: otherPage + 1, limit: otherPageSize };
      if (otherStartIndex > 0) otherPagination.prev = { page: otherPage - 1, limit: otherPageSize };
      
      res.status(200).json({ success: true, 
         self: {pagination:selfPagination,data:selfReview}, 
         other: {pagination:otherPagination,data:otherReview}});
         
   } catch (error: any) {
      console.error(error.stack);
      res.status(500).json({ success: false, msg: "Server Error" });
   }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
   try {
      if (!req.user) {
         res.status(401).json({ success: false, msg: "Not authorized to access this route" });
         return;
      }

      const reviewId = req.params.reviewId;
      const review: IReview | null = await Review.findById(reviewId);

      if (!review) {
         res.status(404).json({ success: false, msg: "Review not found" });
         return;
      }

      const booking: IBooking | null = await Booking.findById(review.booking);

      if (!booking) {
         res.status(404).json({ success: false, msg: "Booking not found" });
         return;
      }

      if (req.user.role !== "admin" && booking.user.toString() !== req.user._id.toString()) {
         res.status(403).json({ success: false, msg: "Not authorized to access this route" });
         return;
      }

      await Review.deleteOne({ _id: reviewId });
      res.status(200).json({ success: true });
   } catch (error: any) {
      console.error(error.stack);
      res.status(500).json({ success: false, msg: "Server Error" });
   }
};