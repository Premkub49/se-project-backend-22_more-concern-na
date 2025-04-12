import express from 'express';
import { authorize, protect } from '../middleware/auth';
import { addRespond, updateRespond } from 'controllers/respond';

const router = express.Router();

router.route('/').post(protect, authorize('admin', 'hotelManager'), addRespond);

router.route('/:id').put(protect, authorize('admin', 'hotelManager'), updateRespond);

export default router;