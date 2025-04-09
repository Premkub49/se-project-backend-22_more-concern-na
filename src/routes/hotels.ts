import express from 'express';
import { addHotel, checkAvailable, deleteHotel, getHotel, getHotels, updateHotel } from '../controllers/hotels';
import { authorize, protect } from '../middleware/auth';
import bookingRouter from './bookings';
import { addRoom, deleteRoom, updateRoom } from '../controllers/rooms';

const router = express.Router();

router.use('/:hotelId/bookings', bookingRouter);

router.route('/').get(getHotels).post(protect,authorize("admin"), addHotel);
router.route('/:hotelId')
.get(getHotel)
.put(protect,authorize("admin","hotelManager"),updateHotel)
.delete(protect,authorize("admin"),deleteHotel);
router.route('/:hotelId/available').get(protect,checkAvailable);
router.route('/:hotelId/rooms').post(protect,authorize("admin","hotelManager"),addRoom)
router.route('/:hotelId/rooms/:roomId').put(protect,authorize("admin","hotelManager"),updateRoom)
.delete(protect, authorize("admin", "hotelManager"), deleteRoom);
export default router;
