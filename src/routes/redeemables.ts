import { addRedeemable, getCouponsInRedeemables, getGift, getGiftsInRedeemables, getPriceToPoint, updatePriceToPoint, userRedemption } from "../controllers/redeemables";
import express from "express";
import { authorize, protect } from "../middleware/auth";

const router = express.Router();

router.get('/gifts/:giftId',getGift)
.get('/gifts',getGiftsInRedeemables)
.get('/coupons',getCouponsInRedeemables);
router.route('/creation').post(protect,authorize("admin"),addRedeemable);
router.route('/redemption').post(protect,authorize('user'),userRedemption);
router.route('/price-to-point').get(protect,authorize('admin'),getPriceToPoint)
.put(protect, authorize('admin'), updatePriceToPoint);
export default router;

/**
 * @swagger
 * /redeemables/gifts/{giftId}:
 *   get:
 *     summary: Get details of a specific gift
 *     tags: [Redeemables]
 *     parameters:
 *       - in: path
 *         name: giftId
 *         required: true
 *         schema:
 *           type: string
 *         description: Gift ID
 *     responses:
 *       200:
 *         description: Gift details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Redeemable'
 *       404:
 *         description: Gift not found
 */

/**
 * @swagger
 * /redeemables/gifts:
 *   get:
 *     summary: Get all gifts
 *     tags: [Redeemables]
 *     responses:
 *       200:
 *         description: List of gifts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Redeemable'
 */

/**
 * @swagger
 * /redeemables/coupons:
 *   get:
 *     summary: Get all coupons
 *     tags: [Redeemables]
 *     responses:
 *       200:
 *         description: List of coupons retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Redeemable'
 */

/**
 * @swagger
 * /redeemables/creation:
 *   post:
 *     summary: Add a new redeemable
 *     tags: [Redeemables]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Redeemable'
 *     responses:
 *       201:
 *         description: Redeemable created successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /redeemables/redemption:
 *   post:
 *     summary: Redeem an item
 *     tags: [Redeemables]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Redeemable ID
 *     responses:
 *       200:
 *         description: Item redeemed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 remain:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Redeemable not found
 */

/**
 * @swagger
 * /redeemables/price-to-point:
 *   get:
 *     summary: Get the price-to-point conversion rate
 *     tags: [Redeemables]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Conversion rate retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 priceToPoint:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update the price-to-point conversion rate
 *     tags: [Redeemables]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               priceToPoint:
 *                 type: number
 *                 description: New conversion rate
 *     responses:
 *       200:
 *         description: Conversion rate updated successfully
 *       401:
 *         description: Unauthorized
 */