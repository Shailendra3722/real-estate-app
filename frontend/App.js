import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider } from './app/components/LanguageContext';

// Import Real Screens
import LoginScreen from './app/index';
import MapScreen from './app/(tabs)/map';
import SellScreen from './app/(tabs)/sell';
import ProfileScreen from './app/(tabs)/profile';

// Mock Router Context for components that use `useRouter`
export const MockRouterContext = React.createContext({
    navigate: (route) => console.log('Navigating to', route),
    push: (route) => console.log('Push to', route),
    replace: (route) => console.log('Replace with', route),
});

function ScreenNavigator() {
    const [screen, setScreen] = useState('login'); // login, map, sell, profile

    const renderScreen = () => {
        switch (screen) {
            case 'login':
                return <LoginScreen onLogin={() => setScreen('map')} />;
            case 'map':
                return <MapScreen />;
            case 'sell':
                return <SellScreen />;
            case 'profile':
                return <ProfileScreen />;
            default:
                return <LoginScreen onLogin={() => setScreen('map')} />;
        }
    };

    return (
        <View style={styles.container}>
            <View style={{ position: 'absolute', top: 30, left: 10, zIndex: 999 }}>
                <Text style={{ fontSize: 10, color: 'blue' }}>State: {screen}</Text>
            </View>
            {renderScreen()}

            {/* Custom Tab Bar for Navigation (Only visible after login) */}
            {screen !== 'login' && (
                <View style={styles.navBar}>
                    <TextBtn title="Map" icon="🗺️" onPress={() => setScreen('map')} active={screen === 'map'} />
                    <TextBtn title="Sell" icon="🏠" onPress={() => setScreen('sell')} active={screen === 'sell'} />
                    <TextBtn title="Profile" icon="👤" onPress={() => setScreen('profile')} active={screen === 'profile'} />
                </View>
            )}
        </View>
    );
}

const TextBtn = ({ title, icon, onPress, active }) => (
    <TouchableOpacity onPress={onPress} style={[styles.navBtn, active && styles.activeBtn]}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
        <Text style={[styles.navText, active && styles.activeText]}>{title}</Text>
    </TouchableOpacity>
);

export default function App() {
    return (
        <LanguageProvider>
            <StatusBar style="auto" />
            <ScreenNavigator />
        </LanguageProvider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', ...Platform.select({ web: { height: '100vh', overflow: 'hidden' } }) },
    navBar: {
        flexDirection: 'row',
        height: 70,
        borderTopWidth: 1,
        borderColor: '#eee',
        backgroundColor: 'white',
        paddingBottom: 10,
        elevation: 10
    },
    navBtn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    activeBtn: { backgroundColor: '#f0f9ff' },
    navText: { color: 'gray', fontSize: 12, marginTop: 4 },
    activeText: { color: '#007aff', fontWeight: 'bold' }
});
