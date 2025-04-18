import express from 'express';
import { authorize, protect } from '../middleware/auth';
import { addRespond, updateRespond, deleteRespond } from '../controllers/responds';

const router = express.Router({ mergeParams: true });

router.route('/').post(protect, addRespond).put(protect, updateRespond).delete(protect, deleteRespond);

export default router;