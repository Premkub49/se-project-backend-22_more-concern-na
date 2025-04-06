import { NextFunction, Request, Response } from 'express';

import Booking, { BookingType, IBooking, PBooking } from '../models/Booking';
import Hotel, { IHotel, Rooms } from 'models/Hotel';

function checkDayValid(
   start: string,
   end: string,
   res?: Response
) {
   const startDate = new Date(start);
   const endDate = new Date(end);
   if(endDate.getTime() - startDate.getTime() > 3 * 24 * 60 * 60 * 1000) {
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

      const conflictingBookings = await Booking.find({
         hotel: booking.hotel,
         $or: [
            {
               startDate: { $lte: booking.endDate },
               endDate: { $gte: booking.startDate },
            },
         ],
      });

      let roomsTypes: Record<string, number> = {};
      for(const booking of conflictingBookings) {
         for(const room of booking.rooms) {
            roomsTypes[room.roomType] += room.count;
         }
      }

      for(const room of rooms) {
         const roomType: Rooms|null = hotel.rooms.find(r => r.roomType === room.roomType) as Rooms|null;
         
         if(!roomType) {
            res.status(400).json({ success: false, msg: 'Please add valid room type' });
            return;
         }

         if (roomType && roomsTypes[room.roomType] + room.count > roomType.maxCount) {
            res.status(400).json({ success: false, msg: 'Not enough room' });
            return;
         }
         
         price += room.count * roomType.price;
      }

      const dayDifference = Math.ceil(
         (booking.endDate.getTime() - booking.startDate.getTime()) / (24 * 60 * 60 * 1000));

      booking.price = price * (dayDifference + 1);

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
      console.log(bookingId);
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

      const conflictingBookings = await Booking.find({
         hotel: booking.hotel,
         _id: { $ne: bookingId },
         $or: [
            {
               startDate: { $lte: booking.endDate },
               endDate: { $gte: booking.startDate },
            },
         ],
      });
      console.log(conflictingBookings);

      let roomsTypes: Record<string, number> = {};
      for(const booking of conflictingBookings) {
         for(const room of booking.rooms) {
            roomsTypes[room.roomType] += room.count;
         }
      }

      for(const room of rooms) {
         const roomType: Rooms|null = hotel.rooms.find(r => r.roomType === room.roomType) as Rooms|null;
         
         if(!roomType) {
            res.status(400).json({ success: false, msg: 'Please add valid room type' });
            return;
         }

         console.log(roomsTypes[room.roomType], room.count, roomType.maxCount);
         if (roomType && roomsTypes[room.roomType] + room.count > roomType.maxCount) {
            res.status(400).json({ success: false, msg: 'Not enough room' });
            return;
         }
         
         price += room.count * roomType.price;
      }

      const dayDifference = Math.ceil(
         (booking.endDate.getTime() - booking.startDate.getTime()) / (24 * 60 * 60 * 1000));
         
      newBooking.price = price * (dayDifference + 1);
      console.log(newBooking.price);
      

      await Booking.updateOne({ _id: bookingId }, newBooking);

      res.status(200).json({
         success: true,
      });
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