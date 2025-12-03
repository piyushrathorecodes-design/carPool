// backend/src/controllers/notification.controller.ts
import { Request, Response } from 'express';
import Notification from '../models/Notification.model';
import { io } from '../server';

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req: any, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req: any, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
      return;
    }
    
    // Check if notification belongs to user
    if (notification.recipient.toString() !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this notification'
      });
      return;
    }
    
    notification.isRead = true;
    await notification.save();
    
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req: any, res: Response): Promise<void> => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req: any, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
      return;
    }
    
    // Check if notification belongs to user
    if (notification.recipient.toString() !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notification'
      });
      return;
    }
    
    await notification.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req: any, res: Response): Promise<void> => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false
    });
    
    res.status(200).json({
      success: true,
      count
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};

// Helper function to create notifications (can be used by other controllers)
export const createNotification = async (data: {
  recipient: string;
  sender?: string;
  type: 'match_found' | 'group_joined' | 'group_left' | 'message' | 'system';
  title: string;
  content: string;
  relatedId?: string;
}) => {
  try {
    const notification = await Notification.create(data);
    
    // Emit socket event for real-time notification
    io.to(`user_${data.recipient}`).emit('new_notification', notification);
    
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};