import developmentConfig from './development.config';
import productionConfig from './production.config';

const config = process.env.NODE_ENV === 'production' 
  ? productionConfig 
  : developmentConfig;

export default config;