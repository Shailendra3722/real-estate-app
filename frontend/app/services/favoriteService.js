import API from './apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const USER_ID_KEY = '@user_id_v1';

// Helper to get or create a persistent User ID (simulating auth)
const getUserId = async () => {
    try {
        let userId = await AsyncStorage.getItem(USER_ID_KEY);
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            await AsyncStorage.setItem(USER_ID_KEY, userId);
        }
        return userId + '@example.com'; // Backend expects an email format
    } catch (error) {
        console.error('Error getting user ID:', error);
        return 'guest@example.com';
    }
};

export const FavoriteService = {
    addFavorite: async (propertyId) => {
        const email = await getUserId();
        const response = await API.post('/favorites/add', {
            property_id: propertyId,
            user_email: email
        });
        return response.data;
    },

    removeFavorite: async (propertyId) => {
        const email = await getUserId();
        // The backend expects query params or body? Let's check the view_file of favorites.py again.
        // It was: @router.delete("/remove/{property_id}") with user_email as query param
        const response = await API.delete(`/favorites/remove/${propertyId}`, {
            params: { user_email: email }
        });
        return response.data;
    },

    getFavorites: async () => {
        const email = await getUserId();
        const response = await API.get('/favorites/list', {
            params: { user_email: email }
        });
        return response.data || [];
    },

    // Check if a specific property is favored (frontend helper)
    isFavorite: async (propertyId) => {
        try {
            const favorites = await FavoriteService.getFavorites();
            return favorites.some(p => p.id === propertyId); // Assuming list returns property objects
        } catch (e) {
            return false;
        }
    }
};
