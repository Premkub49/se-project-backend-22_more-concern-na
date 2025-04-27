import {
  addBooking,
  checkInBooking,
  completeBooking,
  deleteBooking,
  getBooking,
  getBookings,
  updateBooking,
} from '../controllers/bookings';
import express from 'express';
import { authorize, protect } from '../middleware/auth';
import reviewRouter from './reviews';

const router = express.Router({ mergeParams: true });;

router.use('/:bookingId/reviews', reviewRouter);

router.route('/:id/checkIn').put(protect, authorize("admin", "hotelManager"), checkInBooking);
router.route('/:id/completed').put(protect, authorize("admin", "hotelManager"), completeBooking);
router.route('/').get(protect, getBookings)
.post(protect,authorize("user"),addBooking);
router
  .route('/:id')
  .get(protect, getBooking)
  .put(protect, updateBooking)
  .delete(protect, deleteBooking);
/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
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
 *                     $ref: '#/components/schemas/Booking'
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /bookings/{id}/checkIn:
 *   put:
 *     summary: Check in a booking
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking checked in successfully
 *       400:
 *         description: Invalid booking status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */

/**
 * @swagger
 * /bookings/{id}/completed:
 *   put:
 *     summary: Mark a booking as completed
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking marked as completed successfully
 *       400:
 *         description: Invalid booking status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get a booking by ID
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 *   put:
 *     summary: Update a booking
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 *   delete:
 *     summary: Delete a booking
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */

export default router;
