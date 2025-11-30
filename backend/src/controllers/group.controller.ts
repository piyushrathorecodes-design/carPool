import { Request, Response } from 'express';
import Group from '../models/Group.model';
import PoolRequest from '../models/PoolRequest.model';
import User from '../models/User.model';
import { v4 as uuidv4 } from 'uuid';

// @desc    Create a group
// @route   POST /api/group/create
// @access  Private
export const createGroup = async (req: any, res: Response): Promise<void> => {
  try {
    const { groupName, route, seatCount } = req.body;
    
    // Generate unique chat room ID
    const chatRoomId = uuidv4();
    
    const group = await Group.create({
      groupName,
      members: [{
        user: req.user.id,
        role: 'admin',
        joinedAt: new Date()
      }],
      route,
      seatCount,
      chatRoomId
    });
    
    res.status(201).json({
      success: true,
      data: group
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};

// @desc    Join a group
// @route   POST /api/group/join/:groupId
// @access  Private
export const joinGroup = async (req: any, res: Response): Promise<void> => {
  try {
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      res.status(404).json({
        success: false,
        message: 'Group not found'
      });
      return;
    }
    
    // Check if group is open
    if (group.status !== 'Open') {
      res.status(400).json({
        success: false,
        message: 'Group is not open for new members'
      });
      return;
    }
    
    // Check if user is already a member
    const isMember = group.members.some(member => 
      member.user.toString() === req.user.id
    );
    
    if (isMember) {
      res.status(400).json({
        success: false,
        message: 'You are already a member of this group'
      });
      return;
    }
    
    // Check if group is full
    if (group.members.length >= group.seatCount) {
      res.status(400).json({
        success: false,
        message: 'Group is full'
      });
      return;
    }
    
    // Add user to group
    group.members.push({
      user: req.user.id,
      role: 'member',
      joinedAt: new Date()
    });
    
    await group.save();
    
    res.status(200).json({
      success: true,
      data: group
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};

// @desc    Leave a group
// @route   POST /api/group/leave/:groupId
// @access  Private
export const leaveGroup = async (req: any, res: Response): Promise<void> => {
  try {
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      res.status(404).json({
        success: false,
        message: 'Group not found'
      });
      return;
    }
    
    // Check if user is a member
    const memberIndex = group.members.findIndex(member => 
      member.user.toString() === req.user.id
    );
    
    if (memberIndex === -1) {
      res.status(400).json({
        success: false,
        message: 'You are not a member of this group'
      });
      return;
    }
    
    // Remove user from group
    group.members.splice(memberIndex, 1);
    
    // If group becomes empty, delete it
    if (group.members.length === 0) {
      await group.deleteOne();
    } else {
      // If the leaving user was admin, assign admin to another member
      const adminIndex = group.members.findIndex(member => member.role === 'admin');
      if (adminIndex === -1 && group.members.length > 0) {
        group.members[0].role = 'admin';
      }
      
      await group.save();
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

// @desc    Lock a group
// @route   PATCH /api/group/lock/:groupId
// @access  Private (Admin only)
export const lockGroup = async (req: any, res: Response): Promise<void> => {
  try {
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      res.status(404).json({
        success: false,
        message: 'Group not found'
      });
      return;
    }
    
    // Check if user is admin of the group
    const isAdmin = group.members.some(member => 
      member.user.toString() === req.user.id && member.role === 'admin'
    );
    
    if (!isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Only group admin can lock the group'
      });
      return;
    }
    
    // Update group status
    group.status = 'Locked';
    await group.save();
    
    res.status(200).json({
      success: true,
      data: group
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};

// @desc    Get user's groups
// @route   GET /api/group/mygroups
// @access  Private
export const getUserGroups = async (req: any, res: Response): Promise<void> => {
  try {
    const groups = await Group.find({
      'members.user': req.user.id
    }).populate('members.user', 'name email');
    
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

// @desc    Get group details
// @route   GET /api/group/:groupId
// @access  Private (Members only)
export const getGroup = async (req: any, res: Response): Promise<void> => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('members.user', 'name email');
    
    if (!group) {
      res.status(404).json({
        success: false,
        message: 'Group not found'
      });
      return;
    }
    
    // Check if user is a member
    const isMember = group.members.some(member => 
      member.user.toString() === req.user.id
    );
    
    if (!isMember) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to access this group'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: group
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};