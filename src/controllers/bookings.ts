import { NextFunction, Request, response, Response } from 'express';

import Booking, { BookingType, IBooking, PBooking } from '../models/Booking';
import Hotel, { IHotel, Rooms } from '../models/Hotel';
import responseErrorMsg from './libs/responseMsg';
import User, { IUser, UserRedeemable } from '../models/User';
import Redeemable, { IRedeemable } from '../models/Redeemable';
import { useRedeemableInInventory } from './inventory';
import Data from '../models/Data';

interface pagination {
  next?: { page: number; limit: number; };
  prev?: { page: number; limit: number; };
  count?: number;
}

export function checkDayValid(start: string, end: string, res?: Response) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (startDate > endDate) {
    if (res)
      res.status(400).json({ success: false, msg: 'Start date must be before end date' });
    return false;
  }
  if( startDate === endDate) {
    if (res)
      res.status(400).json({ success: false, msg: 'Start date and end date must be different' });
    return false;
  }
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

export async function checkValidCoupon(
  couponId: string,
  user: IUser | null,
  res?: Response,
  type: string = 'addBooking'
): Promise<[boolean, IRedeemable | null]> {
  if(!couponId) {
    return [false, null];
  }

  if(!user) {
    if (res)
      res.status(401).json({ success: false, msg: 'Not authorized to access this route' });
    return [false, null];
  }

  const coupon: IRedeemable | null = await Redeemable.findById(couponId);
  const userCoupon = user.inventory.find((item) => item.redeemableId.toString() === couponId);

  if (!coupon) {
    if (res)
      res.status(404).json({ success: false, msg: 'Not Found Coupon' });
    return [false, null];
  }

  if (coupon.type !== 'coupon') {
    if (res)
      res.status(400).json({ success: false, msg: 'Not a Coupon' });
    return [false, null];
  }

  if (!userCoupon) {
    if (res)
      res.status(404).json({ success: false, msg: 'Not Found Coupon in User Inventory' });
    return [false, null];
  }

  if (type === 'addBooking' && coupon.expire && coupon.expire < new Date()) {
    if (res)
      res.status(400).json({ success: false, msg: 'Coupon has expired' });
    return [false, null];
  }

  return [true, coupon];
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
  const endDate = new Date(booking.endDate);
  const startDate = new Date(booking.startDate);
  const dayDifference = Math.ceil(
    (endDate.getTime() - startDate.getTime()) /
      (24 * 60 * 60 * 1000),
  );

  price = price * dayDifference;

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

    let queryPast: any;
    let queryActive: any;
    let queryUpcoming: any;

    const populateUser = {
      path: 'user',
      select: '_id name email tel point',
    };
    const populateHotel = {
      path: 'hotel',
      select: '_id name tel buildingNumber street district province postalCode picture ratingSum ratingCount',
    };

    if (req.user.role === 'admin') {
      queryPast = Booking.find({ status: 'completed' })
        .populate(populateUser)
        .populate(populateHotel);
      queryActive = Booking.find({ status: 'checkedIn' })
        .populate(populateUser)
        .populate(populateHotel);
      queryUpcoming = Booking.find({ status: 'reserved' })
        .populate(populateUser)
        .populate(populateHotel);
    } else if (req.user.role === 'hotelManager') {
      if (!req.user.hotel) {
        res
          .status(401)
          .json({ success: false, msg: 'Not authorized to access this route' });
        return;
      }
      queryPast = Booking.find({ hotel: req.user.hotel, status: 'completed' })
        .populate(populateUser)
        .populate(populateHotel);
      queryActive = Booking.find({ hotel: req.user.hotel, status: 'checkedIn' })
        .populate(populateUser)
        .populate(populateHotel);
      queryUpcoming = Booking.find({ hotel: req.user.hotel, status: 'reserved' })
        .populate(populateUser)
        .populate(populateHotel);
    } else {
      queryPast = Booking.find({ user: req.user._id, status: 'completed' })
        .populate(populateUser)
        .populate(populateHotel);
      queryActive = Booking.find({ user: req.user._id, status: 'checkedIn' })
        .populate(populateUser)
        .populate(populateHotel);
      queryUpcoming = Booking.find({ user: req.user._id, status: 'reserved' })
        .populate(populateUser)
        .populate(populateHotel);
    }

    if (!queryPast && !queryActive && !queryUpcoming) {
      res.status(404).json({ success: false, msg: 'Not Found Booking' });
      return;
    }

    const pastPage = parseInt(req.query.pastPage as string) || 1;
    const pastPageSize = parseInt(req.query.pastPageSize as string) || 10;
    
    const activePage = parseInt(req.query.activePage as string) || 1;
    const activePageSize = parseInt(req.query.activePageSize as string) || 10;

    const upcomingPage = parseInt(req.query.upcomingPage as string) || 1;
    const upcomingPageSize = parseInt(req.query.upcomingPageSize as string) || 10;

    const past: { pagination?: pagination, data?: IBooking[] } = {};
    const active: { pagination?: pagination, data?: IBooking[] } = {};
    const upcoming: { pagination?: pagination, data?: IBooking[] } = {};
    let sumTotal = 0;
    for (const { query, data, page, pageSize } of [
      { query: queryPast, data: past, page: pastPage, pageSize: pastPageSize },
      { query: queryActive, data: active, page: activePage, pageSize: activePageSize },
      { query: queryUpcoming, data: upcoming, page: upcomingPage, pageSize: upcomingPageSize },
    ]) {
      const startIndex = (page - 1) * pageSize;
      const endIndex = page * pageSize;
      const total = await query.clone().countDocuments();
      sumTotal += total;
      if (!data.pagination) {
        data.pagination = {};
      }
      if(endIndex < total) {
        if(page == Math.ceil(total / pageSize) - 1) {
          data.pagination.next = { page: page + 1 , limit: total % pageSize };
        }
        else {
          data.pagination.next = { page: page + 1, limit: pageSize };
        }
      }
      if(startIndex > 0) {
        data.pagination.prev = { page: page - 1, limit: pageSize };
      }

      data.data = await query
        .skip(startIndex)
        .limit(pageSize)
        .sort({ createdAt: -1 })
      data.pagination.count = data.data?.length || 0;
    }
    res.status(200).json({
      success: true,
      total : sumTotal,
      past: past,
      active: active,
      upcoming: upcoming,
    });
  } catch (err:any) {
    console.log(err);
    //res.status(500).json({ success: false, msg: 'Server error' });
    responseErrorMsg(res,500,err,'Server error');
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
      select: 'name picture tel buildingNumber street district province postalCode ratingSum ratingCount',
    };
    const booking: PBooking | null = (await Booking.findById(
      bookingId,
    ).populate(populateHotel).populate(populateUser)) as any as PBooking | null;

    if (!booking) {
      res.status(404).json({ success: false, msg: 'Not Found Booking' });
      return;
    }

    if (req.user.role === 'hotelManager') {
      if (booking.hotel._id.toString() !== req.user.hotel?.toString()) {
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
  } catch (err:any) {
    console.log(err);
    //res.status(500).json({ success: false, msg: 'Server error' });
    responseErrorMsg(res,500,err,'Server error');
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

    let { valid, price: calculatedPrice } =
      await checkRoomsValidAndCalculatePrice(
        booking,
        hotel,
        booking.rooms,
        res,
      );
    if (!valid) {
      return;
    }

    let coupon: IRedeemable | null = null;
    const data: { price?: number; couponUsed?: boolean; discount?: number } = {};

    if (req.body.couponId) {
      const [valid, foundCoupon] = await checkValidCoupon(
        req.body.couponId,
        req.user,
        res,
      );

      if (!valid) {
        return;
      }

      if (!foundCoupon) {
        // No way
        console.log('No coupon and no way to get this message');
        res.status(404).json({ success: false, msg: 'Not Found Coupon' });
        return;
      }

      coupon = foundCoupon;

      if (coupon.discount == null) {
        // No way
        console.log('Not coupon and no way to get this message');
        res.status(400).json({ success: false, msg: 'Not a Coupon' });
        return;
      }

      const temp = calculatedPrice;
      calculatedPrice = temp - temp * coupon.discount;
      data.couponUsed = true;
      data.discount = temp - calculatedPrice;

      booking.coupon = coupon._id;
    }

    booking.price = data.price = calculatedPrice;
    booking.status = 'reserved';

    await Booking.create(booking);
    
    if (coupon) {
      req.params.redeemableId = coupon._id.toString();
      req.params.noResponse = 'true';
      await useRedeemableInInventory(req, res, next);
    }

    res.status(201).json({
      success: true,
      ...data
    });
  } catch (err:any) {
    console.log(err);
    //res.status(500).json({ success: false, msg: 'Server error' });
    responseErrorMsg(res,500,err,'Server error');
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
    if (!booking) {
      res.status(404).json({ success: false, msg: 'Not Found Booking' });
      return;
    }

    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'hotelManager' &&
      booking.user.toString() !== req.user._id.toString()
    ) {
      res
        .status(401)
        .json({ success: false, msg: 'Not authorized to access this route' });
      return;
    }

    if (req.user.role === 'hotelManager') {
      if (!req.user.hotel) {
        res
          .status(401)
          .json({ success: false, msg: 'Not authorized to access this route' });
        return;
      }
      if (booking.hotel.toString() !== req.user.hotel.toString()) {
        res
          .status(401)
          .json({ success: false, msg: 'Not authorized to access this route' });
        return;
      }
    }

    const hotel: IHotel | null = await Hotel.findById(booking.hotel);
    if (!hotel) {
      res.status(404).json({ success: false, msg: 'Not Found Hotel' });
      return;
    }

    const newBooking: IBooking = req.body;

    if(req.user.role !== 'admin' && req.user.role !== 'hotelManager') {
      newBooking.status = booking.status;
    }

    if (
      !checkDayValid(
        newBooking.startDate.toString(),
        newBooking.endDate.toString(),
        res,
      )
    )
      return;

    let { valid, price: calculatedPrice } =
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

    let coupon: IRedeemable | null = null;
    const data: { price?: number; couponUsed?: boolean; discount?: number } = {};

    console.log(booking);

    if (booking.coupon) {
      coupon = await Redeemable.findById(booking.coupon);

      if (!coupon) {
        res.status(404).json({ success: false, msg: 'Not Found Coupon' });
        return;
      }

      if (coupon.discount == null) {
        res.status(400).json({ success: false, msg: 'Not a Coupon' });
        return;
      }

      const temp = calculatedPrice;
      calculatedPrice = temp - temp * coupon.discount;
      data.couponUsed = true;
      data.discount = temp - calculatedPrice;

      booking.coupon = coupon._id;
    }
    newBooking.price = data.price = calculatedPrice;

    console.log("newBooking", newBooking);

    await Booking.updateOne({ _id: bookingId }, newBooking);

    res.status(200).json({
      success: true,
      ...data
    });
  } catch (err:any) {
    console.log(err);
    //res.status(500).json({ success: false, msg: 'Server error' });
    responseErrorMsg(res,500,err,'Server error');
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
  } catch (err:any) {
    console.log(err);
    //res.status(500).json({ success: false, msg: 'Server error' });
    responseErrorMsg(res,500,err,'Server error');
  }
}

