import { Request, Response } from 'express';
import User from '../models/User.model';
import { hashPassword, comparePassword, sendTokenResponse } from '../utils/auth.utils';
import { sendEmailVerification } from '../utils/email.utils';
import crypto from 'crypto';
import { verifyFirebaseIdToken } from '../services/firebase-admin.service';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, gender, year, branch } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
      return;
    }

    // Validate email format
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      res.status(400).json({
        success: false,
        message: 'Please enter a valid email'
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user with defaults for optional fields
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || 'N/A',
      gender: gender || 'Other',
      year: year || 'N/A',
      branch: branch || 'N/A',
      emailVerificationToken,
      emailVerificationExpires,
      isEmailVerified: false
    });

    // Send verification email (don't fail registration if email fails)
    try {
      await sendEmailVerification(user, emailVerificationToken);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for verification link.',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email
          }
        }
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Still return success but with different message
      res.status(201).json({
        success: true,
        message: 'User registered successfully. Email verification may be delayed.',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email
          }
        }
      });
    }
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
      return;
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
      return;
    }

    // Check if password matches
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    sendTokenResponse(user, 200, res);
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err: any) {
    console.error('Get me error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};

// @desc    Verify email
// @route   GET /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, userId } = req.query;

    // Validate token and userId
    if (!token || !userId) {
      res.status(400).json({
        success: false,
        message: 'Invalid verification link'
      });
      return;
    }

    // Find user with matching token and expiration
    const user = await User.findOne({
      _id: userId,
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
      return;
    }

    // Update user as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (err: any) {
    console.error('Email verification error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  }
};

// @desc    Firebase authentication
// @route   POST /api/auth/firebase
// @access  Public
export const firebaseAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({
        success: false,
        message: 'ID token is required'
      });
      return;
    }

    // Verify Firebase ID token
    const decodedToken = await verifyFirebaseIdToken(idToken);
    
    // Extract email from decoded token with multiple fallback options
    let email: string | undefined;
    let name: string | undefined;
    
    // Try different possible locations for email and name
    if (decodedToken.email) {
      email = decodedToken.email;
    } else if (decodedToken.payload?.email) {
      email = decodedToken.payload.email;
    } else if (decodedToken.firebase?.identities?.email?.[0]) {
      email = decodedToken.firebase.identities.email[0];
    }
    
    if (decodedToken.name) {
      name = decodedToken.name;
    } else if (decodedToken.displayName) {
      name = decodedToken.displayName;
    } else if (decodedToken.payload?.name) {
      name = decodedToken.payload.name;
    } else if (decodedToken.payload?.displayName) {
      name = decodedToken.payload.displayName;
    }
    
    if (!email) {
      console.error('Decoded token structure:', JSON.stringify(decodedToken, null, 2));
      res.status(400).json({
        success: false,
        message: 'Invalid Firebase token: missing email'
      });
      return;
    }
    
    // Check if user exists in our database
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user if they don't exist
      const userName = name || email.split('@')[0] || 'Firebase User';
      // Generate a unique phone number for Firebase users
      const phone = `FB_${Date.now()}`;
      user = await User.create({
        name: userName,
        email,
        password: await hashPassword(crypto.randomBytes(20).toString('hex')),
        phone,
        gender: 'Other',
        year: 'N/A',
        branch: 'N/A',
        isEmailVerified: true, // Firebase users are already verified
        emailVerificationToken: undefined,
        emailVerificationExpires: undefined
      });
    } else if (!user.isEmailVerified) {
      // Update user as verified if they weren't already
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();
    }

    // Send token response with proper user data structure
    sendTokenResponse(user, 200, res);
  } catch (err: any) {
    console.error('Firebase auth error:', err);
    res.status(401).json({
      success: false,
      message: 'Firebase authentication failed: ' + (err.message || 'Unknown error')
    });
  }
};