import express from 'express';
import { addHotel, checkAvailable, deleteHotel, getHotel, getHotels, updateHotel } from '../controllers/hotels';
import { authorize, protect } from '../middleware/auth';

const router = express.Router();

router.route('/').get(getHotels).post(protect, addHotel);
router.route('/:id')
.get(getHotel)
.put(protect,authorize("admin","hotelManager"),updateHotel)
.delete(protect,authorize("admin","hotelManager"),deleteHotel);
router.route('/:id/available').get(protect,checkAvailable);
export default router;
