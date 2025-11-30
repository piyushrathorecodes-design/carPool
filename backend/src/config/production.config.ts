// Production configuration settings
export const productionConfig = {
  // MongoDB configuration
  mongodb: {
    uri: process.env.MONGODB_URI_PROD || process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_cab_pool',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Add production-specific options
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },
  
  // Security settings
  security: {
    jwt: {
      secret: process.env.JWT_SECRET || 'fallback_jwt_secret_for_dev_only',
      expiresIn: process.env.JWT_EXPIRE || '7d'
    },
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },
  
  // Server settings
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    environment: process.env.NODE_ENV || 'production'
  },
  
  // External services
  services: {
    googleMaps: {
      apiKey: process.env.GOOGLE_MAPS_API_KEY || ''
    },
    geoapify: {
      apiKey: process.env.GEOAPIFY_API_KEY || ''
    },
    email: {
      service: process.env.EMAIL_SERVICE || 'gmail',
      username: process.env.EMAIL_USERNAME || '',
      password: process.env.EMAIL_PASSWORD || ''
    },
    payment: {
      stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY || '',
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || ''
      }
    }
  }
};

export default productionConfig;