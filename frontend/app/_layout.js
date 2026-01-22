import { Stack } from 'expo-router';
import { View, Platform } from 'react-native';
import { LanguageProvider } from './components/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';

export default function Layout() {
    return (
        <ErrorBoundary>
            <LanguageProvider>
                {Platform.OS === 'web' && (
                    <style type="text/css">{`
                        @import url("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");
                    `}</style>
                )}
                <View style={{ flex: 1, ...(Platform.OS === 'web' ? { height: '100vh', overflow: 'hidden' } : {}) }}>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="(tabs)" />
                    </Stack>
                </View>
            </LanguageProvider>
        </ErrorBoundary>
    );
}
