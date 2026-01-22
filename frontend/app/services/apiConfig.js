import { Platform } from 'react-native';
import axios from 'axios';

// Production URL from Render
const PROD_API_URL = 'https://real-estate-backend-ofzi.onrender.com';

// Localhost fallback
const DEV_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

const API = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

export default API;
