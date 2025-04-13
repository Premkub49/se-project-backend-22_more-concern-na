import express from 'express';
import { authorize, protect } from '../middleware/auth';
import { addRespond, updateRespond } from '../controllers/respond';

const router = express.Router({ mergeParams: true });

router.route('/').post(protect, addRespond);

router.route('/:respondId').put(protect, updateRespond);

export default router;