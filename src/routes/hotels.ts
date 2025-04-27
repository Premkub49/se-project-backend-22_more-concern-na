import express from 'express';
import { addHotel, checkAvailable, deleteHotel, getHotel, getHotels, updateHotel } from '../controllers/hotels';
import { authorize, getRequestToken, protect } from '../middleware/auth';
import bookingRouter from './bookings';
import roomRouter from './rooms';
import { getHotelReviews } from '../controllers/reviews';

const router = express.Router();

router.use('/:hotelId/bookings', bookingRouter);
router.use('/:hotelId/rooms', roomRouter);
router.route('/').get(getHotels).post(protect,authorize("admin"), addHotel);
router.route('/:hotelId')
.get(getHotel)
.put(protect,authorize("admin","hotelManager"),updateHotel)
.delete(protect,authorize("admin"),deleteHotel);

router.route('/:hotelId/available').get(checkAvailable);
router.get('/:hotelId/reviews',getRequestToken, getHotelReviews);

/**
 * @swagger
 * /hotels:
 *   get:
 *     summary: Get all hotels
 *     tags: [Hotels]
 *     responses:
 *       200:
 *         description: List of hotels
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
 *                     $ref: '#/components/schemas/Hotel'
 *   post:
 *     summary: Add a new hotel
 *     tags: [Hotels]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Hotel'
 *     responses:
 *       201:
 *         description: Hotel created successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /hotels/{hotelId}:
 *   get:
 *     summary: Get a hotel by ID
 *     tags: [Hotels]
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *     responses:
 *       200:
 *         description: Hotel retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 hotel:
 *                   $ref: '#/components/schemas/Hotel'
 *       404:
 *         description: Hotel not found
 *   put:
 *     summary: Update a hotel
 *     tags: [Hotels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Hotel'
 *     responses:
 *       200:
 *         description: Hotel updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Hotel not found
 *   delete:
 *     summary: Delete a hotel
 *     tags: [Hotels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *     responses:
 *       200:
 *         description: Hotel deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Hotel not found
 */

/**
 * @swagger
 * /hotels/{hotelId}/available:
 *   get:
 *     summary: Check room availability for a hotel
 *     tags: [Hotels]
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *       - in: query
 *         name: checkin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Check-in date
 *       - in: query
 *         name: checkout
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Check-out date
 *     responses:
 *       200:
 *         description: Room availability retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 rooms:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       roomType:
 *                         type: string
 *                       remainCount:
 *                         type: integer
 *       404:
 *         description: Hotel not found
 */

/**
 * @swagger
 * /hotels/{hotelId}/reviews:
 *   get:
 *     summary: Get reviews for a hotel
 *     tags: [Hotels]
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 self:
 *                   type: object
 *                   properties:
 *                     pagination:
 *                       type: object
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Review'
 *                 other:
 *                   type: object
 *                   properties:
 *                     pagination:
 *                       type: object
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Review'
 *       404:
 *         description: Hotel not found
 */

export default router;
