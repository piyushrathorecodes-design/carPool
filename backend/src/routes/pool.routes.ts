import express from 'express';
import {
  createPoolRequest,
  getPoolRequests,
  getPoolRequest,
  deletePoolRequest,
  matchPoolRequests
} from '../controllers/pool.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// All routes below are protected
router.use(protect);

router.route('/create')
  .post(createPoolRequest);

router.route('/requests')
  .get(getPoolRequests);

router.route('/match')
  .post(matchPoolRequests);

router.route('/:id')
  .get(getPoolRequest)
  .delete(deletePoolRequest);

export default router;