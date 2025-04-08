import { NextFunction, Request, Response } from 'express';

import Booking, { BookingType, IBooking, PBooking } from '../models/Booking';
import Hotel, { IHotel, Rooms } from '../models/Hotel';

export function checkDayValid(start: string, end: string, res?: Response) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (endDate.getTime() - startDate.getTime() > 3 * 24 * 60 * 60 * 1000) {
    if (res)
      res
        .status(400)
        .json({ success: false, msg: 'cannot booking exceed 3 days' });
    return false;
  }

  return true;
}

export function checkBookingValid(req: Request, res: Response) {
  const booking = req.body;
  if (!booking.hotel) {
    res.status(400).json({ success: false, msg: 'Please add hotel' });
    return false;
  }

  if (!booking.startDate) {
    res.status(400).json({ success: false, msg: 'Please add start date' });
    return false;
  }

  if (!booking.endDate) {
    res.status(400).json({ success: false, msg: 'Please add end date' });
    return false;
  }

  if (!booking.rooms || booking.rooms.length === 0) {
    res.status(400).json({ success: false, msg: 'Please add room' });
    return false;
  }

  return true;
}

export async function checkRoomsValidAndCalculatePrice(
  booking: IBooking,
  hotel: IHotel,
  rooms: BookingType[],
  res: Response,
  isUpdate: boolean = false,
): Promise<{ valid: boolean; price: number }> {
  if (!rooms || rooms.length === 0) {
    res.status(400).json({ success: false, msg: 'Please add room' });
    return { valid: false, price: 0 };
  }

  let price = 0;
  let conflictingBookings: IBooking[] = [];
  if(!isUpdate) {
    conflictingBookings = await Booking.find({
      hotel: booking.hotel,
      $or: [
        {
          startDate: { $lte: booking.endDate },
          endDate: { $gte: booking.startDate },
        }
      ]
    });
  }
  else {
    conflictingBookings = await Booking.find({
      hotel: booking.hotel,
      _id: { $ne: booking._id },
      $or: [
        {
          startDate: { $lte: booking.endDate },
          endDate: { $gte: booking.startDate },
        }
      ]
    });
  }

  let roomsTypes: Record<string, number> = {};
  for (const booking of conflictingBookings) {
    for (const room of booking.rooms) {
      if (roomsTypes[room.roomType] === undefined) {
        roomsTypes[room.roomType] = 0;
      }
      roomsTypes[room.roomType] += room.count;
    }
  }

  for (const room of rooms) {
    const roomType: Rooms | null = hotel.rooms.find(
      (r) => r.roomType === room.roomType,
    ) as Rooms | null;

    if (!roomType) {
      res
        .status(400)
        .json({ success: false, msg: 'Please add valid room type' });
      return { valid: false, price: 0 };
    }

    if (roomsTypes[room.roomType] + room.count > roomType.maxCount) {
      res.status(400).json({ success: false, msg: 'Not enough room' });
      return { valid: false, price: 0 };
    }

    price += room.count * roomType.price;
  }

  const dayDifference = Math.ceil(
    (booking.endDate.getTime() - booking.startDate.getTime()) /
      (24 * 60 * 60 * 1000),
  );

  price = price * (dayDifference + 1);

  return { valid: true, price: price };
}

