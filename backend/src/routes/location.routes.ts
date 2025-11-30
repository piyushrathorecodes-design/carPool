import express from 'express';
import { updateLocation, getNearbyUsers } from '../controllers/location.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.route('/location').put(protect, updateLocation);
router.route('/nearby').get(protect, getNearbyUsers);

export default router;