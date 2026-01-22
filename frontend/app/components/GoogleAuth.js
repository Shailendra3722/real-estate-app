import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import API from '../services/apiConfig';

WebBrowser.maybeCompleteAuthSession();

// Hardcoded for demo/simplicity - ideally in ENV
const ANDROID_CLIENT_ID = "297465259282-q6jk1qnaa2i8t3hb37cc2p73efva5l6f.apps.googleusercontent.com";
const IOS_CLIENT_ID = "297465259282-q6jk1qnaa2i8t3hb37cc2p73efva5l6f.apps.googleusercontent.com";
const WEB_CLIENT_ID = "297465259282-q6jk1qnaa2i8t3hb37cc2p73efva5l6f.apps.googleusercontent.com";

export default function GoogleAuthButton({ onSuccess }) {
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: WEB_CLIENT_ID,
        iosClientId: IOS_CLIENT_ID,
        androidClientId: ANDROID_CLIENT_ID,
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            verifyTokenWithBackend(id_token);
        }
    }, [response]);

    const verifyTokenWithBackend = async (idToken) => {
        try {
            console.log("Verifying token with backend...");
            // Send ID Token to our Backend for verification
            const res = await API.post('/auth/google', { token: idToken });

            if (res.data && res.data.user) {
                console.log("Backend Verified User:", res.data.user);

                // Persist Session
                await AsyncStorage.setItem('user_profile', JSON.stringify(res.data.user));
                await AsyncStorage.setItem('user_token', idToken); // Store token for future requests if needed

                // Notify Parent
                onSuccess(res.data.user);
            }
        } catch (error) {
            console.error("Backend Verification Failed:", error);
            Alert.alert("Login Failed", "Could not verify identity with server.");
        }
    };

    return (
        <View style={{ width: '100%', alignItems: 'center' }}>
            <TouchableOpacity
                disabled={!request}
                onPress={() => promptAsync()}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 30,
                    width: '100%',
                    borderWidth: 1,
                    borderColor: '#ddd',
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3.84,
                    elevation: 5,
                }}
            >
                <Ionicons name="logo-google" size={24} color="#EA4335" style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>Sign in with Google</Text>
            </TouchableOpacity>

            <View style={{ marginTop: 20 }}>
                <Text style={{ textAlign: 'center', fontSize: 12, color: '#888' }}>
                    🔒 Secure • Native • Verified
                </Text>
            </View>
        </View>
    );
}
