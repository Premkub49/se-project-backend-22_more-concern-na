import express from 'express';
import { authorize, protect } from '../middleware/auth';
import { addRespond, updateRespond } from '../controllers/responds';

const router = express.Router({ mergeParams: true });

router.route('/').post(protect, addRespond).put(protect, updateRespond);

export default router;