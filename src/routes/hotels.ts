import express from 'express';
import { addHotel, checkAvailable, deleteHotel, getHotel, getHotels, updateHotel } from '../controllers/hotels';
import { authorize, protect } from '../middleware/auth';
import bookingRouter from './bookings';
import roomRouter from './rooms';
import { getHotelReviews } from 'controllers/review';

const router = express.Router();

router.use('/:hotelId/bookings', bookingRouter);
router.use('/:hotelId/rooms', roomRouter);
router.route('/').get(getHotels).post(protect,authorize("admin"), addHotel);
router.route('/:hotelId')
.get(getHotel)
.put(protect,authorize("admin","hotelManager"),updateHotel)
.delete(protect,authorize("admin"),deleteHotel);

router.route('/:hotelId/available').get(protect,checkAvailable);
router.get('/:id/reviews', getHotelReviews);

export default router;