export async function checkInBooking(
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

    if (req.user.role === 'user') {
      res
        .status(401)
        .json({ success: false, msg: 'Not authorized to access this route' });
      return;
    }

    if (req.user.role === 'hotelManager') {
      if (!req.user.hotel) {
        res
          .status(401)
          .json({ success: false, msg: 'Not authorized to access this route' });
        return;
      }
      if (booking.hotel.toString() !== req.user.hotel.toString()) {
        res
          .status(401)
          .json({ success: false, msg: 'Not authorized to access this route' });
        return;
      }
    }

    if (booking.status !== 'reserved') {
      res.status(400).json({ success: false, msg: 'Booking is not reserved' });
      return;
    }
    const user = await User.findById(booking.user);
    const priceToPoint = await Data.find({name: "priceToPoint"});
    if(!user){
      responseErrorMsg(res,404,'Booking User not found', 'Not found');
      return;
    }
    if(!priceToPoint){
      responseErrorMsg(res,404,'PriceToPoint not found', 'Not found');
      return;
    }
    const priceToPointValue = priceToPoint?.[0]?.value as number;
    /*if (typeof priceToPointValue !== 'number') {
      responseErrorMsg(res, 400, 'Invalid priceToPoint value', 'Invalid data');
      return;
    }*/
    user.point += Math.floor(booking.price / priceToPointValue);
    await user.save();
    await Booking.updateOne({ _id: bookingId }, { status: 'checkedIn' });

    res.status(200).json({
      success: true,
    });
  } catch (err:any) {
    console.log(err);
    //res.status(500).json({ success: false, msg: 'Server error' });
    responseErrorMsg(res,500,err,'Server error');
  }
}

export async function completeBooking(
  req: Request,
  res: Response,
  next: NextFunction
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

    if (req.user.role === 'user') {
      res
        .status(401)
        .json({ success: false, msg: 'Not authorized to access this route' });
      return;
    }

    if (req.user.role === 'hotelManager') {
      if (!req.user.hotel) {
        res
          .status(401)
          .json({ success: false, msg: 'Not authorized to access this route' });
        return;
      }
      if (booking.hotel.toString() !== req.user.hotel.toString()) {
        res
          .status(401)
          .json({ success: false, msg: 'Not authorized to access this route' });
        return;
      }
    }

    if (booking.status !== 'checkedIn') {
      res.status(400).json({ success: false, msg: 'Booking is not checkedIn' });
      return;
    }

    await Booking.updateOne({ _id: bookingId }, { status: 'completed' });

    res.status(200).json({
      success: true,
    });
  }
  catch (err:any) {
    console.log(err);
    //res.status(500).json({ success: false, msg: 'Server error' });
    responseErrorMsg(res,500,err,'Server error');
  }
}