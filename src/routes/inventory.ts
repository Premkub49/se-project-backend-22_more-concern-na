import express from "express";
import { authorize, protect } from '../middleware/auth';
import { getCouponsInInventory, getGiftsInInventory, useRedeemableInInventory } from "../controllers/inventory";

const router = express.Router({ mergeParams: true });

router.route("/coupons").get(protect, getCouponsInInventory);
router.route("/gifts").get(protect, getGiftsInInventory);
router.route("/:redeemableId").post(protect, useRedeemableInInventory);

export default router;