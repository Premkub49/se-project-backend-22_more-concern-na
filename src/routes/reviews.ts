import express from 'express';
import { authorize, protect } from '../middleware/auth';
import { addReview, deleteReview, updateReview, getReview } from '../controllers/review';
import routerRespond from './respond';

const router = express.Router({ mergeParams: true });

router.use('/:reviewId/respond', protect, routerRespond);

router.route('/').post(protect, authorize('user'), addReview);

router.route('/:reviewId').put(protect, updateReview).delete(protect,deleteReview).get(protect, getReview);

export default router;