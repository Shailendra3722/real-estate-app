import { Platform } from 'react-native';

// Production URL from Render
const PROD_API_URL = 'https://real-estate-backend-ofzi.onrender.com';

// Localhost fallback
const DEV_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

export default {
    API_URL,
    ENDPOINTS: {
        HEALTH: '/api/health',
        AUTH: '/auth/google',
        PROPERTIES: '/properties',
        NEARBY: '/properties/nearby',
        VERIFY: '/verification/upload'
    }
};
