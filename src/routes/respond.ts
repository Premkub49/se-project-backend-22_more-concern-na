import express from 'express';
import { authorize, protect } from '../middleware/auth';
import { addRespond, updateRespond, deleteRespond } from '../controllers/responds';

const router = express.Router({ mergeParams: true });

router.route('/')
.post(protect, addRespond)
.put(protect, updateRespond)
.delete(protect, deleteRespond);

export default router;

/**
 * @swagger
 * /reviews/{reviewId}/respond:
 *   post:
 *     summary: Add a respond to a review
 *     tags: [Responds]
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
 *               title:
 *                 type: string
 *                 description: Title of the respond
 *               text:
 *                 type: string
 *                 description: Text of the respond
 *     responses:
 *       201:
 *         description: Respond added successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */

/**
 * @swagger
 * /reviews/{reviewId}/respond:
 *   put:
 *     summary: Update a respond to a review
 *     tags: [Responds]
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
 *               title:
 *                 type: string
 *                 description: Updated title of the respond
 *               text:
 *                 type: string
 *                 description: Updated text of the respond
 *     responses:
 *       200:
 *         description: Respond updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Respond not found
 */

/**
 * @swagger
 * /reviews/{reviewId}/respond:
 *   delete:
 *     summary: Delete a respond from a review
 *     tags: [Responds]
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
 *         description: Respond deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Respond not found
 */