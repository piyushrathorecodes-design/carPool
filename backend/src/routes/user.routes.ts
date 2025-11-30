import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserLocation
} from '../controllers/user.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// All routes below are protected
router.use(protect);

router.route('/')
  .get(authorize('admin'), getUsers)
  .post(authorize('admin'), createUser);

router.route('/location')
  .put(updateUserLocation);

router.route('/:id')
  .get(authorize('admin'), getUser)
  .put(updateUser)
  .delete(authorize('admin'), deleteUser);

export default router;