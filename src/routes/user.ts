import express from "express";
import {getUsers, updateRole} from "../controllers/users";
import { authorize, protect } from '../middleware/auth';
const router = express.Router();
router.route("/").get(protect,authorize("admin"),getUsers);
router.route("/role").put(protect,authorize("admin"),updateRole);

export default router;