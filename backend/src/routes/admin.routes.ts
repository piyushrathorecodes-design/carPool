import express from 'express';
import {
  getAllUsers,
  getAllGroups,
  getAllPoolRequests,
  banUser,
  deleteGroup,
  sendAnnouncement
} from '../controllers/admin.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// All routes below are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

router.route('/users')
  .get(getAllUsers);

router.route('/users/:id/ban')
  .put(banUser);

router.route('/groups')
  .get(getAllGroups);

router.route('/groups/:id')
  .delete(deleteGroup);

router.route('/pool-requests')
  .get(getAllPoolRequests);

router.route('/announcement')
  .post(sendAnnouncement);

export default router;