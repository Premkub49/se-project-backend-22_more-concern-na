import express from "express";
import {getUsers, getUsersPoints, updateRole, updateUser, updateUserPoint} from "../controllers/users";
import { authorize, protect } from '../middleware/auth';
const router = express.Router();
router.route("/").get(protect,authorize("admin"),getUsers).put(protect,updateUser);
router.route("/role").put(protect,authorize("admin"),updateRole);
router.route("/points/:userId").put(protect,authorize("admin"),updateUserPoint);
router.route("/points").get(protect,authorize("admin"),getUsersPoints);
export default router;
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 total:
 *                   type: integer
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update user details
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /users/role:
 *   put:
 *     summary: Update user role
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 description: User ID
 *               role:
 *                 type: string
 *                 description: New role
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /users/points/{userId}:
 *   put:
 *     summary: Update user points
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               point:
 *                 type: integer
 *                 description: New point value
 *     responses:
 *       200:
 *         description: User points updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /users/points:
 *   get:
 *     summary: Get users' points
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of users' points
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       point:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 */