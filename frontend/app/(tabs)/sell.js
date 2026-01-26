import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, Alert, Image, ActivityIndicator, Platform, Modal, Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import API from '../services/apiConfig';
import * as ImagePicker from 'expo-image-picker';
import { useLanguage } from '../components/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import NativeMap, { NativeMarker } from '../components/NativeMap';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { PremiumButton } from '../components/ui/PremiumButton';
import { GlassCard } from '../components/ui/GlassCard';

const getToken = async () => {
    try {
        const token = await AsyncStorage.getItem('user_token');
        return token;
    } catch { return null; }
};

export default function SellScreen() {
    const { t } = useLanguage();

    // Form State
    const [form, setForm] = useState({ title: '', price: '', desc: '', mobile: '' });
    const [location, setLocation] = useState({ latitude: 26.8467, longitude: 80.9461 });
    const [propertyType, setPropertyType] = useState('Flat');
    const [propImages, setPropImages] = useState([]);
    const [mapType, setMapType] = useState('standard');

    // Area with smart units
    const [area, setArea] = useState('');
    const [areaUnit, setAreaUnit] = useState('sqft');

    // Verification State
    const [aadhaarNumber, setAadhaarNumber] = useState('');
    const [otp, setOtp] = useState('');

    const [loading, setLoading] = useState(false);
    const [successVisible, setSuccessVisible] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [verificationStep, setVerificationStep] = useState('IDLE'); // IDLE, OTP, VERIFIED

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    // Start animations on mount
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    // Auto-switch area unit based on property type
    useEffect(() => {
        if (propertyType === 'Plot' || propertyType === 'Farm') {
            setAreaUnit('bigha');
        } else {
            setAreaUnit('sqft');
        }
    }, [propertyType]);

    // Mobile Number Validation
    const handleMobileChange = (text) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        if (cleaned.length <= 10) {
            setForm({ ...form, mobile: cleaned });
        }
    };

    const formatMobile = (mobile) => {
        if (mobile.length === 10) {
            return `+91 ${mobile.substring(0, 5)}-${mobile.substring(5)}`;
        }
        return mobile;
    };

    // Image Pickers
    const pickPropertyImages = async () => {
        if (propImages.length >= 4) {
            Alert.alert("Limit Reached", "Max 4 photos allowed.");
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });
        if (!result.canceled) {
            setPropImages([...propImages, result.assets[0]]);
        }
    };

    // Secure Verification Logic
    const scanCard = async () => {
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5,
        });

        if (!result.canceled) {
            setLoading(true);
            try {
                // Upload to OCR endpoint
                const formData = new FormData();
                formData.append('file', {
                    uri: result.assets[0].uri,
                    name: 'scan.jpg',
                    type: 'image/jpeg',
                });

                // Note: using /verification/ocr as per backend structure
                const res = await API.post('/verification/ocr', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (res.data && res.data.id_number) {
                    setAadhaarNumber(res.data.id_number);
                    Alert.alert("Scan Success", `Detected Aadhaar: ${res.data.id_number}`);
                }
            } catch (e) {
                console.log(e);
                Alert.alert("Scan Failed", "Could not read document. Please type manually.");
            } finally {
                setLoading(false);
            }
        }
    };

    const requestOtp = async () => {
        if (aadhaarNumber.length !== 12) {
            Alert.alert("Invalid Aadhaar", "Please enter a valid 12-digit Aadhaar number.");
            return;
        }

        setLoading(true);
        try {
            await API.post('/api/send-aadhaar-otp', { aadhaar_number: aadhaarNumber });
            setLoading(false);
            setShowOtpModal(true);
            setVerificationStep('OTP');
        } catch (error) {
            console.log(error);
            setLoading(false);
            Alert.alert("Failed", "Could not send OTP. Server might be busy.");
        }
    };

    const verifyOtp = async () => {
        if (otp.length !== 4) {
            Alert.alert("Invalid OTP", "Please enter the 4-digit code.");
            return;
        }

        setLoading(true);
        try {
            const res = await API.post('/api/verify-aadhaar-otp', { aadhaar_number: aadhaarNumber, otp: otp });
            setLoading(false);
            setShowOtpModal(false);
            setVerificationStep('VERIFIED');
            Alert.alert("Success", res.data.message);
        } catch (error) {
            setLoading(false);
            Alert.alert("Verification Failed", "Invalid OTP or Session Expired.");
        }
    };

    // Image Upload Helper
    const uploadImage = async (imageUri) => {

        const formData = new FormData();
        formData.append('file', {
            uri: imageUri,
            name: 'property_photo.jpg',
            type: 'image/jpeg',
        });

        const token = await getToken();

        try {
            // Use the backend upload endpoint we configured
            const uploadRes = await API.post('/api/upload-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            });
            return uploadRes.data.url;
        } catch (error) {
            console.error('Image upload failed:', error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        if (!form.title || !form.price) {
            Alert.alert("Missing Info", "Please fill in property title and price");
            return;
        }
        if (form.mobile.length !== 10) {
            Alert.alert("Invalid Mobile", "Please enter a valid 10-digit mobile number");
            return;
        }

        // Fix: Check for Offline Mode
        const token = await getToken();
        if (!token || token === 'guest_token' || token === 'mock_token_123' || token === 'offline_mode_token') {
            Alert.alert("Offline Mode", "You are currently in Offline/Guest mode. You cannot save data to the website server. Please login with a real account when the server is online.");
            return;
        }

        setLoading(true);
        try {
            // 0. Get User Email
            // We need to implement getUserId properly here or ensure it's imported
            let email = "unknown";
            try {
                const userStr = await AsyncStorage.getItem('user_profile');
                if (userStr) {
                    const u = JSON.parse(userStr);
                    email = u.email;
                }
            } catch (e) { }

            // 1. Upload Images
            const imageUrls = [];
            for (const img of propImages) {
                try {
                    const url = await uploadImage(img.uri);
                    imageUrls.push(url);
                } catch (imgError) {
                    console.error("Image upload failed", imgError);
                    Alert.alert("Image Upload Failed", "Could not upload one or more images. Please check your connection.");
                    setLoading(false);
                    return;
                }
            }

            // 2. Create Property Payload
            const propertyData = {
                title: form.title,
                description: form.desc || 'No description provided',
                property_type: propertyType,
                price: parseFloat(form.price),
                area: area ? parseFloat(area) : null,
                area_unit: areaUnit,
                latitude: location.latitude,
                longitude: location.longitude,
                mobile: form.mobile,
                image_urls: imageUrls.length > 0 ? imageUrls : null,
                user_email: email // Send the user email
            };

            // 3. Submit to Backend
            await API.post('/properties/', propertyData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setLoading(false);
            setSuccessVisible(true);
        } catch (error) {
            console.error('Submission failed:', error);
            setLoading(false);
            const status = error.response ? error.response.status : null;
            if (status === 401) {
                Alert.alert("Session Expired", "Please login again.");
            } else if (status === 422) {
                Alert.alert("Invalid Data", "Please check your inputs.");
            } else {
                Alert.alert("Server Error", "Failed to list property. Ensure the server is online.");
            }
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Header */}
            <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                <LinearGradient
                    colors={[COLORS.primary, COLORS.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <Text style={styles.headerTitle}>List Property</Text>
                    <Text style={styles.headerSub}>Connect with 10,000+ Buyers</Text>
                </LinearGradient>
            </Animated.View>

            <View style={styles.formContent}>
                {/* Property Details Card */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    <GlassCard style={styles.card}>
                        <Text style={styles.sectionTitle}>📋 Property Details</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Type</Text>
                            <View style={styles.pickerWrap}>
                                <Picker
                                    selectedValue={propertyType}
                                    onValueChange={(itemValue) => setPropertyType(itemValue)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Flat / Apartment" value="Flat" />
                                    <Picker.Item label="House / Villa" value="House" />
                                    <Picker.Item label="Plot / Land" value="Plot" />
                                    <Picker.Item label="Farmhouse" value="Farm" />
                                    <Picker.Item label="Commercial Space" value="Commercial" />
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={`e.g. 2BHK ${propertyType} in Lucknow`}
                                placeholderTextColor={COLORS.subText}
                                value={form.title}
                                onChangeText={(txt) => setForm({ ...form, title: txt })}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Price (₹)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 4500000"
                                    placeholderTextColor={COLORS.subText}
                                    keyboardType="numeric"
                                    value={form.price}
                                    onChangeText={(txt) => setForm({ ...form, price: txt.replace(/[^0-9]/g, '') })}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Mobile</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="10 digits"
                                    placeholderTextColor={COLORS.subText}
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    value={form.mobile}
                                    onChangeText={handleMobileChange}
                                />
                            </View>
                        </View>
                        {form.mobile.length === 10 && (
                            <Text style={styles.mobilePreview}>✓ {formatMobile(form.mobile)}</Text>
                        )}

                        {/* Smart Area Field */}
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 2, marginRight: 10 }]}>
                                <Text style={styles.label}>
                                    Area {areaUnit === 'sqft' ? '(Sq. Ft.)' : '(Bigha/Biswaa)'}
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={areaUnit === 'sqft' ? 'e.g. 1200' : 'e.g. 2'}
                                    placeholderTextColor={COLORS.subText}
                                    keyboardType="numeric"
                                    value={area}
                                    onChangeText={(txt) => setArea(txt.replace(/[^0-9.]/g, ''))}
                                />
                            </View>
                            {areaUnit !== 'sqft' && (
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Unit</Text>
                                    <View style={styles.pickerWrap}>
                                        <Picker
                                            selectedValue={areaUnit}
                                            onValueChange={(itemValue) => setAreaUnit(itemValue)}
                                            style={styles.pickerSmall}
                                        >
                                            <Picker.Item label="Bigha" value="bigha" />
                                            <Picker.Item label="Biswaa" value="biswaa" />
                                        </Picker>
                                    </View>
                                </View>
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                placeholder="Describe features, location, amenities..."
                                placeholderTextColor={COLORS.subText}
                                multiline
                                value={form.desc}
                                onChangeText={(txt) => setForm({ ...form, desc: txt })}
                            />
                        </View>
                    </GlassCard>
                </Animated.View>

                {/* Map Location */}
                <Animated.View style={{ opacity: fadeAnim, marginTop: 20 }}>
                    <GlassCard style={styles.card}>
                        <View style={styles.rowBetween}>
                            <Text style={styles.sectionTitle}>📍 Location</Text>
                            <TouchableOpacity
                                style={styles.mapTypeBtn}
                                onPress={() => {
                                    const types = ['standard', 'satellite', 'hybrid'];
                                    const currentIndex = types.indexOf(mapType);
                                    const nextIndex = (currentIndex + 1) % types.length;
                                    setMapType(types[nextIndex]);
                                }}
                            >
                                <Ionicons
                                    name={mapType === 'satellite' ? 'map' : 'globe-outline'}
                                    size={20}
                                    color={COLORS.primary}
                                />
                                <Text style={{ color: COLORS.primary, fontSize: 12, marginLeft: 5, fontWeight: '600' }}>
                                    {mapType === 'standard' ? 'Satellite' : mapType === 'satellite' ? 'Hybrid' : 'Standard'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.mapContainer}>
                            <NativeMap
                                region={{ ...location, latitudeDelta: 0.005, longitudeDelta: 0.005 }}
                                style={{ flex: 1 }}
                                mapType={mapType}
                            >
                                <NativeMarker
                                    coordinate={location}
                                    draggable
                                    onDragEnd={(e) => setLocation(e.nativeEvent.coordinate)}
                                />
                            </NativeMap>
                        </View>
                        <TouchableOpacity
                            style={styles.resetBtn}
                            onPress={() => setLocation({ latitude: 26.8467, longitude: 80.9461 })}
                        >
                            <Ionicons name="refresh" size={16} color={COLORS.primary} />
                            <Text style={{ color: COLORS.primary, marginLeft: 5, fontWeight: '600' }}>Reset to UP Center</Text>
                        </TouchableOpacity>
                    </GlassCard>
                </Animated.View>

                {/* Property Photos */}
                <Animated.View style={{ opacity: fadeAnim, marginTop: 20 }}>
                    <GlassCard style={styles.card}>
                        <View style={styles.rowBetween}>
                            <Text style={styles.sectionTitle}>📷 Photos ({propImages.length}/4)</Text>
                            {propImages.length < 4 && (
                                <TouchableOpacity onPress={pickPropertyImages}>
                                    <Text style={styles.addLink}>+ Add Photo</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                            {propImages.map((img, i) => (
                                <View key={i} style={styles.photoThumb}>
                                    <Image source={{ uri: img.uri }} style={styles.photoImg} />
                                    <TouchableOpacity
                                        style={styles.removePhoto}
                                        onPress={() => setPropImages(propImages.filter((_, idx) => idx !== i))}
                                    >
                                        <Ionicons name="close-circle" size={20} color={COLORS.error} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </GlassCard>
                </Animated.View>

                {/* Aadhaar OTP Verification */}
                <Animated.View style={{ opacity: fadeAnim, marginTop: 20 }}>
                    <GlassCard style={styles.card}>
                        <Text style={styles.sectionTitle}>🛡️ Identity Verification</Text>

                        {verificationStep === 'VERIFIED' ? (
                            <View style={styles.verifiedBox}>
                                <Ionicons name="checkmark-circle" size={60} color={COLORS.success} />
                                <Text style={styles.verifiedText}>Identity Verified ✓</Text>
                                <Text style={styles.verifiedSub}>Aadhaar: ••••••••{aadhaarNumber.slice(-4)}</Text>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.subText}>Create trust by verifying your government ID.</Text>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Aadhaar Number</Text>
                                    <View style={styles.verifyRow}>
                                        <TextInput
                                            style={[styles.input, { flex: 1, letterSpacing: 2 }]}
                                            placeholder="XXXX XXXX XXXX"
                                            placeholderTextColor={COLORS.subText}
                                            keyboardType="number-pad"
                                            maxLength={12}
                                            value={aadhaarNumber}
                                            onChangeText={(txt) => setAadhaarNumber(txt.replace(/[^0-9]/g, ''))}
                                            editable={verificationStep === 'IDLE'}
                                        />
                                        {verificationStep === 'IDLE' && (
                                            <TouchableOpacity
                                                style={[styles.verifyBtn, { opacity: aadhaarNumber.length === 12 ? 1 : 0.6 }]}
                                                disabled={aadhaarNumber.length !== 12 || loading}
                                                onPress={requestOtp}
                                            >
                                                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.verifyBtnText}>Get OTP</Text>}
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    {/* Restore OCR Button */}
                                    {verificationStep === 'IDLE' && (
                                        <TouchableOpacity style={styles.scanBtn} onPress={scanCard}>
                                            <Ionicons name="camera" size={20} color={COLORS.primary} />
                                            <Text style={styles.scanBtnText}>Scan Card with AI</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <Text style={styles.secureNote}>
                                    <Ionicons name="lock-closed" size={12} color={COLORS.subText} /> Secure Govt. Standard Verification
                                </Text>
                            </>
                        )}
                    </GlassCard>
                </Animated.View>

                {/* Submit Button */}
                <View style={{ marginTop: 30 }}>
                    <PremiumButton
                        title={loading ? "Processing..." : "🚀 List Property Now"}
                        onPress={handleSubmit}
                        variant={verificationStep === 'VERIFIED' ? 'primary' : 'secondary'}
                    />
                </View>
            </View>

            {/* OTP Modal */}
            <Modal visible={showOtpModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Enter OTP</Text>
                        <Text style={styles.modalSub}>Sent to mobile linked with Aadhaar ending {aadhaarNumber.slice(-4)}</Text>

                        <TextInput
                            style={styles.otpInput}
                            placeholder="1234"
                            keyboardType="number-pad"
                            maxLength={4}
                            value={otp}
                            onChangeText={setOtp}
                            autoFocus
                        />

                        <Text style={{ color: COLORS.subText, fontSize: 12, marginBottom: 20 }}>
                            Development Hint: Use OTP <Text style={{ fontWeight: 'bold' }}>1234</Text>
                        </Text>

                        <PremiumButton
                            title={loading ? "Verifying..." : "Verify Identity"}
                            onPress={verifyOtp}
                            style={{ width: '100%' }}
                        />

                        <TouchableOpacity
                            onPress={() => { setShowOtpModal(false); setVerificationStep('IDLE'); setLoading(false); }}
                            style={{ marginTop: 15 }}
                        >
                            <Text style={{ color: COLORS.subText }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Success Modal */}
            <Modal visible={successVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.successModal}>
                        <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
                        <Text style={styles.successModalTitle}>Property Listed!</Text>
                        <Text style={styles.successModalSub}>Your listing is now live</Text>
                        <PremiumButton
                            title="Done"
                            onPress={() => {
                                setSuccessVisible(false);
                                // Reset form
                                setForm({ title: '', price: '', desc: '', mobile: '' });
                                setAadhaarNumber('');
                                setVerificationStep('IDLE');
                                setPropImages([]);
                            }}
                            style={{ marginTop: 20 }}
                        />
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { marginBottom: -20, zIndex: 1 },
    headerGradient: { padding: 30, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: 'white' },
    headerSub: { color: 'rgba(255,255,255,0.9)', marginTop: 5 },

    formContent: { padding: 20 },
    card: { padding: 20, marginBottom: 0 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 15 },

    inputGroup: { marginBottom: 15 },
    label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
    input: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SIZES.radius,
        padding: 14,
        fontSize: 16,
        color: COLORS.text,
    },
    row: { flexDirection: 'row' },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    mapTypeBtn: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#EEF2FF', borderRadius: 8 },
    pickerWrap: { borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radius, backgroundColor: COLORS.surface },
    picker: { height: 50 },
    pickerSmall: { height: 50, fontSize: 14 },

    mobilePreview: { fontSize: 12, color: COLORS.success, marginTop: -10, marginBottom: 10, fontWeight: '600' },

    mapContainer: { height: 200, borderRadius: SIZES.radius, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
    resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10, padding: 8 },

    addLink: { color: COLORS.primary, fontWeight: 'bold', fontSize: 14 },
    photoThumb: { marginRight: 10 },
    photoImg: { width: 80, height: 80, borderRadius: 12 },
    removePhoto: { position: 'absolute', top: -5, right: -5, backgroundColor: 'white', borderRadius: 10 },

    subText: { fontSize: 14, color: COLORS.subText, marginBottom: 15 },
    uploadBox: {
        height: 150,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
        borderRadius: SIZES.radius,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
    },
    docPreview: { width: '100%', height: '100%' },

    scanningBox: { alignItems: 'center', padding: 20 },
    scanText: { marginTop: 15, fontSize: 16, fontWeight: '600', color: COLORS.primary, textAlign: 'center' },
    progressBar: { width: '100%', height: 8, backgroundColor: COLORS.border, borderRadius: 4, marginTop: 15, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: COLORS.primary },
    progressText: { marginTop: 5, fontSize: 12, color: COLORS.subText },

    successTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.success, marginBottom: 10 },
    dataRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    dataLabel: { color: COLORS.subText },
    dataValue: { fontWeight: '600', color: COLORS.text },

    verifiedBox: { alignItems: 'center', padding: 20 },
    verifiedText: { fontSize: 20, fontWeight: 'bold', color: COLORS.success, marginTop: 10 },
    verifiedSub: { fontSize: 14, color: COLORS.subText, marginTop: 5 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 24, padding: 30, alignItems: 'center', width: '100%', maxWidth: 340 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
    modalSub: { fontSize: 14, color: COLORS.subText, marginTop: 5, marginBottom: 20 },
    otpInput: {
        width: '100%',
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderRadius: SIZES.radius,
        padding: 16,
        fontSize: 24,
        textAlign: 'center',
        letterSpacing: 10,
    },

    successModal: { backgroundColor: 'white', borderRadius: 24, padding: 30, alignItems: 'center', width: '100%', maxWidth: 340 },
    successModalTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginTop: 20 },
    successModalSub: { fontSize: 16, color: COLORS.subText, marginTop: 5 },

    // New styles for Aadhaar Input
    verifyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    verifyBtn: { backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 20, borderRadius: SIZES.radius, alignItems: 'center', justifyContent: 'center' },
    verifyBtnText: { color: 'white', fontWeight: 'bold' },
    scanBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: SIZES.radius,
        backgroundColor: '#EEF2FF',
        gap: 8
    },
    scanBtnText: { color: COLORS.primary, fontWeight: '600' },
    secureNote: { marginTop: 15, textAlign: 'center', color: COLORS.success, fontSize: 12, fontWeight: '600' }
});
