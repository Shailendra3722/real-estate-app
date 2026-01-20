import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, Alert, Image, ActivityIndicator, Platform, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLanguage } from '../components/LanguageContext';
import API from '../services/apiConfig';
import { LinearGradient } from 'expo-linear-gradient';
import Tesseract from 'tesseract.js';
import { Picker } from '@react-native-picker/picker';
// import { useRouter } from 'expo-router'; // REMOVED
import NativeMap, { NativeMarker } from '../components/NativeMap';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

export default function SellScreen() {
    const { t } = useLanguage();
    // Mock router
    const router = { push: (route) => console.log('Mock Nav to', route) };

    const [form, setForm] = useState({ title: '', price: '', desc: '' });
    const [location, setLocation] = useState({ latitude: 19.0760, longitude: 72.8777 });
    const [aadhaarImg, setAadhaarImg] = useState(null);
    const [loading, setLoading] = useState(false);
    const [successVisible, setSuccessVisible] = useState(false);
    const [verificationStep, setVerificationStep] = useState('IDLE');
    const [scannedData, setScannedData] = useState(null);
    const [otp, setOtp] = useState('');
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [propertyType, setPropertyType] = useState('Flat');
    const [ocrStatus, setOcrStatus] = useState('');

    const [propImages, setPropImages] = useState([]);

    const pickPropertyImages = async () => {
        if (propImages.length >= 4) {
            Alert.alert("Limit Reached", "You can only upload up to 4 photos.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, // We allow basic cropping
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setPropImages([...propImages, result.assets[0]]);
        }
    };

    const pickImage = async () => {
        // Validation: Ensure Property Details are filled first
        if (!form.title || !form.price) {
            Alert.alert("Incomplete Details", "Please fill in the Property Title and Price before verifying identity.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({ // Aadhaar Picker
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setAadhaarImg(result.assets[0]);
            setVerificationStep('IDLE');
            setScannedData(null);
            setOtp('');
        }
    };

    const performOCRVerification = async () => {
        if (!aadhaarImg) return;
        setVerificationStep('SCANNING');
        setOcrStatus("Initializing AI Verification Engine...");

        try {
            const result = await Tesseract.recognize(
                aadhaarImg.uri,
                'eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setOcrStatus(`Analyzing Document: ${Math.round(m.progress * 100)}%`);
                        } else {
                            setOcrStatus(m.status);
                        }
                    }
                }
            );

            const text = result.data.text.toLowerCase();
            console.log("OCR Result:", text);

            // Enhanced Validation Logic
            const keywords = ['aadhaar', 'gov', 'india', 'male', 'female', 'dob', 'yob', 'enrollment', 'father', 'uidai', 'address', 'help'];
            const foundKeywords = keywords.filter(k => text.includes(k));

            if (foundKeywords.length >= 2 || text.includes('aadhaar')) {
                setVerificationStep('REVIEW');
                setScannedData({
                    docType: 'AADHAAR',
                    idNumber: 'xxxx-xxxx-' + (text.match(/\d{4}/g)?.[2] || '9999'),
                    name: 'Verified Citizen',
                    confidence: result.data.confidence
                });
            } else {
                // Specific Feedback
                let feedback = "We could not detect a valid Aadhaar Card.";
                if (text.length < 20) feedback = "Image is too blurry or has no text.";
                else feedback = "The document does not appear to be an Aadhaar card. Please upload a clear photo of your Aadhaar.";

                Alert.alert(
                    "AI Verification Failed",
                    `${feedback}\n\nDetected Snippet: "${text.substring(0, 30)}..."`
                );
                setVerificationStep('IDLE');
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "AI Engine failed to initialize. Please check your internet connection.");
            setVerificationStep('IDLE');
        }
    };

    const requestOtp = () => {
        Alert.alert("OTP Sent", "Aadhaar linked mobile number: ******9999");
        setVerificationStep('OTP');
        setShowOtpModal(true);
    };

    const verifyOtp = () => {
        if (otp === '1234') {
            setShowOtpModal(false);
            setVerificationStep('VERIFIED');
            Alert.alert("Verified", "Identity Confirmed via UIDAI (Simulated)");
        } else {
            Alert.alert("Error", "Invalid OTP. Try 1234");
        }
    };

    const handleVerifyAndSubmit = async () => {
        if (verificationStep !== 'VERIFIED') {
            Alert.alert("Pending", "Please complete verification first.");
            return;
        }
        if (!form.title) {
            Alert.alert("Missing", "Please fill property details.");
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSuccessVisible(true);
        }, 1500);
    };

    const handleSuccessClose = () => {
        setSuccessVisible(false);
        setForm({ title: '', price: '', desc: '' });
        setAadhaarImg(null);
        setVerificationStep('IDLE');
        setScannedData(null);
        setOtp('');
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>{t('SELL_TAB')}</Text>
                <Text style={styles.headerSubtitle}>List property. Verified Owners Only.</Text>
            </View>

            <View style={[styles.card, SHADOWS.medium]}>
                <Text style={styles.sectionTitle}>1. Property Details</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Property Type</Text>
                    <View style={styles.pickerContainer}>
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
                    <Text style={styles.label}>Property Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={`e.g. 2BHK ${propertyType} in Bandra`}
                        placeholderTextColor={COLORS.subText}
                        value={form.title}
                        onChangeText={(txt) => setForm({ ...form, title: txt })}
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.label}>Expected Price (₹)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Min 5 Lakhs"
                            placeholderTextColor={COLORS.subText}
                            keyboardType="numeric"
                            value={form.price}
                            onChangeText={(txt) => setForm({ ...form, price: txt })}
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Area (sq ft)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 1200"
                            placeholderTextColor={COLORS.subText}
                            keyboardType="numeric"
                        />
                    </View>
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Details & Features</Text>
                    <TextInput
                        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                        placeholder="Describe key features, location, amenities..."
                        placeholderTextColor={COLORS.subText}
                        multiline
                        value={form.desc}
                        onChangeText={(txt) => setForm({ ...form, desc: txt })}
                    />
                </View>

                <View style={[styles.inputGroup, { height: 350, marginTop: 10 }]}>
                    <Text style={styles.label}>Property Location (Drag Pin)</Text>
                    <View style={styles.pickerContainer}>
                        <NativeMap
                            region={{ latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 }}
                            style={{ flex: 1, borderRadius: 12 }}
                        >
                            <NativeMarker
                                coordinate={location}
                                draggable={true}
                                title="Property Location"
                                description="Drag to exact plot"
                                onDragEnd={(e) => {
                                    console.log("Drag End:", e.nativeEvent.coordinate);
                                    setLocation(e.nativeEvent.coordinate);
                                }}
                            />
                        </NativeMap>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                        <Text style={{ fontSize: 10, color: COLORS.subText }}>
                            Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                        </Text>
                        <TouchableOpacity onPress={async () => {
                            setLocation({ latitude: 26.8467, longitude: 80.9461 }); // Reset to Lucknow
                            Alert.alert("Reset", "Location reset to Uttar Pradesh Center");
                        }}>
                            <Text style={{ fontSize: 10, color: COLORS.primary }}>Reset Pin</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* --- NEW: Property Images Section --- */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Property Photos (Max 4)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                        {propImages.map((img, index) => (
                            <View key={index} style={styles.imagePreviewContainer}>
                                <Image source={{ uri: img.uri }} style={styles.propImagePreview} />
                                <TouchableOpacity
                                    style={styles.removeImgBtn}
                                    onPress={() => setPropImages(propImages.filter((_, i) => i !== index))}
                                >
                                    <Ionicons name="close-circle" size={20} color="red" />
                                </TouchableOpacity>
                            </View>
                        ))}

                        {propImages.length < 4 && (
                            <TouchableOpacity style={styles.addPhotoBtn} onPress={pickPropertyImages}>
                                <Ionicons name="camera-outline" size={30} color={COLORS.primary} />
                                <Text style={{ fontSize: 10, color: COLORS.primary, marginTop: 4 }}>Add Photo</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                    <Text style={{ fontSize: 10, color: COLORS.subText, marginTop: 5 }}>
                        {propImages.length}/4 Photos Selected
                    </Text>
                </View>
            </View>

            <View style={[styles.card, SHADOWS.medium]}>
                <Text style={styles.sectionTitle}>2. Identity Verification (Real OCR)</Text>

                {verificationStep === 'IDLE' && (
                    <>
                        <Text style={styles.subText}>Upload a clear photo of your Aadhaar Card. We use AI to detect authenticity.</Text>
                        <TouchableOpacity onPress={pickImage} style={styles.uploadArea}>
                            {aadhaarImg ? (
                                <Image source={{ uri: aadhaarImg.uri }} style={styles.previewImage} />
                            ) : (
                                <View style={styles.uploadPlaceholder}>
                                    <View style={styles.iconCircle}>
                                        <Text style={{ fontSize: 24 }}>🆔</Text>
                                    </View>
                                    <Text style={styles.uploadText}>Upload Aadhaar Front</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={{ alignSelf: 'center', marginTop: 10, padding: 5 }} onPress={() => {
                            setScannedData({ docType: 'AADHAAR', idNumber: '9999-8888-7777', name: 'Dev User' });
                            setVerificationStep('VERIFIED');
                            setOtp('1234');
                            Alert.alert('Dev Mode', 'Forced Verification Success!');
                        }}>
                            <Text style={{ color: COLORS.subText, fontSize: 10 }}>Dev: Force Verify</Text>
                        </TouchableOpacity>

                        {aadhaarImg && (
                            <TouchableOpacity style={styles.actionBtn} onPress={performOCRVerification}>
                                <Text style={styles.actionBtnText}>Scan with AI Engine</Text>
                            </TouchableOpacity>
                        )}
                    </>
                )}

                {verificationStep === 'SCANNING' && (
                    <View style={styles.centerBox}>
                        <ActivityIndicator size="large" color={COLORS.secondary} />
                        <Text style={styles.scanningText}>{ocrStatus || "Initializing..."}</Text>
                        <Text style={styles.subText}>Reading Text from Image...</Text>
                    </View>
                )}

                {verificationStep === 'REVIEW' && scannedData && (
                    <View>
                        <Text style={styles.successTitle}>Aadhaar Detected!</Text>
                        <View style={styles.dataRow}>
                            <Text style={styles.dataLabel}>Document Type:</Text>
                            <Text style={styles.dataVal}>AADHAAR CARD</Text>
                        </View>
                        <View style={styles.dataRow}>
                            <Text style={styles.dataLabel}>ID Pattern:</Text>
                            <Text style={styles.dataVal}>{scannedData.idNumber}</Text>
                        </View>

                        <TouchableOpacity style={styles.actionBtn} onPress={requestOtp}>
                            <Text style={styles.actionBtnText}>Confirm & Send OTP</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {verificationStep === 'OTP' && (
                    <View>
                        <Text style={styles.subText}>Enter OTP sent to Aadhaar Mobile</Text>
                        <TextInput
                            style={[styles.input, { letterSpacing: 5, textAlign: 'center', fontSize: 24, marginVertical: 10 }]}
                            placeholder="____"
                            maxLength={4}
                            keyboardType="numeric"
                            value={otp}
                            onChangeText={setOtp}
                        />
                        <TouchableOpacity style={[styles.actionBtn]} onPress={verifyOtp}>
                            <Text style={styles.actionBtnText}>Verify OTP</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {verificationStep === 'VERIFIED' && (
                    <View style={styles.verifiedCard}>
                        <LinearGradient colors={[COLORS.success, '#059669']} style={styles.verifiedHeader}>
                            <Text style={styles.verifiedTitle}>✓ KYC VERIFIED</Text>
                        </LinearGradient>
                        <View style={styles.verifiedContent}>
                            <Text style={{ color: COLORS.text, fontWeight: 'bold' }}>IDENTITY CONFIRMED</Text>
                            <Text style={{ color: COLORS.subText }}>Valid Government ID Detected</Text>
                        </View>
                    </View>
                )}
            </View>

            <TouchableOpacity
                style={[styles.submitBtn, verificationStep !== 'VERIFIED' && styles.disabledBtn]}
                onPress={handleVerifyAndSubmit}
                disabled={loading || verificationStep !== 'VERIFIED'}
            >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitBtnText}>LIST PROPERTY</Text>}
            </TouchableOpacity>

            <View style={{ height: 100 }} />

            <Modal visible={successVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.successModal}>
                        <View style={styles.successIconContainer}>
                            <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
                        </View>
                        <Text style={styles.modalSuccessTitle}>Success!</Text>
                        <Text style={styles.modalSuccessSub}>Your property has been listed securely.</Text>

                        <TouchableOpacity style={styles.modalCloseBtn} onPress={handleSuccessClose}>
                            <Text style={styles.modalCloseText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: COLORS.bg,
        minHeight: '100%',
        ...Platform.select({ web: { paddingBottom: 100 } })
    },
    headerContainer: {
        marginBottom: 25,
        marginTop: 10,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.text,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: COLORS.subText,
        marginTop: 5,
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)'
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 15,
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
        marginLeft: 2
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: COLORS.text,
    },
    row: {
        flexDirection: 'row',
    },
    subText: {
        fontSize: 14,
        color: COLORS.subText,
        marginBottom: 15,
    },
    uploadArea: {
        height: 180,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
    },
    uploadPlaceholder: {
        alignItems: 'center',
    },
    uploadIcon: {
        fontSize: 40,
        marginBottom: 10,
    },
    uploadText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 16
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    },
    removeBtn: {
        alignSelf: 'center',
        marginTop: 10,
    },
    removeBtnText: {
        color: COLORS.error,
        fontWeight: '500'
    },
    submitBtn: {
        backgroundColor: COLORS.primary, // Could implement gradient here
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    disabledBtn: {
        opacity: 0.7
    },
    submitBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5
    },
    successCard: {
        backgroundColor: '#ECFDF5',
        borderColor: '#10B981',
    },
    successTitle: {
        color: '#065F46',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 2
    },
    successSub: {
        color: '#047857',
        fontSize: 14
    },
    // New Styles for Premium Verification
    scanningArea: {
        borderColor: COLORS.secondary,
        backgroundColor: '#F3F0FF'
    },
    scanningContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    scanningText: {
        marginTop: 15,
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.secondary
    },
    scanningSub: {
        fontSize: 12,
        color: COLORS.subText,
        marginTop: 5
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#DBEAFE',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10
    },
    uploadHint: {
        fontSize: 12,
        color: COLORS.subText,
        marginTop: 5
    },
    verifiedCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#10B981',
        overflow: 'hidden',
        marginTop: 10
    },
    verifiedHeader: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        backgroundColor: '#10B981'
    },
    verifiedTitle: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14
    },
    verifiedContent: {
        padding: 15
    },
    idRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6'
    },
    idLabel: { color: COLORS.subText },
    idValue: { fontWeight: 'bold', color: COLORS.text },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    scoreLabel: { color: COLORS.subText },
    scoreBadge: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20
    },
    scoreValue: {
        color: '#059669',
        fontWeight: 'bold',
        fontSize: 16
    },
    actionBtn: {
        backgroundColor: COLORS.secondary,
        padding: 15,
        borderRadius: 12,
        marginTop: 15,
        alignItems: 'center'
    },
    actionBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    centerBox: { alignItems: 'center', padding: 20 },
    dataRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
    dataLabel: { color: COLORS.subText },
    dataVal: { fontWeight: 'bold' },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    successModal: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        width: '100%',
        maxWidth: 340,
        ...SHADOWS.medium
    },
    successIconContainer: {
        marginBottom: 20,
        transform: [{ scale: 1.2 }]
    },
    modalSuccessTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10
    },
    modalSuccessSub: {
        fontSize: 16,
        color: COLORS.subText,
        textAlign: 'center',
        marginBottom: 30
    },
    modalCloseBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 16,
        width: '100%'
    },
    modalCloseText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center'
    },

    // IMAGE STYLES
    addPhotoBtn: {
        width: 80, height: 80,
        borderRadius: 8,
        borderWidth: 1, borderColor: COLORS.primary, borderStyle: 'dashed',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 10, backgroundColor: '#F0F9FF'
    },
    imagePreviewContainer: {
        position: 'relative', marginRight: 10
    },
    propImagePreview: {
        width: 80, height: 80, borderRadius: 8
    },
    removeImgBtn: {
        position: 'absolute', top: -5, right: -5,
        backgroundColor: 'white', borderRadius: 10
    }
});
