import { NextFunction, Request, Response } from 'express';

import Booking, { BookingType, IBooking, PBooking } from '../models/Booking';
import Hotel, { IHotel } from 'models/Hotel';

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
      if(!req.user) {
         res.status(401).json({ success: false, msg: 'Not authorize to access this route' });
         return;
      }

      let bookings: PBooking[]|null;
      const populateUser = {
         path: 'user',
         select: '_id name email tel point'
      }
      const populateHotel = {
         path: 'hotel',
         select: '_id name picture ratingSum ratingCount'
      }

      if(req.user.role === 'admin') {
         bookings = await Booking.find()
            .populate(populateUser)
            .populate(populateHotel) as any as PBooking[]|null;
      }
      else if(req.user.role === 'hotelManager') {
         bookings = await Booking.find()
            .populate(populateUser)
            .populate(populateHotel) as any as PBooking[]|null;
      }
      else {
         bookings = await Booking.find({user: req.user._id})
            .populate(populateUser)
            .populate(populateHotel) as any as PBooking[]|null;
      }

      res.status(200).json({
         success: true,
         bookings: bookings
      });
   } catch (err) {
      console.log(err);
      res.sendStatus(500);
   }
}

export async function getBooking(
   req: Request,
   res: Response,
   next: NextFunction,
) {
   try {
      if(!req.user) {
         res.status(401).json({ success: false, msg: 'Not authorize to access this route' });
         return;
      }

      const bookingId = req.params.id;
      const populateUser = {
         path: 'user',
         select: 'name email tel point'
      }
      const populateHotel = {
         path: 'hotel',
         select: 'name picture ratingSum ratingCount'
      }
      const booking: PBooking|null = await Booking.findById(bookingId)
         .populate(populateHotel) as any as PBooking|null;

      if(!booking) {
         res.status(404).json({ success: false, msg: 'Not Found Booking' });
         return;
      }

      // if(req.user.role === 'hotelManager') {
      //    const hotel: IHotel|null = await Hotel.findById(booking.hotel);
      //    if(!hotel) {
      //       return res.status(404).json({ success: false, msg: 'Not Found Hotel' });
      //    }
         


      // }

      if(req.user.role !== 'admin' && booking.user._id !== req.user._id) {
         res.status(401).json({ success: false, msg: 'Not authorize to access this route' });
         return;
      }

      res.status(200).json({
         success: true,
         booking: booking,
      });
   } catch (err) {
      console.log(err);
      res.sendStatus(500);
   }
}

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


      res.status(201).json({
         success: true,
      });
   } catch (err) {
      console.log(err);
      res.sendStatus(500);
   }
}

export async function updateBooking(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      if(!req.user) {
         res.status(401).json({ success: false, msg: 'Not authorize to access this route' });
         return;
      }

      const bookingId = req.params.id;
      const booking: IBooking|null = await Booking.findById(bookingId);
      if(!booking) {
         res.status(404).json({ success: false, msg: 'Not Found Booking' });
         return;
      }

      if(req.user.role !== 'admin' && booking.user !== req.user._id) {
         res.status(401).json({ success: false, msg: 'Not authorize to access this route' });
         return;
      }

      const hotel: IHotel|null = await Hotel.findById(booking.hotel);
      if(!hotel) {
         res.status(404).json({ success: false, msg: 'Not Found Hotel' });
         return;
      }

      const newBooking: IBooking = req.body;

      if(!checkDayValid(newBooking.startDate.toString(), newBooking.endDate.toString(), res))
         return;

      let price = 0;
      const rooms = newBooking.rooms;

      for(const room of rooms) {
         const roomType = hotel.rooms.find((r) => r.roomType === room.roomType);
         const oldRoom = booking.rooms.find((r) => r.roomType === room.roomType);

         if(!roomType) {
            res.status(400).json({ success: false, msg: 'Please add valid room type' });
            return;
         }
         
         if(room.count > roomType.remainCount + (oldRoom? oldRoom.count: 0)) {
            res.status(400).json({ success: false, msg: 'Not enough room' });
            return;
         }

         price += room.count * roomType.price;
      }

      newBooking.price = price;

      await Booking.updateOne({ _id: bookingId }, newBooking);
   }
   catch (err) {
      console.log(err);
      res.sendStatus(500);
   }
}

export async function deleteBooking(
   req: Request,
   res: Response,
   next: NextFunction,
) {
   try {
      if(!req.user) {
         res.status(401).json({ success: false, msg: 'Not authorize to access this route' });
         return;
      }
      const bookingId = req.params.id;
      const booking: IBooking|null = await Booking.findById(bookingId);
      if(!booking) {
         res.status(404).json({ success: false, msg: 'Not Found Booking' });
         return;
      }

      if(req.user.role !== 'admin' && booking.user !== req.user._id) {
         res.status(401).json({ success: false, msg: 'Not authorize to access this route' });
         return;
      }

      const hotel: IHotel|null = await Hotel.findById(booking.hotel);
      if(!hotel) {
         res.status(404).json({ success: false, msg: 'Not Found Hotel' });
         return;
      }

      await Booking.deleteOne({ _id: bookingId });

      res.status(200).json({
         success: true,
      });
   } catch (err) {
      console.log(err);
      res.sendStatus(500);
   }
}