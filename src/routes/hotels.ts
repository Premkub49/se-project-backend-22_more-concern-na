import express from 'express';
import { addHotel, getHotels } from '../controllers/hotels';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/').get(getHotels).post(protect, addHotel);
export default router;
