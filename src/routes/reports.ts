import { getReports, updateReport, addReport } from '../controllers/reports';
import express from 'express';
import { authorize, protect } from '../middleware/auth';

const router = express.Router();

router.route('/').get(protect,authorize("admin"),getReports)
.post(protect,authorize("hotelManager"),addReport);
router.route('/:id').put(protect,authorize("admin"),updateReport);

export default router;

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Get all reports
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of reports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Add a new report
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               review:
 *                 type: string
 *                 description: Review ID
 *               reportReason:
 *                 type: string
 *                 enum: ['pedo', 'bully', 'suicide', 'violence', 'nsfw', 'spam', 'scam', 'other']
 *                 description: Reason for the report
 *     responses:
 *       201:
 *         description: Report created successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /reports/{id}:
 *   put:
 *     summary: Update a report
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isIgnore:
 *                 type: boolean
 *                 description: Whether to ignore the report
 *     responses:
 *       200:
 *         description: Report updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Report not found
 */
