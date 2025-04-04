import express from 'express';
import { getBookings } from 'controllers/bookings';
import { protect } from '../middleware/auth';

const router = express.Router();

router
  .route('/')
  .get(getBookings)

export default router;