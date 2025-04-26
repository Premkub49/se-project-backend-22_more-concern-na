import { addRedeemable, getCouponsInRedeemables, getGift, getGiftsInRedeemables, getPriceToPoint, updatePriceToPoint, userRedemption } from "../controllers/redeemables";
import express from "express";
import { authorize, protect } from "../middleware/auth";
import { updateBooking } from "controllers/bookings";

const router = express.Router();

router.get('/gifts/:giftId',getGift)
.get('/gifts',getGiftsInRedeemables)
.get('/coupons',getCouponsInRedeemables);
router.route('/creation').post(protect,authorize("admin"),addRedeemable);
router.route('/redemption').post(protect,authorize('user'),userRedemption);
router.route('/price-to-point').get(protect,authorize('admin'),getPriceToPoint)
.put(protect, authorize('admin'), updatePriceToPoint);
export default router;