export async function getBookings(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, msg: 'Not authorized to access this route' });
      return;
    }

    let bookings: PBooking[] | null;
    const populateUser = {
      path: 'user',
      select: '_id name email tel point',
    };
    const populateHotel = {
      path: 'hotel',
      select: '_id name picture ratingSum ratingCount',
    };

    if (req.user.role === 'admin') {
      bookings = (await Booking.find()
        .populate(populateUser)
        .populate(populateHotel)) as any as PBooking[] | null;
    } else if (req.user.role === 'hotelManager') {
      if (!req.user.hotel) {
        res
          .status(401)
          .json({ success: false, msg: 'Not authorized to access this route' });
        return;
      }
      bookings = (await Booking.find({ hotel: req.user.hotel })
        .populate(populateUser)
        .populate(populateHotel)) as any as PBooking[] | null;
    } else {
      bookings = (await Booking.find({ user: req.user._id })
        .populate(populateUser)
        .populate(populateHotel)) as any as PBooking[] | null;
    }

    res.status(200).json({
      success: true,
      bookings: bookings,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
}

export async function getBooking(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, msg: 'Not authorized to access this route' });
      return;
    }

    const bookingId = req.params.id;
    const populateUser = {
      path: 'user',
      select: 'name email tel point',
    };
    const populateHotel = {
      path: 'hotel',
      select: 'name picture ratingSum ratingCount',
    };
    const booking: PBooking | null = (await Booking.findById(
      bookingId,
    ).populate(populateHotel)) as any as PBooking | null;

    if (!booking) {
      res.status(404).json({ success: false, msg: 'Not Found Booking' });
      return;
    }

    if (req.user.role === 'hotelManager') {
      if (booking.hotel._id.toString() !== req.user.hotel.toString()) {
        res
          .status(401)
          .json({ success: false, msg: 'Not authorized to access this route' });
        return;
      } else {
        res.status(200).json({ success: true, booking: booking });
        return;
      }
    }

    if (
      req.user.role !== 'admin' &&
      booking.user._id.toString() !== req.user._id.toString()
    ) {
      res
        .status(401)
        .json({ success: false, msg: 'Not authorized to access this route' });
      return;
    }

    res.status(200).json({
      success: true,
      booking: booking,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
}

export async function addBooking(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, msg: 'Not authorized to access this route' });
      return;
    }

    if (req.user.role === 'user') {
      req.body.user = req.user._id;
    }

    if (req.params.hotelId) {
      req.body.hotel = req.params.hotelId;
    }

    if (!checkBookingValid(req, res)) {
      return;
    }

    const booking: IBooking = req.body;
    if (!(booking.endDate instanceof Date)) {
      booking.endDate = new Date(booking.endDate);
    }
    if (!(booking.startDate instanceof Date)) {
      booking.startDate = new Date(booking.startDate);
    }
    if (
      !checkDayValid(
        booking.startDate.toString(),
        booking.endDate.toString(),
        res,
      )
    )
      return;

    const hotel: IHotel | null = await Hotel.findById(booking.hotel);
    if (!hotel) {
      res.status(404).json({ success: false, msg: 'Not Found Hotel' });
      return;
    }

    const { valid, price: calculatedPrice } =
      await checkRoomsValidAndCalculatePrice(
        booking,
        hotel,
        booking.rooms,
        res,
      );
    if (!valid) {
      return;
    }

    booking.price = calculatedPrice;
    booking.status = 'reserved';

    await Booking.create(booking);

    res.status(201).json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
}

export async function updateBooking(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, msg: 'Not authorized to access this route' });
      return;
    }

    const bookingId = req.params.id;

    const booking: IBooking | null = await Booking.findById(bookingId);
    console.log(bookingId);
    if (!booking) {
      res.status(404).json({ success: false, msg: 'Not Found Booking' });
      return;
    }

    if (
      req.user.role !== 'admin' &&
      booking.user.toString() !== req.user._id.toString()
    ) {
      res
        .status(401)
        .json({ success: false, msg: 'Not authorized to access this route' });
      return;
    }

    const hotel: IHotel | null = await Hotel.findById(booking.hotel);
    if (!hotel) {
      res.status(404).json({ success: false, msg: 'Not Found Hotel' });
      return;
    }

    const newBooking: IBooking = req.body;

    if (
      !checkDayValid(
        newBooking.startDate.toString(),
        newBooking.endDate.toString(),
        res,
      )
    )
      return;

    const { valid, price: calculatedPrice } =
      await checkRoomsValidAndCalculatePrice(
        newBooking,
        hotel,
        newBooking.rooms,
        res,
        true
      );
    if (!valid) {
      return;
    }

    newBooking.price = calculatedPrice;

    await Booking.updateOne({ _id: bookingId }, newBooking);

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
}

export async function deleteBooking(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, msg: 'Not authorized to access this route' });
      return;
    }
    const bookingId = req.params.id;
    const booking: IBooking | null = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ success: false, msg: 'Not Found Booking' });
      return;
    }

    if (
      req.user.role !== 'admin' &&
      booking.user.toString() !== req.user._id.toString()
    ) {
      res
        .status(401)
        .json({ success: false, msg: 'Not authorized to access this route' });
      return;
    }

    const hotel: IHotel | null = await Hotel.findById(booking.hotel);
    if (!hotel) {
      res.status(404).json({ success: false, msg: 'Not Found Hotel' });
      return;
    }

    await Booking.deleteOne({ _id: bookingId });

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
}
