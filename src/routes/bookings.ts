import {
  addBooking,
  deleteBooking,
  getBooking,
  getBookings,
  updateBooking,
} from '../controllers/bookings';
import express from 'express';
import { authorize, protect } from '../middleware/auth';

const router = express.Router();

router.route('/').get(protect, getBookings).post(protect,authorize("user"),addBooking);

router
  .route('/:id')
  .get(protect, getBooking)
  .put(protect, updateBooking)
  .delete(protect, deleteBooking);

export default router;
