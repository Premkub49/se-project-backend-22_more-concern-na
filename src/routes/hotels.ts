import {getHotels, addHotel} from "../controllers/hotels"
import express from "express";
import {protect,authorize} from "../middleware/auth"

const router = express.Router();

router.route("/").get(getHotels).post(protect as express.RequestHandler, addHotel);
export default router;