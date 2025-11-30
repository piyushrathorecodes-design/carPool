import { Request, Response } from 'express';
import PoolRequest from '../models/PoolRequest.model';
import User from '../models/User.model';
import { Types } from 'mongoose';

// @desc    Create a pool request
// @route   POST /api/pool/create
// @access  Private
export const createPoolRequest = async (req: any, res: Response): Promise<void> => {
  try {
    const { 
      pickupLocation, 
      dropLocation, 
      dateTime, 
      preferredGender, 
      seatsNeeded, 
      mode 
    } = req.body;

    // Input validation
    if (!pickupLocation || !dropLocation || !dateTime) {
      res.status(400).json({
        success: false,
        message: 'Pickup location, drop location, and date time are required'
      });
      return;
    }

   const poolRequest = await PoolRequest.create({
  createdBy: req.user.id,
  pickupLocation,
  dropLocation,
  dateTime,
  preferredGender: preferredGender || 'Any',
  seatsNeeded: seatsNeeded || 1,
  mode: mode || 'One-time',
  status: 'Open' // Add this
});

    res.status(201).json({
      success: true,
      data: poolRequest
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};

// @desc    Get pool requests
// @route   GET /api/pool/requests
// @access  Private
export const getPoolRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid pool request ID'
      });
      return;
    }

    const poolRequest = await PoolRequest.findById(id)
      .populate('createdBy', 'name email')
      .populate('matchedUsers', 'name email');
    
    if (!poolRequest) {
      res.status(404).json({
        success: false,
        message: 'Pool request not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: poolRequest
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};

// @desc    Get a single pool request
// @route   GET /api/pool/:id
// @access  Private
export const getPoolRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const poolRequest = await PoolRequest.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('matchedUsers', 'name email');
    
    if (!poolRequest) {
      res.status(404).json({
        success: false,
        message: 'Pool request not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: poolRequest
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};

// @desc    Delete a pool request
// @route   DELETE /api/pool/:id
// @access  Private
export const deletePoolRequest = async (req: any, res: Response): Promise<void> => {
  try {
    const poolRequest = await PoolRequest.findById(req.params.id);
    
    if (!poolRequest) {
      res.status(404).json({
        success: false,
        message: 'Pool request not found'
      });
      return;
    }
    
    // Check if user is the owner
    if (poolRequest.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this pool request'
      });
      return;
    }
    await poolRequest.deleteOne();
    
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

// @desc    Match pool requests
// @route   POST /api/pool/match
// @access  Private
export const matchPoolRequests = async (req: any, res: Response): Promise<void> => {
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
    
    // Find matching pool requests with geospatial queries
    const matchingRequests = await PoolRequest.find({
      status: 'Open',
      createdBy: { $ne: req.user.id }, // Exclude own requests
      dateTime: {
        $gte: startTime,
        $lte: endTime
      },
      $or: [
        { preferredGender: 'Any' },
        { preferredGender: preferredGender },
        { preferredGender: { $exists: false } }
      ]
    }).populate('createdBy', 'name email liveLocation');
    
    // Calculate match scores for each request
    const scoredMatches = matchingRequests.map(request => {
      // Calculate distance similarity (lower distance = higher score)
      const pickupDistance = calculateDistance(
        pickupLocation.coordinates[1], // lat1
        pickupLocation.coordinates[0], // lon1
        request.pickupLocation.coordinates[1], // lat2
        request.pickupLocation.coordinates[0] // lon2
      );
      
      const dropDistance = calculateDistance(
        dropLocation.coordinates[1], // lat1
        dropLocation.coordinates[0], // lon1
        request.dropLocation.coordinates[1], // lat2
        request.dropLocation.coordinates[0] // lon2
      );
      
      // Time difference in minutes
      const timeDiff = Math.abs(request.dateTime.getTime() - requestDateTime.getTime()) / (1000 * 60);
      
      // Calculate match score (0-100)
      // Distance factor (40% weight): closer locations get higher scores
      const distanceScore = Math.max(0, 40 - (pickupDistance + dropDistance) / 1000);
      
      // Time factor (40% weight): closer times get higher scores
      const timeScore = Math.max(0, 40 - timeDiff / 2);
      
      // Gender preference factor (20% weight)
      const genderScore = preferredGender === request.preferredGender || 
                         request.preferredGender === 'Any' || 
                         !request.preferredGender ? 20 : 0;
      
      const matchScore = Math.min(100, distanceScore + timeScore + genderScore);
      
      return {
        ...request.toObject(),
        matchScore,
        distanceSimilarity: {
          pickup: pickupDistance,
          drop: dropDistance
        },
        timeDifference: timeDiff
      };
    });
    
    // Sort by match score descending
    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);
    
    res.status(200).json({
      success: true,
      count: scoredMatches.length,
      data: scoredMatches
    });
  } catch (err: any) {
    console.error('Match pool requests error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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