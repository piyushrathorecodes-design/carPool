import { Request, Response } from 'express';
import User from '../models/User.model';
import Group from '../models/Group.model';
import PoolRequest from '../models/PoolRequest.model';
import Notification from '../models/Notification.model';
import { createNotification } from './notification.controller';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};

// @desc    Ban user
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
export const banUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};

// @desc    Get all groups
// @route   GET /api/admin/groups
// @access  Private/Admin
export const getAllGroups = async (req: Request, res: Response): Promise<void> => {
  try {
    const groups = await Group.find()
      .populate('members.user', 'name email')
      .populate('admin', 'name email')
      .populate('route.pickup.routePoint', 'name address coordinates')
      .populate('route.drop.routePoint', 'name address coordinates');
    
    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};

// @desc    Delete group
// @route   DELETE /api/admin/groups/:id
// @access  Private/Admin
export const deleteGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    
    if (!group) {
      res.status(404).json({
        success: false,
        message: 'Group not found'
      });
      return;
    }
    
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

// @desc    Get all pool requests
// @route   GET /api/admin/pool-requests
// @access  Private/Admin
export const getAllPoolRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const poolRequests = await PoolRequest.find()
      .populate('user', 'name email')
      .populate('matchedWith', 'name email');
    
    res.status(200).json({
      success: true,
      count: poolRequests.length,
      data: poolRequests
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};

// @desc    Send announcement
// @route   POST /api/admin/announcement
// @access  Private/Admin
export const sendAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content } = req.body;
    
    // Get all users
    const users = await User.find({}, '_id');
    
    // Create notifications for all users using the helper function
    const notificationPromises = users.map(user => 
      createNotification({
        recipient: user._id.toString(),
        type: 'system',
        title,
        content
      })
    );
    
    // Wait for all notifications to be created
    await Promise.all(notificationPromises);
    
    res.status(201).json({
      success: true,
      message: 'Announcement sent to all users'
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};