import express from 'express';
import { calculateRoute } from '../utils/geoapify.utils';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// All routes below are protected
router.use(protect);

// @desc    Calculate route between two points
// @route   POST /api/geoapify/route
// @access  Private
router.post('/route', async (req: any, res: any) => {
  try {
    const { waypoints, mode } = req.body;
    
    // Validate required fields
    if (!waypoints || !Array.isArray(waypoints) || waypoints.length < 2) {
      res.status(400).json({
        success: false,
        message: 'At least two waypoints are required'
      });
      return;
    }
    
    // Calculate route using Geoapify
    const routeData = await calculateRoute(waypoints, mode || 'drive');
    
    res.status(200).json({
      success: true,
      data: routeData
    });
  } catch (err: any) {
    console.error('Geoapify route calculation error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to calculate route'
    });
  }
});

export default router;