import express from 'express';
import { addHotel, getHotels } from '../controllers/hotels';
import { protect } from '../middleware/auth';
import bookingRouter from './bookings';

const router = express.Router();

router.use('/:hotelId/bookings', bookingRouter);

router.route('/').get(getHotels).post(protect, addHotel);
export default router;
