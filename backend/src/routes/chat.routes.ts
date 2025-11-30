import express from 'express';
import {
  sendMessage,
  getChatHistory,
  markAsRead
} from '../controllers/chat.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// All routes below are protected
router.use(protect);

router.route('/send')
  .post(sendMessage);

router.route('/history/:groupId')
  .get(getChatHistory);

router.route('/read/:messageId')
  .put(markAsRead);

export default router;