import { NextFunction, Request, Response } from 'express';
import Hotel, { IHotel } from '../models/Hotel';
import { BookingType } from 'models/Booking';
export async function getHotels(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const hotels = await Hotel.find();
    if (!hotels) {
      res.status(404).json({ success: false, msg: 'Not Found Hotel' });
      return;
    }
    res.status(200).json({
      success: true,
      hotels: hotels,
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

export async function getHotel(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const hotelId = req.params.id;
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      res.status(404).json({ success: false, msg: 'Not Found Hotel' });
      return;
    }
    res.status(200).json({
      success: true,
      hotel: hotel,
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

export async function addHotel(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const reqBody = req.body;
    await Hotel.insertOne(reqBody);
    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

export async function updateHotel(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const reqBody = req.body;
    await Hotel.updateOne({ _id: req.params.id }, reqBody);
    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

export async function deleteHotel(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await Hotel.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}
