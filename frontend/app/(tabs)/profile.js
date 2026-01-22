import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, TextInput, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useLanguage } from '../components/LanguageContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import API from '../services/apiConfig';
import { useRouter } from 'expo-router';

// Helper to get persistent ID (copied from FavoritesService for now)
const USER_ID_KEY = '@user_id_v1';
const getUserId = async () => {
    try {
        let userId = await AsyncStorage.getItem(USER_ID_KEY);
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            await AsyncStorage.setItem(USER_ID_KEY, userId);
        }
        return userId + '@example.com';
    } catch { return 'guest@example.com'; }
};

export default function ProfileScreen() {
    const { t } = useLanguage();
    const router = useRouter();

    // User State
    const [userEmail, setUserEmail] = useState('');
    const [userName, setUserName] = useState('Real Estate User');
    const [avatar, setAvatar] = useState(null);

    // Dashboard Data
    const [myProperties, setMyProperties] = useState([]);
    const [loading, setLoading] = useState(false);

    // UI State
    const [showDocs, setShowDocs] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    useEffect(() => {
        setupUser();
    }, []);

    const setupUser = async () => {
        try {
            const userJson = await AsyncStorage.getItem('user_profile');
            if (userJson) {
                const user = JSON.parse(userJson);
                setUserEmail(user.email);
                setUserName(user.name);
                loadMyProperties(user.email);
            }
            loadProfilePic();
        } catch (e) {
            console.log("Error loading profile", e);
        }
    };

    const loadProfilePic = async () => {
        try {
            const savedAvatar = await AsyncStorage.getItem('@profile_avatar');
            if (savedAvatar) setAvatar(savedAvatar);
        } catch (e) { console.log(e); }
    };

    const loadMyProperties = async (email) => {
        setLoading(true);
        try {
            const response = await API.get(`/properties/user/${email}`);
            setMyProperties(response.data || []);
        } catch (error) {
            console.log('Error loading properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProperty = async (id) => {
        Alert.alert(
            "Delete Property",
            "Are you sure you want to remove this listing?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await API.delete(`/properties/${id}`);
                            setMyProperties(prev => prev.filter(p => p.id !== id));
                        } catch (e) {
                            Alert.alert("Error", "Could not delete property");
                        }
                    }
                }
            ]
        );
    };

    const pickProfilePic = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });
        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setAvatar(uri);
            await AsyncStorage.setItem('@profile_avatar', uri);
        }
    };

    const QuickAction = ({ icon, label, color, onPress }) => (
        <TouchableOpacity style={[styles.actionBtn, SHADOWS.light]} onPress={onPress}>
            <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <Text style={styles.actionLabel}>{label}</Text>
        </TouchableOpacity>
    );

    const PropertyCard = ({ item }) => (
        <View style={[styles.propCard, SHADOWS.light]}>
            <Image
                source={{ uri: item.image_urls?.[0] || 'https://via.placeholder.com/100' }}
                style={styles.propImage}
            />
            <View style={styles.propInfo}>
                <Text style={styles.propTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.propPrice}>₹{item.price_fiat?.toLocaleString()}</Text>
                <View style={[styles.propBadge, { backgroundColor: '#DCFCE7' }]}>
                    <Text style={{ color: '#166534', fontSize: 10, fontWeight: '700' }}>ACTIVE</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteProperty(item.id)}>
                <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
        </View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Header Section */}
            <LinearGradient
                colors={[COLORS.primary, '#1E293B']}
                style={styles.header}
            >
                <View style={styles.profileRow}>
                    <TouchableOpacity style={styles.avatar} onPress={pickProfilePic}>
                        {avatar ?
                            <Image source={{ uri: avatar }} style={{ width: '100%', height: '100%', borderRadius: 40 }} />
                            : <Text style={styles.avatarText}>{userName[0]?.toUpperCase()}</Text>
                        }
                        <View style={styles.editAvatarBadge}>
                            <Ionicons name="add" size={14} color="white" />
                        </View>
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.userName}>{userName}</Text>
                        <Text style={styles.userEmail}>{userEmail}</Text>
                        <View style={styles.trustRow}>
                            <Ionicons name="shield-checkmark" size={14} color={COLORS.secondary} />
                            <Text style={styles.trustText}>Trust Score: 100/100</Text>
                        </View>
                    </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>{myProperties.length}</Text>
                        <Text style={styles.statLabel}>Listed</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>0</Text>
                        <Text style={styles.statLabel}>Sold</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>5.0★</Text>
                        <Text style={styles.statLabel}>Rating</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Content Body */}
            <View style={styles.body}>
                <Text style={styles.sectionHeader}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    <QuickAction
                        icon="add-circle"
                        label="Sell Property"
                        color={COLORS.secondary}
                        onPress={() => router.push('/(tabs)/sell')}
                    />
                    <QuickAction icon="heart" label="Favorites" color={COLORS.error} onPress={() => Alert.alert("Coming Soon")} />
                    <QuickAction icon="document-text" label="My Docs" color={COLORS.primary} onPress={() => setShowDocs(!showDocs)} />
                    <QuickAction icon="settings" label="Settings" color={COLORS.subText} onPress={() => setShowSettings(!showSettings)} />
                </View>

                {/* MY DOCUMENTS SECTION */}
                {showDocs && (
                    <View style={styles.expandedSection}>
                        <Text style={styles.expandedTitle}>My Legal Documents</Text>
                        <View style={styles.docItem}>
                            <Ionicons name="id-card" size={24} color={COLORS.primary} />
                            <View style={{ marginLeft: 10, flex: 1 }}>
                                <Text style={styles.docName}>Device ID Verified</Text>
                                <Text style={styles.docSub}>{userEmail}</Text>
                            </View>
                            <Ionicons name="checkmark-circle" size={20} color="green" />
                        </View>
                    </View>
                )}

                {/* SETTINGS SECTION */}
                {showSettings && (
                    <View style={styles.expandedSection}>
                        <Text style={styles.expandedTitle}>Account Settings</Text>
                        <TextInput
                            style={styles.settingInput}
                            placeholder="New Password"
                            secureTextEntry
                            value={newPass}
                            onChangeText={setNewPass}
                        />
                        <TouchableOpacity style={styles.saveBtn} onPress={() => Alert.alert("Password Updated locally")}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Update Password</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.sectionRow}>
                    <Text style={styles.sectionHeader}>My Properties</Text>
                    <TouchableOpacity onPress={() => loadMyProperties(userEmail)}>
                        <Ionicons name="refresh" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                ) : myProperties.length === 0 ? (
                    <Text style={{ color: COLORS.subText, textAlign: 'center', marginTop: 10 }}>You haven't listed any properties yet.</Text>
                ) : (
                    myProperties.map(item => <PropertyCard key={item.id} item={item} />)
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: { padding: SIZES.padding, paddingTop: 60, paddingBottom: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
    avatar: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center', marginRight: 20, borderWidth: 2, borderColor: COLORS.secondary
    },
    avatarText: { fontSize: 32, fontWeight: 'bold', color: 'white' },
    verifiedBadge: {
        position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.success,
        width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: COLORS.primary
    },
    userName: { fontSize: 24, fontWeight: 'bold', color: 'white', letterSpacing: 0.5 },
    userEmail: { fontSize: 14, color: '#94A3B8', marginBottom: 5 },
    trustRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(217, 119, 6, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
    trustText: { color: COLORS.secondary, marginLeft: 5, fontWeight: '700', fontSize: 12 },

    statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 16 },
    statItem: { alignItems: 'center' },
    statVal: { fontSize: 20, fontWeight: '800', color: 'white' },
    statLabel: { fontSize: 12, color: '#94A3B8' },
    divider: { width: 1, height: '80%', backgroundColor: 'rgba(255,255,255,0.2)' },

    body: { padding: SIZES.padding, marginTop: -20 },
    sectionHeader: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 15 },
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 15 },
    seeAll: { color: COLORS.secondary, fontWeight: '600' },

    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
    actionBtn: { width: '48%', backgroundColor: 'white', padding: 15, borderRadius: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    actionIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    actionLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },

    propCard: { backgroundColor: 'white', borderRadius: 16, padding: 12, flexDirection: 'row', marginBottom: 15, alignItems: 'center' },
    propImage: { width: 60, height: 60, borderRadius: 10, marginRight: 15, backgroundColor: COLORS.bg },
    propInfo: { flex: 1 },
    propTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
    propPrice: { fontSize: 14, fontWeight: '600', color: COLORS.secondary, marginBottom: 6 },
    propBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    deleteBtn: { padding: 10, backgroundColor: '#FEF2F2', borderRadius: 8 },

    editAvatarBadge: { position: 'absolute', bottom: 0, left: 0, backgroundColor: COLORS.secondary, padding: 3, borderRadius: 10 },
    expandedSection: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#eee' },
    expandedTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 10, color: COLORS.text },
    docItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 10, borderRadius: 8, marginBottom: 8 },
    docName: { fontSize: 14, fontWeight: '600' },
    docSub: { fontSize: 10, color: COLORS.subText },
    settingInput: { backgroundColor: 'white', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 10 },
    saveBtn: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center' }
});
