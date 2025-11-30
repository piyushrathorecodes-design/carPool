// Development configuration settings
export const developmentConfig = {
  // MongoDB configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_cab_pool',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  // Security settings
  security: {
    jwt: {
      secret: process.env.JWT_SECRET || 'development_jwt_secret_key_here',
      expiresIn: process.env.JWT_EXPIRE || '7d'
    },
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
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
    }
  }
};

export default developmentConfig;