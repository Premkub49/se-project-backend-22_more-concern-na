import express from "express";
import { authorize, protect } from '../middleware/auth';
import { getCouponsInInventory, getGiftsInInventory, useRedeemableInInventory } from "../controllers/inventory";

const router = express.Router({ mergeParams: true });

router.route("/coupons").get(protect, getCouponsInInventory);
router.route("/gifts").get(protect, getGiftsInInventory);
router.route("/:redeemableId").post(protect, useRedeemableInInventory);

export default router;

/**
 * @swagger
 * /inventory/coupons:
 *   get:
 *     summary: Get all coupons in inventory
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of coupons in inventory
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
 *                     $ref: '#/components/schemas/Redeemable'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /inventory/gifts:
 *   get:
 *     summary: Get all gifts in inventory
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of gifts in inventory
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
 *                     $ref: '#/components/schemas/Redeemable'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /inventory/{redeemableId}:
 *   post:
 *     summary: Use a redeemable item from inventory
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: redeemableId
 *         required: true
 *         schema:
 *           type: string
 *         description: Redeemable ID
 *     responses:
 *       200:
 *         description: Redeemable item used successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 remain:
 *                   type: integer
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Redeemable not found
 */

