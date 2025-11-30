import { Request, Response } from 'express';
import User from '../models/User.model';

// @desc    Update user's live location
// @route   PUT /api/users/location
// @access  Private
export const updateLocation = async (req: any, res: Response): Promise<void> => {
  try {
    const { coordinates } = req.body;
    
    // Validate coordinates
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      res.status(400).json({
        success: false,
        message: 'Coordinates must be an array of [longitude, latitude]'
      });
      return;
    }
    
    // Update user's live location
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { liveLocation: { coordinates } },
      { new: true, runValidators: true }
    );
    
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

// @desc    Get nearby users based on location
// @route   GET /api/users/nearby
// @access  Private
export const getNearbyUsers = async (req: any, res: Response): Promise<void> => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query; // maxDistance in meters
    
    // Validate coordinates
    if (!longitude || !latitude) {
      res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
      return;
    }
    
    // Find nearby users using geospatial query
    const nearbyUsers = await User.find({
      _id: { $ne: req.user.id }, // Exclude current user
      liveLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseFloat(maxDistance)
        }
      }
    }).select('name email liveLocation');
    
    res.status(200).json({
      success: true,
      count: nearbyUsers.length,
      data: nearbyUsers
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};