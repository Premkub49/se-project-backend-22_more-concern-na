import express from "express";
import {getUsers, getUsersPoints, updateRole, updateUser, updateUserPoint} from "../controllers/users";
import { authorize, protect } from '../middleware/auth';
const router = express.Router();
router.route("/").get(protect,authorize("admin"),getUsers).put(protect,updateUser);
router.route("/role").put(protect,authorize("admin"),updateRole);
router.route("/points/:userId").put(protect,authorize("admin"),updateUserPoint);
router.route("/points").get(protect,authorize("admin"),getUsersPoints);


export default router;