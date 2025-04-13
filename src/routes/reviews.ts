import express from 'express';
import { authorize, protect } from '../middleware/auth';
import { addReview, deleteReview, updateReview } from 'controllers/review';
import routerRespond from './respond';

const router = express.Router({ mergeParams: true });

router.use('/:reviewId/respond', protect, authorize('admin', 'hotelManager'), routerRespond);

router.route('/').post(protect, addReview);

router.route('/:id').put(protect, updateReview).delete(protect,deleteReview);

export default router;