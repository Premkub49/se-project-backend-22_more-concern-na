import {
  addBooking,
  checkInBooking,
  completeBooking,
  deleteBooking,
  getBooking,
  getBookings,
  updateBooking,
} from '../controllers/bookings';
import express from 'express';
import { authorize, protect } from '../middleware/auth';
import reviewRouter from './reviews';

const router = express.Router({ mergeParams: true });;

router.use('/:bookingId/reviews', reviewRouter);

router.route('/:id/checkIn').put(protect, authorize("admin", "hotelManager"), checkInBooking);
router.route('/:id/completed').put(protect, authorize("admin", "hotelManager"), completeBooking);

router.route('/').get(protect, getBookings).post(protect,authorize("user"),addBooking);

router
  .route('/:id')
  .get(protect, getBooking)
  .put(protect, updateBooking)
  .delete(protect, deleteBooking);

export default router;
