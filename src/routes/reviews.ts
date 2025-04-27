import express from 'express';
import { authorize, protect } from '../middleware/auth';
import { addReview, deleteReview, updateReview, getReview } from '../controllers/reviews';
import routerRespond from './respond';

const router = express.Router({ mergeParams: true });

router.use('/:reviewId/respond', protect, routerRespond);

router.route('/').post(protect, authorize('user'), addReview);

router.route('/:reviewId').put(protect, updateReview).delete(protect,deleteReview).get(protect, getReview);

export default router;

/**
 * @swagger
 * /bookings/{bookingId}/reviews:
 *   post:
 *     summary: Add a new review
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               booking:
 *                 type: string
 *                 description: Booking ID (required to associate the review with a booking)
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating for the review
 *               title:
 *                 type: string
 *                 description: Title of the review
 *               text:
 *                 type: string
 *                 description: Text of the review
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Invalid input or missing booking
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /reviews/{reviewId}:
 *   get:
 *     summary: Get a review by ID
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 *   put:
 *     summary: Update a review
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Updated rating
 *               title:
 *                 type: string
 *                 description: Updated title
 *               text:
 *                 type: string
 *                 description: Updated text
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */