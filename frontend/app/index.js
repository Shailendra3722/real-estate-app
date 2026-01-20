import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLanguage } from './components/LanguageContext';

export default function LoginScreen({ onLogin }) {
    // Safely use context, or fallback if context fails (debugging safety)
    const context = useLanguage();
    const t = context?.t || ((k) => k);
    const setLang = context?.setLang || (() => { });
    const lang = context?.lang || 'EN';

    const [debugMsg, setDebugMsg] = React.useState("");

    const handleLogin = () => {
        setDebugMsg("Attempting Login...");
        // If we are passed a prop (from App.js manual nav), use it
        if (onLogin) {
            console.log("Login Clicked -> Navigating");
            setTimeout(() => onLogin(), 100); // Small delay to let UI update
        } else {
            setDebugMsg("Error: onLogin prop missing!");
            console.error("onLogin prop is missing!");
            Alert.alert("Error", "Navigation failed. Please refresh.");
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <View style={styles.header}>
                <Text style={styles.title}>MapProperties AI</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.welcome}>{t('LOGIN_TITLE')}</Text>

                <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
                    <Text style={styles.btnText}>{t('LOGIN_BTN')}</Text>
                </TouchableOpacity>

                {debugMsg ? <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{debugMsg}</Text> : null}

                <TouchableOpacity
                    style={styles.langBtn}
                    onPress={() => setLang(lang === 'HI' ? 'EN' : 'HI')}
                >
                    <Text style={styles.langText}>
                        Change Language to {lang === 'HI' ? 'English' : 'हिंदी'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        // Web compatibility fix for full height
        ...Platform.select({
            web: { height: '100vh' }
        })
    },
    header: { alignItems: 'center', marginBottom: 50 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#2c3e50' },
    content: { padding: 20 },
    welcome: { fontSize: 24, textAlign: 'center', marginBottom: 30, color: '#34495e' },
    loginBtn: {
        backgroundColor: '#e74c3c',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
        // Web pointer cursor
        ...Platform.select({
            web: { cursor: 'pointer' }
        })
    },
    btnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    langBtn: { alignItems: 'center', padding: 10 },
    langText: { color: '#7f8c8d' }
});
