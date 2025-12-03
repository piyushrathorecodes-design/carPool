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
    console.log('Creating group with data:', req.body);
    console.log('User ID:', req.user._id);
    
    const { groupName, route, seatCount, description, dateTime } = req.body;
    
    // Validate required fields
    if (!groupName || !route || !route.pickup || !route.drop || !seatCount || !dateTime) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
      return;
    }
    
    // Generate unique chat room ID
    const chatRoomId = uuidv4();
    
    // Create group in database
    const group = await Group.create({
      groupName,
      members: [{
        user: req.user._id,
        role: 'admin',
        joinedAt: new Date()
      }],
      route,
      dateTime: new Date(dateTime),
      seatCount,
      chatRoomId,
      description
    });
    
    console.log('Group created successfully:', group._id);
    
    res.status(201).json({
      success: true,
      data: group
    });
  } catch (err: any) {
    console.error('Error creating group:', err);
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
    console.log('Joining group:', req.params.groupId, 'User ID:', req.user._id);
    
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      console.log('Group not found:', req.params.groupId);
      res.status(404).json({
        success: false,
        message: 'Group not found'
      });
      return;
    }
    
    console.log('Found group:', group._id, 'Status:', group.status, 'Members:', group.members.length, 'Seat count:', group.seatCount);
    
    // Check if group is open
    if (group.status !== 'Open') {
      console.log('Group is not open:', group.status);
      res.status(400).json({
        success: false,
        message: 'Group is not open for new members'
      });
      return;
    }
    
    // Check if user is already a member
    const isMember = group.members.some(member => 
      member.user._id.toString() === req.user._id.toString()
    );
    
    console.log('User is already member:', isMember);
    
    if (isMember) {
      res.status(400).json({
        success: false,
        message: 'You are already a member of this group'
      });
      return;
    }
    
    // Check if group is full
    if (group.members.length >= group.seatCount) {
      console.log('Group is full:', group.members.length, '>=', group.seatCount);
      res.status(400).json({
        success: false,
        message: 'Group is full'
      });
      return;
    }
    
    // Add user to group
    group.members.push({
      user: req.user._id,
      role: 'member',
      joinedAt: new Date()
    });
    
    await group.save();
    
    console.log('User added to group successfully');
    
    res.status(200).json({
      success: true,
      data: group
    });
  } catch (err: any) {
    console.error('Error joining group:', err);
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
      member.user._id.toString() === req.user._id.toString()
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
      member.user._id.toString() === req.user._id.toString() && member.role === 'admin'
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

// @desc    Get all groups
// @route   GET /api/group/
// @access  Private
export const getAllGroups = async (req: any, res: Response): Promise<void> => {
  try {
    // Get all groups (both Open and Locked) with member counts
    const groups = await Group.find()
      .populate('members.user', 'name email phone year branch');
    
    // Add a flag to indicate if user can join each group
    const groupsWithAccess = groups.map(group => {
      const isMember = group.members.some(member => 
        member.user._id.toString() === req.user._id.toString()
      );
      
      const canJoin = group.status === 'Open' && 
                     !isMember && 
                     group.members.length < group.seatCount;
      
      return {
        ...group.toObject(),
        isMember,
        canJoin
      };
    });
    
    res.status(200).json({
      success: true,
      count: groupsWithAccess.length,
      data: groupsWithAccess
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
      'members.user': req.user._id
    }).populate('members.user', 'name email phone year branch');
    
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
    console.log('Getting group details:', req.params.groupId, 'User ID:', req.user._id, 'User ID type:', typeof req.user._id);
    
    const group = await Group.findById(req.params.groupId)
      .populate('members.user', 'name email phone year branch');
    
    if (!group) {
      console.log('Group not found:', req.params.groupId);
      res.status(404).json({
        success: false,
        message: 'Group not found'
      });
      return;
    }
    
    console.log('Found group:', group._id, 'Members:', group.members.map(m => ({
      userId: m.user._id.toString(),
      userType: typeof m.user._id,
      comparison: m.user._id.toString() === req.user._id.toString()
    })));
    
    // Check if user is a member
    const isMember = group.members.some(member => 
      member.user._id.toString() === req.user._id.toString()
    );
    
    console.log('User is member:', isMember);
    
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
    console.error('Error getting group:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};

// @desc    Match groups based on location and time
// @route   POST /api/group/match
// @access  Private
export const matchGroups = async (req: any, res: Response): Promise<void> => {
  try {
    const { pickupLocation, dropLocation, dateTime, preferredGender } = req.body;
    
    // Validate required fields
    if (!pickupLocation || !dropLocation || !dateTime) {
      res.status(400).json({
        success: false,
        message: 'Pickup location, drop location, and date time are required'
      });
      return;
    }
    
    // Convert dateTime to Date object if it's a string
    const requestDateTime = new Date(dateTime);
    
    // Calculate time range (25 minutes)
    const timeRange = 25 * 60 * 1000; // 25 minutes in milliseconds
    const startTime = new Date(requestDateTime.getTime() - timeRange);
    const endTime = new Date(requestDateTime.getTime() + timeRange);
    
    // Find matching groups with geospatial queries
    const matchingGroups = await Group.find({
      status: 'Open',
      'members.0': { $exists: true }, // Has at least one member
      $expr: { $lt: [{ $size: '$members' }, '$seatCount'] }, // Not full
      dateTime: {
        $gte: startTime,
        $lte: endTime
      }
    }).populate({
      path: 'members.user',
      select: 'name email gender year branch phone',
      model: 'User'
    });
    
    // Calculate match scores for each group
    const scoredMatches = matchingGroups.map(group => {
      // Skip groups without proper coordinates
      if (!group.route.pickup.coordinates || !group.route.drop.coordinates ||
          !pickupLocation.coordinates || !dropLocation.coordinates) {
        return {
          ...group.toObject(),
          matchScore: 0,
          distanceSimilarity: {
            pickup: 0,
            drop: 0
          }
        };
      }
      
      // Calculate distance similarity (lower distance = higher score)
      const pickupDistance = calculateDistanceHaversine(
        pickupLocation.coordinates[1], // lat1
        pickupLocation.coordinates[0], // lon1
        group.route.pickup.coordinates[1], // lat2
        group.route.pickup.coordinates[0] // lon2
      );
      
      const dropDistance = calculateDistanceHaversine(
        dropLocation.coordinates[1], // lat1
        dropLocation.coordinates[0], // lon1
        group.route.drop.coordinates[1], // lat2
        group.route.drop.coordinates[0] // lon2
      );
      
      // Time difference in minutes
      const timeDiff = Math.abs(group.dateTime.getTime() - requestDateTime.getTime()) / (1000 * 60);
      
      // Calculate match score (0-100)
      // Distance factor (40% weight): closer locations get higher scores
      const distanceScore = Math.max(0, 40 - (pickupDistance + dropDistance) / 1000);
      
      // Time factor (40% weight): closer times get higher scores
      const timeScore = Math.max(0, 40 - timeDiff / 2);
      
      // Gender preference factor (20% weight)
      let genderScore = 0;
      if (preferredGender && preferredGender !== 'Any') {
        // Filter members who have gender property and match the preferred gender
        const membersWithGender = group.members.filter(member => {
          // Check if member.user is populated and has gender property
          return member.user && 
                 typeof member.user === 'object' && 
                 'gender' in member.user && 
                 member.user.gender === preferredGender;
        });
        // Higher score if more members match the preferred gender
        genderScore = group.members.length > 0 ? (membersWithGender.length / group.members.length) * 20 : 0;
      } else {
        genderScore = 20; // Full score if no gender preference
      }
      
      const matchScore = Math.min(100, distanceScore + timeScore + genderScore);
      
      return {
        ...group.toObject(),
        matchScore,
        distanceSimilarity: {
          pickup: pickupDistance,
          drop: dropDistance
        },
        timeDifference: timeDiff
      };
    });
    
    // Sort by match score descending and filter out low matches
    const filteredMatches = scoredMatches
      .filter(match => match.matchScore >= 30) // Only show matches with score >= 30
      .sort((a, b) => b.matchScore - a.matchScore);
          
    res.status(200).json({
      success: true,
      count: filteredMatches.length,
      data: filteredMatches
    });
  } catch (err: any) {
    console.error('Match groups error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};

// Calculate distance between two points using Haversine formula
const calculateDistanceHaversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};