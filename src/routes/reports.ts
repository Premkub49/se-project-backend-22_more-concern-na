import { getReports, updateReport, addReport } from '../controllers/reports';
import express from 'express';
import { authorize, protect } from '../middleware/auth';

const router = express.Router();

router.route('/').get(protect,authorize("admin"),getReports);
router.route('/:id').put(protect,authorize("admin"),updateReport);
router.route('/').post(protect,authorize("hotelManager"),addReport)

export default router;
