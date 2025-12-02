// backend/src/config/development.config.ts

// Define allowed origins array
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : [
      'http://localhost:5173',
      'https://car-pool-flax.vercel.app',
      'https://carpool-2-omli.onrender.com'
    ];

export const developmentConfig = {
  // MongoDB configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://piyushrathore:piyushcodes@cluster0.wiqfcjk.mongodb.net/carpoolgrp?retryWrites=true&w=majority&appName=Cluster0'
  },
  
  // Security settings
  security: {
    jwt: {
      secret: process.env.JWT_SECRET || 'development_jwt_secret_key_here',
      expiresIn: process.env.JWT_EXPIRE || '7d'
    },
    cors: {
      origin: allowedOrigins, // Now accepts multiple origins
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
    }
  },
  
  // Server settings
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    environment: process.env.NODE_ENV || 'development'
  },
  
  // External services
  services: {
    googleMaps: {
      apiKey: process.env.GOOGLE_MAPS_API_KEY || ''
    },
    geoapify: {
      apiKey: process.env.GEOAPIFY_API_KEY || ''
    }
  }
};

export default developmentConfig;