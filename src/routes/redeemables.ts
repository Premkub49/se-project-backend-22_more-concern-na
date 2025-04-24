import { addRedeemable, getCouponsInRedeemables, getGiftsInRedeemables } from "controllers/redeemables";
import express from "express";
import { authorize, protect } from "middleware/auth";

const router = express.Router();

router.get('/gifts',getGiftsInRedeemables).get('/coupons',getCouponsInRedeemables);
router.route('/creation').post(protect,authorize("admin"),addRedeemable);

export default router;