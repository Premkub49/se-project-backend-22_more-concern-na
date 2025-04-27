import express from "express";
import { addRoom, deleteRoom, updateRoom } from '../controllers/rooms';
import { authorize, protect } from '../middleware/auth';
const router = express.Router({ mergeParams: true });
router.route('/').post(protect,authorize("admin","hotelManager"),addRoom)
router.route('/:roomId').put(protect,authorize("admin","hotelManager"),updateRoom)
.delete(protect, authorize("admin", "hotelManager"), deleteRoom);

export default router;

/**
 * @swagger
 * /hotels/{hotelId}/rooms:
 *   post:
 *     summary: Add a new room to a hotel
 *     tags: [Rooms]
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
 *             type: object
 *             properties:
 *               roomType:
 *                 type: string
 *                 description: Type of the room
 *               picture:
 *                 type: string
 *                 description: URL of the room picture
 *               capacity:
 *                 type: integer
 *                 description: Capacity of the room
 *               maxCount:
 *                 type: integer
 *                 description: Maximum number of rooms available
 *               price:
 *                 type: number
 *                 description: Price per night
 *     responses:
 *       201:
 *         description: Room added successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Hotel not found
 */

/**
 * @swagger
 * /hotels/{hotelId}/rooms/{roomId}:
 *   put:
 *     summary: Update a room in a hotel
 *     tags: [Rooms]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomType:
 *                 type: string
 *                 description: Updated type of the room
 *               picture:
 *                 type: string
 *                 description: Updated URL of the room picture
 *               capacity:
 *                 type: integer
 *                 description: Updated capacity of the room
 *               maxCount:
 *                 type: integer
 *                 description: Updated maximum number of rooms available
 *               price:
 *                 type: number
 *                 description: Updated price per night
 *     responses:
 *       200:
 *         description: Room updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Hotel or room not found
 *   delete:
 *     summary: Delete a room from a hotel
 *     tags: [Rooms]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Hotel or room not found
 */