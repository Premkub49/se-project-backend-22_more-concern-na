import { NextFunction, Request, Response } from 'express';

import Booking from '../models/Booking';

export async function getBookings(
   req: Request,
   res: Response,
   next: NextFunction,
) {
   try {
      const bookings = await Booking.find();

      if (!bookings) {
         res.status(404).json({ success: false, msg: 'Not Found Booking' });
         return;
      }
      res.status(200).json({
         success: true,
         bookings: bookings,
      });
   } catch (err) {
      console.log(err);
      res.sendStatus(500);
   }
}