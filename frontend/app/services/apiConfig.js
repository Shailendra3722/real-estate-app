import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Detect if running on Android Emulator (localhost is 10.0.2.2) or iOS Simulator (localhost)
const API_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:8000'
    : 'http://localhost:8000';

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
