import { Stack } from 'expo-router';
import { View, Platform } from 'react-native';
import { LanguageProvider } from './components/LanguageContext';

export default function Layout() {
    return (
        <LanguageProvider>
            <View style={{ flex: 1, ...(Platform.OS === 'web' ? { height: '100vh', overflow: 'hidden' } : {}) }}>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(tabs)" />
                </Stack>
            </View>
        </LanguageProvider>
    );
}
