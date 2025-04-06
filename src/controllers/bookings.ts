import { NextFunction, Request, Response } from 'express';

import Booking from '../models/Booking';
function checkDayValid(
   start: string,
   end: string,
   res?: Response
) {
   const startDate = new Date(start);
   const endDate = new Date(end);
   if(endDate.getDate() - startDate.getDate() > 3 * 24 * 60 * 60 * 1000) {
      if(res)
         res.status(400).json({ success: false, msg: 'cannot booking exceed 3 days' });
      return false;
   }

   return true;
}

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