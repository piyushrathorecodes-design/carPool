// backend/src/routes/pool.routes.ts
import express from 'express';
import {
  createPoolRequest,
  getAllPoolRequests,
  getPoolRequest,
  getMyPoolRequests,
  deletePoolRequest,
  updatePoolStatus,
  matchPoolRequests
} from '../controllers/pool.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// All routes below are protected
router.use(protect);

// Pool request CRUD
router.route('/create')
  .post(createPoolRequest);

router.route('/requests')
  .get(getAllPoolRequests);

router.route('/my-requests')
  .get(getMyPoolRequests);

router.route('/match')
  .post(matchPoolRequests);

router.route('/:id')
  .get(getPoolRequest)
  .delete(deletePoolRequest);

router.route('/:id/status')
  .patch(updatePoolStatus);

export default router;