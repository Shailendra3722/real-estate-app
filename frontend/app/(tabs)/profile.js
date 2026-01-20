import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLanguage } from '../components/LanguageContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
    const { t } = useLanguage();

    // Mock Data for "Ultra Pro" feel
    const user = {
        name: "Shailendra Singh",
        email: "shailendra@example.com",
        isVerified: true,
        trustScore: 98,
        propertiesListed: 3,
        propertiesSold: 1
    };

    // State for Profile
    const [avatar, setAvatar] = useState(null);
    const [showDocs, setShowDocs] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Settings State
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    const pickProfilePic = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
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

    const PropertyCard = ({ title, price, status }) => (
        <View style={[styles.propCard, SHADOWS.light]}>
            <View style={styles.propImagePlaceholder}>
                <Ionicons name="image-outline" size={30} color={COLORS.subText} />
            </View>
            <View style={styles.propInfo}>
                <Text style={styles.propTitle}>{title}</Text>
                <Text style={styles.propPrice}>{price}</Text>
                <View style={[styles.propBadge, { backgroundColor: status === 'Active' ? '#DCFCE7' : '#F3F4F6' }]}>
                    <Text style={{ color: status === 'Active' ? '#166534' : COLORS.subText, fontSize: 10, fontWeight: '700' }}>
                        {status.toUpperCase()}
                    </Text>
                </View>
            </View>
            <TouchableOpacity style={styles.moreBtn}>
                <Ionicons name="ellipsis-vertical" size={20} color={COLORS.subText} />
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
                            : <Text style={styles.avatarText}>{user.name[0]}</Text>
                        }

                        <View style={styles.editAvatarBadge}>
                            <Ionicons name="add" size={14} color="white" />
                        </View>

                        {user.isVerified && (
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark" size={12} color="white" />
                            </View>
                        )}
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                        <View style={styles.trustRow}>
                            <Ionicons name="shield-checkmark" size={14} color={COLORS.secondary} />
                            <Text style={styles.trustText}>Trust Score: {user.trustScore}/100</Text>
                        </View>
                    </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>{user.propertiesListed}</Text>
                        <Text style={styles.statLabel}>Listed</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>{user.propertiesSold}</Text>
                        <Text style={styles.statLabel}>Sold</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statVal}>4.9★</Text>
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
                        onPress={() => alert("Go to the 'Sell' tab below to list your property!")}
                    />
                    <QuickAction icon="heart" label="Favorites" color={COLORS.error} onPress={() => alert("No favorites yet!")} />
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
                                <Text style={styles.docName}>Aadhaar Card (Verified)</Text>
                                <Text style={styles.docSub}>XXXX-XXXX-9999 • Verified on 12 Jan</Text>
                            </View>
                            <Ionicons name="checkmark-circle" size={20} color="green" />
                        </View>
                        <View style={styles.docItem}>
                            <Ionicons name="document" size={24} color={COLORS.subText} />
                            <View style={{ marginLeft: 10, flex: 1 }}>
                                <Text style={styles.docName}>Property Deed (Plot 24)</Text>
                                <Text style={styles.docSub}>Pending Verification</Text>
                            </View>
                            <Ionicons name="time" size={20} color="orange" />
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
                        <TextInput
                            style={styles.settingInput}
                            placeholder="Confirm Password"
                            secureTextEntry
                            value={confirmPass}
                            onChangeText={setConfirmPass}
                        />
                        <TouchableOpacity
                            style={styles.saveBtn}
                            onPress={() => {
                                if (newPass && newPass === confirmPass) {
                                    alert("Password Updated Successfully!");
                                    setNewPass(''); setConfirmPass(''); setShowSettings(false);
                                } else {
                                    alert("Passwords do not match or are empty.");
                                }
                            }}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Update Password</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.sectionRow}>
                    <Text style={styles.sectionHeader}>My Properties</Text>
                    <TouchableOpacity onPress={() => alert("Showing all 3 listings...")}>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>

                <PropertyCard title="Luxury Villa in Pali Hill" price="₹15.5 Cr" status="Active" />
                <PropertyCard title="2BHK in Andheri West" price="₹2.1 Cr" status="Pending" />
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

    statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 16, backdropFilter: 'blur(10px)' }, // Note: backdropFilter is web only mostly
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
    propImagePlaceholder: { width: 60, height: 60, borderRadius: 10, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    propInfo: { flex: 1 },
    propTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
    propPrice: { fontSize: 14, fontWeight: '600', color: COLORS.secondary, marginBottom: 6 },
    propBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    moreBtn: { padding: 5 },

    // NEW STYLES
    editAvatarBadge: { position: 'absolute', bottom: 0, left: 0, backgroundColor: COLORS.secondary, padding: 3, borderRadius: 10 },
    expandedSection: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#eee' },
    expandedTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 10, color: COLORS.text },
    docItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 10, borderRadius: 8, marginBottom: 8 },
    docName: { fontSize: 14, fontWeight: '600' },
    docSub: { fontSize: 10, color: COLORS.subText },
    settingInput: { backgroundColor: 'white', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 10 },
    saveBtn: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center' }
});
