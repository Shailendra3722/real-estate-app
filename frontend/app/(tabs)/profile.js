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
import { GlassCard } from '../components/ui/GlassCard';

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
        <TouchableOpacity style={[styles.actionBtn, SHADOWS.small]} onPress={onPress} activeOpacity={0.8}>
            <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <Text style={styles.actionLabel}>{label}</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.subText} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
    );

    const PropertyCard = ({ item }) => (
        <View style={[styles.propCard, SHADOWS.small]}>
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
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            {/* Header Section */}
            <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.profileRow}>
                    <TouchableOpacity style={styles.avatarContainer} onPress={pickProfilePic}>
                        {avatar ? (
                            <Image source={{ uri: avatar }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <Text style={styles.avatarText}>{userName[0]?.toUpperCase()}</Text>
                            </View>
                        )}
                        <View style={styles.editAvatarBadge}>
                            <Ionicons name="camera" size={12} color={COLORS.primary} />
                        </View>
                    </TouchableOpacity>

                    <View style={{ flex: 1 }}>
                        <Text style={styles.userName}>{userName}</Text>
                        <Text style={styles.userEmail}>{userEmail}</Text>
                        <View style={styles.trustRow}>
                            <Ionicons name="shield-checkmark" size={14} color="#FBBF24" />
                            <Text style={styles.trustText}>Verified Member</Text>
                        </View>
                    </View>
                </View>

                {/* Stats Row */}
                <GlassCard style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>{myProperties.length}</Text>
                        <Text style={styles.statLabel}>Listings</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>0</Text>
                        <Text style={styles.statLabel}>Sold</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>5.0</Text>
                        <Text style={styles.statLabel}>Rating</Text>
                    </View>
                </GlassCard>
            </LinearGradient>

            {/* Content Body */}
            <View style={styles.body}>
                <Text style={styles.sectionHeader}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    <QuickAction
                        icon="add-circle"
                        label="Sell Property"
                        color={COLORS.primary}
                        onPress={() => router.push('/(tabs)/sell')}
                    />
                    <QuickAction icon="heart" label="Favorites" color={COLORS.accent} onPress={() => Alert.alert("Coming Soon")} />
                    <QuickAction icon="document-text" label="My Documents" color={COLORS.secondary} onPress={() => setShowDocs(!showDocs)} />
                    <QuickAction icon="settings" label="Settings" color={COLORS.subText} onPress={() => setShowSettings(!showSettings)} />
                </View>

                {/* MY DOCUMENTS SECTION */}
                {showDocs && (
                    <View style={styles.expandedSection}>
                        <Text style={styles.expandedTitle}>My Legal Documents</Text>
                        <View style={styles.docItem}>
                            <View style={[styles.actionIcon, { backgroundColor: COLORS.primary + '15' }]}>
                                <Ionicons name="id-card" size={24} color={COLORS.primary} />
                            </View>
                            <View style={{ marginLeft: 15, flex: 1 }}>
                                <Text style={styles.docName}>Identity Verified</Text>
                                <Text style={styles.docSub}>{userEmail}</Text>
                            </View>
                            <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                        </View>
                    </View>
                )}

                {/* SETTINGS SECTION */}
                {showSettings && (
                    <View style={styles.expandedSection}>
                        <Text style={styles.expandedTitle}>Account Settings</Text>
                        <Text style={styles.inputLabel}>New Password</Text>
                        <TextInput
                            style={styles.settingInput}
                            placeholder="Enter new password"
                            secureTextEntry
                            value={newPass}
                            onChangeText={setNewPass}
                            placeholderTextColor={COLORS.subText}
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
                    <View style={styles.emptyState}>
                        <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/7486/7486777.png' }} style={{ width: 60, height: 60, opacity: 0.5, marginBottom: 10 }} />
                        <Text style={{ color: COLORS.subText }}>You haven't listed any properties yet.</Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/sell')}>
                            <Text style={{ color: COLORS.primary, fontWeight: 'bold', marginTop: 5 }}>List Now</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    myProperties.map(item => <PropertyCard key={item.id} item={item} />)
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 40,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30
    },
    profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
    avatarContainer: { marginRight: 20 },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white'
    },
    avatarText: { fontSize: 32, fontWeight: 'bold', color: 'white' },
    editAvatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'white',
        width: 28, height: 28, borderRadius: 14,
        justifyContent: 'center', alignItems: 'center',
        ...SHADOWS.small
    },

    userName: { fontSize: 24, fontWeight: 'bold', color: 'white' },
    userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
    trustRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        alignSelf: 'flex-start'
    },
    trustText: { color: '#FDE047', marginLeft: 6, fontWeight: '700', fontSize: 12 },

    statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 15, paddingHorizontal: 10 },
    statItem: { alignItems: 'center', flex: 1 },
    statVal: { fontSize: 20, fontWeight: '800', color: COLORS.text },
    statLabel: { fontSize: 12, color: COLORS.subText, marginTop: 2 },
    divider: { width: 1, height: '80%', backgroundColor: COLORS.border },

    body: { padding: 20, marginTop: -10 },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 15 },
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 15 },

    actionsGrid: { gap: 12 },
    actionBtn: {
        width: '100%',
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: SIZES.radius,
        flexDirection: 'row',
        alignItems: 'center'
    },
    actionIcon: {
        width: 40, height: 40, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 16
    },
    actionLabel: { fontSize: 16, fontWeight: '600', color: COLORS.text },

    propCard: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        padding: 12,
        flexDirection: 'row',
        marginBottom: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border
    },
    propImage: { width: 70, height: 70, borderRadius: 12, marginRight: 15, backgroundColor: COLORS.background },
    propInfo: { flex: 1 },
    propTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
    propPrice: { fontSize: 14, fontWeight: '600', color: COLORS.primary, marginBottom: 6 },
    propBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    deleteBtn: { padding: 10, backgroundColor: '#FEF2F2', borderRadius: 10 },

    expandedSection: {
        backgroundColor: COLORS.surface,
        padding: 20,
        borderRadius: SIZES.radius,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.small
    },
    expandedTitle: { fontWeight: 'bold', fontSize: 18, marginBottom: 15, color: COLORS.text },
    docItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, padding: 12, borderRadius: 12, marginBottom: 8 },
    docName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
    docSub: { fontSize: 12, color: COLORS.subText },

    inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: COLORS.subText },
    settingInput: {
        backgroundColor: COLORS.background,
        padding: 14,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 15,
        color: COLORS.text
    },
    saveBtn: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        ...SHADOWS.medium
    },

    emptyState: { alignItems: 'center', padding: 30, backgroundColor: COLORS.surface, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' }
});
