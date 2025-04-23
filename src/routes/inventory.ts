import express from "express";
import { authorize, protect } from '../middleware/auth';
import { getInventoryByType, useRedeemableInInventory } from "../controllers/inventory";

const router = express.Router({ mergeParams: true });

router.route("/coupons").get(protect, (req, res, next) => getInventoryByType("coupon", req, res, next));
router.route("/gifts").get(protect, (req, res, next) => getInventoryByType("gift", req, res, next));
router.route("/:redeemableId").post(protect, useRedeemableInInventory);

export default router;