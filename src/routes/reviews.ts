import express from 'express';
import { authorize, protect } from '../middleware/auth';
import { addReview, updateReview } from 'controllers/review';

const router = express.Router();

router.route('/').post(protect, addReview);

router.route('/:id').put(protect, updateReview);

export default router;