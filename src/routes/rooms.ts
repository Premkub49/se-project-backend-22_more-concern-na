import express from "express";
import { addRoom, deleteRoom, updateRoom } from '../controllers/rooms';
import { authorize, protect } from '../middleware/auth';
const router = express.Router();
router.route('/').post(protect,authorize("admin","hotelManager"),addRoom)
router.route('/:roomId').put(protect,authorize("admin","hotelManager"),updateRoom)
.delete(protect, authorize("admin", "hotelManager"), deleteRoom);

export default router;