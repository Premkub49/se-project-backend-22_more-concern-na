import express from 'express';
import { getBooking, getBookings } from 'controllers/bookings';
import { protect } from '../middleware/auth';

const router = express.Router();

router
  .route('/')
  .get(protect, getBookings)

router
  .route('/:id')
  .get(protect, getBooking)

export default router;