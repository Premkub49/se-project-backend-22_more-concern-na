import express from "express";
import {getUsers, updateRole, updateUser, updateUserPoint} from "../controllers/users";
import { authorize, protect } from '../middleware/auth';
const router = express.Router();
router.route("/").get(protect,authorize("admin"),getUsers).put(protect,updateUser);
router.route("/role").put(protect,authorize("admin"),updateRole);
router.route("/:id").put(protect,authorize("admin"),updateUserPoint);


export default router;