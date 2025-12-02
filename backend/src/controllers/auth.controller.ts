import { Request, Response } from 'express';
import User from '../models/User.model';
import { hashPassword, comparePassword, sendTokenResponse } from '../utils/auth.utils';
import { sendEmailVerification } from '../utils/email.utils';
import crypto from 'crypto';
import { verifyFirebaseIdToken } from '../services/firebase-admin.service';
import axios from 'axios';

// CometChat configuration
const COMETCHAT_APP_ID = process.env.COMETCHAT_APP_ID || '1672589608652649c';
const COMETCHAT_REGION = process.env.COMETCHAT_REGION || 'in';
const COMETCHAT_AUTH_KEY = process.env.COMETCHAT_AUTH_KEY || '55ac6259ae517af575daa4121123949779999c8f';
const COMETCHAT_API_URL = `https://${COMETCHAT_REGION}.cometchat.io/v3`;

// Helper function to create CometChat user
const createCometChatUser = async (userId: string, name: string, email: string) => {
  try {
    const userData = {
      uid: userId,
      name: name,
      email: email
    };

    await axios.post(`${COMETCHAT_API_URL}/users`, userData, {
      headers: {
        'Content-Type': 'application/json',
        'appId': COMETCHAT_APP_ID,
        'apiKey': COMETCHAT_AUTH_KEY
      }
    });

    console.log('CometChat user created successfully:', userId);
  } catch (error) {
    console.error('Error creating CometChat user:', error);
    // Don't fail the registration if CometChat fails
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, gender, year, branch } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !gender || !year || !branch) {
      res.status(400).json({
        success: false,
        message: 'All fields are required'
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

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      gender,
      year,
      branch,
      emailVerificationToken,
      emailVerificationExpires,
      isEmailVerified: false
    });

    // Create CometChat user
    await createCometChatUser(user._id.toString(), user.name, user.email);

    // Send verification email
    try {
      await sendEmailVerification(user, emailVerificationToken);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for verification link.'
      });
    } catch (emailError) {
      // If email fails, delete the user and return error
      await User.findByIdAndDelete(user._id);
      
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }
  } catch (err: any) {
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

    // Create CometChat user if not exists (for legacy users)
    await createCometChatUser(user._id.toString(), user.name, user.email);

    sendTokenResponse(user, 200, res);
  } catch (err: any) {
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

    // Verify Firebase ID token
    const decodedToken = await verifyFirebaseIdToken(idToken);
    
    // Extract email from decoded token (handle both development and production modes)
    const email = decodedToken.email || (decodedToken.payload && decodedToken.payload.email);
    
    if (!email) {
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
      const name = decodedToken.name || decodedToken.displayName || (decodedToken.payload && (decodedToken.payload.name || decodedToken.payload.displayName)) || 'Firebase User';
      user = await User.create({
        name,
        email,
        password: await hashPassword(crypto.randomBytes(20).toString('hex')), // Generate a random password
        phone: '',
        gender: '',
        year: '',
        branch: '',
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

    // Create CometChat user
    await createCometChatUser(user._id.toString(), user.name, user.email);

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (err: any) {
    console.error('Firebase auth error:', err);
    res.status(401).json({
      success: false,
      message: 'Firebase authentication failed'
    });
  }
};