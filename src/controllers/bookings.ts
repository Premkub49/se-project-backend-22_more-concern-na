import { NextFunction, Request, Response } from 'express';

import Booking, { BookingType, IBooking, PBooking } from '../models/Booking';
import Hotel, { IHotel } from 'models/Hotel';
import { updateRemainRoomHotel } from './hotels';

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
export async function addBooking(
   req: Request,
   res: Response,
   next: NextFunction,
) {
   try {
      const booking: IBooking = req.body;
      let price = 0;
      
      if(!checkDayValid(booking.startDate.toString(), booking.endDate.toString(), res))
         return;
      
      const hotel: IHotel|null = await Hotel.findById(booking.hotel);
      if(!hotel) {
         res.status(404).json({ success: false, msg: 'Not Found Hotel' });
         return;
      }
      
      const rooms = booking.rooms;
      if(!rooms || rooms.length === 0) {
         res.status(400).json({ success: false, msg: 'Please add room' });
         return;
      }

      for(const room of rooms) {
         const roomType = hotel.rooms.find((r) => r.roomType === room.roomType);

         if(!roomType) {
            res.status(400).json({ success: false, msg: 'Please add valid room type' });
            return;
         }
         
         if(room.count > roomType.remainCount) {
            res.status(400).json({ success: false, msg: 'Not enough room' });
            return;
         }

         price += room.count * roomType.price;
      }

      booking.price = price;

      await Booking.create(booking);

      await updateRemainRoomHotel(hotel, booking.rooms, false);

      res.status(201).json({
         success: true,
      });
   } catch (err) {
      console.log(err);
      res.sendStatus(500);
   }
}