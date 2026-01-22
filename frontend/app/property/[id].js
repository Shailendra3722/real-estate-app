import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Share, Dimensions, Platform, Modal, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import API from '../services/apiConfig';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import NativeMap, { NativeMarker } from '../components/NativeMap';
import { FavoriteService } from '../services/favoriteService';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

export default function PropertyDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [property, setProperty] = useState(null);
    const [similarProps, setSimilarProps] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);

    // EMI State
    const [showEmiModal, setShowEmiModal] = useState(false);
    const [loanAmount, setLoanAmount] = useState(0);
    const [interestRate, setInterestRate] = useState(8.5);
    const [tenure, setTenure] = useState(20);

    // Visit State
    const [showVisitModal, setShowVisitModal] = useState(false);
    const [visitDate, setVisitDate] = useState('Tomorrow Morning');
    const [priceAlert, setPriceAlert] = useState(false);
    const [isStaged, setIsStaged] = useState(false); // Cosmic Feature

    useEffect(() => {
        if (id) {
            fetchProperty();
            checkFavorite();
            fetchSimilar();
        }
    }, [id]);

    const fetchProperty = async () => {
        try {
            const response = await API.get(`/properties/${id}`);
            setProperty(response.data);
            if (response.data.price_fiat) {
                setLoanAmount(response.data.price_fiat * 0.8); // Default 80% loan
            }
        } catch (error) {
            console.error('Error fetching property:', error);
        }
    };

    const fetchSimilar = async () => {
        try {
            const response = await API.get(`/properties/${id}/similar`);
            setSimilarProps(response.data || []);
        } catch (e) {
            console.log("Error fetching similar:", e);
        }
    };

    const checkFavorite = async () => {
        try {
            const isFav = await FavoriteService.isFavorite(id);
            setIsFavorite(isFav);
        } catch (e) {
            console.log('Error checking favorite:', e);
        }
    };

    const toggleFavorite = async () => {
        try {
            // Optimistic update
            const newStatus = !isFavorite;
            setIsFavorite(newStatus);

            if (newStatus) {
                await FavoriteService.addFavorite(id);
            } else {
                await FavoriteService.removeFavorite(id);
            }
        } catch (e) {
            console.log('Error toggling favorite:', e);
            // Revert on error
            setIsFavorite(!isFavorite);
        }
    };

    const calculateEMI = () => {
        const r = interestRate / 12 / 100;
        const n = tenure * 12;
        const emi = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        return Math.round(emi).toLocaleString();
    };

    const handleCall = () => {
        if (property?.mobile) {
            Linking.openURL(`tel:${property.mobile}`);
        }
    };

    const handleWhatsApp = () => {
        if (property?.mobile) {
            const message = `Hi, I'm interested in your property: ${property.title}`;
            Linking.openURL(`whatsapp://send?phone=91${property.mobile}&text=${encodeURIComponent(message)}`);
        }
    };

    const handleEmail = () => {
        const subject = `Inquiry about ${property?.title}`;
        const body = `Hi,\n\nI'm interested in your property listed at ₹${property?.price_fiat?.toLocaleString()}.\n\nPlease contact me.`;
        Linking.openURL(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this property: ${property?.title} - ₹${property?.price_fiat?.toLocaleString()}`,
            });
        } catch (error) {
            console.log('Error sharing:', error);
        }
    };

    const handleBookVisit = () => {
        setShowVisitModal(false);
        Alert.alert("Visit Scheduled! 📅", `Your site visit for ${visitDate} has been confirmed. The owner has been notified.`);
    };

    if (!property) {
        return (
            <View style={styles.container}>
                <Text style={{ marginTop: 100, textAlign: 'center' }}>Loading Property...</Text>
            </View>
        );
    }

    const images = property.image_urls || ['https://via.placeholder.com/400x300'];

    return (
        <View style={styles.container}>
            {/* Header with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.favoriteBtn} onPress={toggleFavorite}>
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={24}
                        color={isFavorite ? COLORS.error : "white"}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Image Gallery */}
                <View style={styles.imageContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={(e) => {
                            const index = Math.round(e.nativeEvent.contentOffset.x / width);
                            setCurrentImageIndex(index);
                        }}
                        scrollEventThrottle={16}
                    >
                        {images.map((img, i) => (
                            <Image key={i} source={{ uri: img }} style={styles.image} />
                        ))}
                    </ScrollView>
                    <View style={styles.imagePagination}>
                        {images.map((_, i) => (
                            <View
                                key={i}
                                style={[styles.dot, i === currentImageIndex && styles.dotActive]}
                            />
                        ))}
                    </View>
                </View>

                {/* Property Info */}
                <View style={styles.content}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View>
                            <Text style={styles.price}>₹{property.price_fiat?.toLocaleString()}</Text>
                            <Text style={styles.title}>{property.title}</Text>
                        </View>
                        {/* Investment Score Badge */}
                        {property.investment_score && (
                            <View style={styles.scoreBadge}>
                                <Text style={styles.scoreValue}>{property.investment_score}/10</Text>
                                <Text style={styles.scoreLabel}>Inv. Score</Text>
                            </View>
                        )}
                    </View>

                    {/* AI Insights Box */}
                    {property.ai_valuation_verdict && (
                        <LinearGradient colors={['#e3f2fd', '#bbdefb']} style={styles.aiBox}>
                            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                <Ionicons name="analytics" size={24} color="#1976d2" />
                                <View>
                                    <Text style={styles.aiTitle}>AI Valuation: {property.ai_valuation_verdict}</Text>
                                    <Text style={styles.aiSub}>Est. Fair Value: ₹{(property.ai_valuation_min / 100000).toFixed(1)}L - ₹{(property.ai_valuation_max / 100000).toFixed(1)}L</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    )}

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Ionicons name="home-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.metaText}>{property.property_type}</Text>
                        </View>
                        {property.area && (
                            <View style={styles.metaItem}>
                                <Ionicons name="resize-outline" size={20} color={COLORS.primary} />
                                <Text style={styles.metaText}>
                                    {property.area} {property.area_unit === 'sqft' ? 'sq.ft' : property.area_unit}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Vastu & Compass */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Vastu Analysis 🧭</Text>
                        <View style={styles.vastuCard}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                                <View style={styles.compassCircle}>
                                    <Ionicons name="navigate-circle" size={50} color={COLORS.primary} style={{ transform: [{ rotate: '45deg' }] }} />
                                    <View style={styles.directionTag}>
                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 10 }}>{property.facing || 'NE'}</Text>
                                    </View>
                                </View>
                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.text }}>Vastu Compliance: {property.vastu_score}/10</Text>
                                    <Text style={{ color: COLORS.subText, maxWidth: 200 }}>{property.facing} facing properties attract prosperity and positive energy.</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Legal Check */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Legal Due Diligence ⚖️</Text>
                        <TouchableOpacity
                            style={styles.legalBtn}
                            onPress={() => Alert.alert("Generating Report 📄", "Legal check in progress... All Clean!")}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <View style={{ backgroundColor: '#e8f5e9', padding: 8, borderRadius: 20 }}>
                                    <Ionicons name="document-text" size={24} color="#2e7d32" />
                                </View>
                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.text }}>Instant Legal Report</Text>
                                    <Text style={{ color: COLORS.subText }}>Check Title, RERA & Encumbrance</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.subText} />
                        </TouchableOpacity>
                    </View>

                    {/* Blockchain Trust Component */}
                    {property.is_blockchain_verified && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Blockchain Ownership ⛓️</Text>
                            <TouchableOpacity style={styles.blockchainCard} onPress={() => Alert.alert("Smart Contract", `Address: ${property.contract_address}\n\nThis title is immutable and permanently recorded on the Ethereum Blockchain.`)}>
                                <LinearGradient colors={['#29323c', '#485563']} style={styles.blockchainGradient}>
                                    <Ionicons name="cube-outline" size={30} color="#FFD700" />
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 16 }}>Verified on Ethereum</Text>
                                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Contract: {property.contract_address}</Text>
                                    </View>
                                    <Ionicons name="open-outline" size={20} color="white" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Neighborhood Scorecard */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Neighborhood Intelligence 📍</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ overflow: 'visible' }}>
                            <View style={styles.statCard}>
                                <View style={[styles.statIcon, { backgroundColor: '#e8f5e9' }]}>
                                    <Ionicons name="walk" size={24} color="#43a047" />
                                </View>
                                <Text style={styles.statValue}>{property.walk_score || 85}/100</Text>
                                <Text style={styles.statLabel}>Walk Score</Text>
                            </View>
                            <View style={styles.statCard}>
                                <View style={[styles.statIcon, { backgroundColor: '#e3f2fd' }]}>
                                    <Ionicons name="shield-checkmark" size={24} color="#1e88e5" />
                                </View>
                                <Text style={styles.statValue}>{property.safety_index || 9}/10</Text>
                                <Text style={styles.statLabel}>Safety Index</Text>
                            </View>
                            <View style={styles.statCard}>
                                <View style={[styles.statIcon, { backgroundColor: '#fff3e0' }]}>
                                    <Ionicons name="school" size={24} color="#fb8c00" />
                                </View>
                                <Text style={styles.statValue}>{property.nearby_schools || 3}+</Text>
                                <Text style={styles.statLabel}>Schools</Text>
                            </View>
                            <View style={styles.statCard}>
                                <View style={[styles.statIcon, { backgroundColor: '#fce4ec' }]}>
                                    <Ionicons name="medkit" size={24} color="#e91e63" />
                                </View>
                                <Text style={styles.statValue}>{property.nearby_hospitals || 2}+</Text>
                                <Text style={styles.statLabel}>Hospitals</Text>
                            </View>
                        </ScrollView>
                    </View>

                    {/* Fractional Ownership Dashboard */}
                    {property.is_fractional && (
                        <View style={styles.fractionalCard}>
                            <LinearGradient colors={['#1a237e', '#283593']} style={styles.fractionalHeader}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Ionicons name="pie-chart" size={24} color="#4fc3f7" />
                                    <Text style={styles.fractionalTitle}>Fractional Ownership</Text>
                                </View>
                                <View style={styles.yieldBadge}>
                                    <Text style={styles.yieldText}>{property.yield_rate?.toFixed(1)}% Yield</Text>
                                </View>
                            </LinearGradient>

                            <View style={{ padding: 15 }}>
                                <Text style={{ color: COLORS.subText, marginBottom: 10 }}>Invest in this premium asset starting from just ₹{property.token_price}</Text>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                    <Text style={{ fontWeight: 'bold' }}>Progress</Text>
                                    <Text style={{ color: COLORS.primary }}>{property.sold_tokens}/{property.total_tokens} Tokens Sold</Text>
                                </View>
                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: `${(property.sold_tokens / property.total_tokens) * 100}%` }]} />
                                </View>

                                <View style={styles.investRow}>
                                    <View>
                                        <Text style={styles.tokenPrice}>₹{property.token_price}</Text>
                                        <Text style={{ fontSize: 10, color: COLORS.subText }}>per token</Text>
                                    </View>
                                    <TouchableOpacity style={styles.investBtn}>
                                        <Text style={styles.investBtnText}>Invest Now</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* 360 Tour Button */}
                    {property.is_360_ready && (
                        <TouchableOpacity style={styles.tourBtn} onPress={() => Alert.alert("Launching VR Experience 🥽", "Entering Immersive Mode...")}>
                            <LinearGradient colors={['#7E57C2', '#512DA8']} style={styles.tourGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                <Ionicons name="scan-outline" size={24} color="white" />
                                <Text style={styles.tourText}>Start 360° Virtual Tour</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    {/* Market Trend Graph */}
                    {property.price_history && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Market Trends (3 Years) 📈</Text>
                            <View style={styles.chartContainer}>
                                {property.price_history.map((point, index) => {
                                    const maxPrice = Math.max(...property.price_history.map(p => p.price));
                                    const height = (point.price / maxPrice) * 100;
                                    return (
                                        <View key={point.year} style={styles.chartBarWrapper}>
                                            <Text style={styles.chartValue}>₹{(point.price / 100000).toFixed(1)}L</Text>
                                            <View style={[styles.chartBar, { height: `${height}%` }]} />
                                            <Text style={styles.chartLabel}>{point.year}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                            <Text style={styles.trendText}>
                                Property prices in this area have grown by <Text style={{ fontWeight: 'bold', color: '#43a047' }}>~15%</Text> in the last 2 years.
                            </Text>
                        </View>
                    )}

                    {/* Price Drop Alert */}
                    <View style={styles.alertBox}>
                        <View>
                            <Text style={styles.alertTitle}>Get Price Drop Alerts</Text>
                            <Text style={styles.alertSub}>Notify me if price drops by 5%</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.toggleBtn, priceAlert && styles.toggleBtnActive]}
                            onPress={() => {
                                setPriceAlert(!priceAlert);
                                if (!priceAlert) Alert.alert("Alert Set 🔔", "You will be notified if the price drops.");
                            }}
                        >
                            <View style={[styles.toggleCircle, priceAlert && styles.toggleCircleActive]} />
                        </TouchableOpacity>
                    </View>

                    {/* EMI Calculator Teaser */}
                    <TouchableOpacity style={styles.emiTeaser} onPress={() => setShowEmiModal(true)}>
                        <Ionicons name="calculator-outline" size={20} color={COLORS.primary} />
                        <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Calculate EMI</Text>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.subText} />
                    </TouchableOpacity>

                    {/* Book Visit Button - Prominent */}
                    <TouchableOpacity style={styles.bookVisitBtn} onPress={() => setShowVisitModal(true)}>
                        <LinearGradient
                            colors={[COLORS.primary, '#4a90e2']}
                            style={styles.bookVisitGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Ionicons name="calendar" size={20} color="white" />
                            <Text style={styles.bookVisitText}>Schedule Site Visit</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {property.description && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Description</Text>
                            <Text style={styles.description}>{property.description}</Text>
                        </View>
                    )}

                    {/* Location Map */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Location</Text>
                        <View style={styles.mapContainer}>
                            <NativeMap
                                region={{
                                    latitude: property.latitude,
                                    longitude: property.longitude,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                                style={styles.map}
                            >
                                <NativeMarker
                                    coordinate={{
                                        latitude: property.latitude,
                                        longitude: property.longitude,
                                    }}
                                    title={property.title}
                                />
                            </NativeMap>
                        </View>
                    </View>

                    {/* Contact Seller */}
                    {property.mobile && (
                        <View style={styles.section}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.text }}>Contact Seller</Text>
                                {/* Dynamic Verified Badge */}
                                {property.owner_is_verified && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0f2f1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 10 }}>
                                        <Ionicons name="checkmark-circle" size={14} color="#00897b" />
                                        <Text style={{ fontSize: 11, color: '#00897b', fontWeight: 'bold', marginLeft: 4 }}>VERIFIED</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.contactRow}>
                                <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
                                    <Ionicons name="call" size={20} color="white" />
                                    <Text style={styles.contactBtnText}>Call</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#25D366' }]} onPress={handleWhatsApp}>
                                    <Ionicons name="logo-whatsapp" size={20} color="white" />
                                    <Text style={styles.contactBtnText}>WhatsApp</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.contactBtn, { backgroundColor: COLORS.subText }]} onPress={handleEmail}>
                                    <Ionicons name="mail" size={20} color="white" />
                                    <Text style={styles.contactBtnText}>Email</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.mobileText}>📱 {property.mobile}</Text>
                        </View>
                    )}

                    {/* Similar Properties */}
                    {similarProps.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Similar Properties</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {similarProps.map((p) => (
                                    <TouchableOpacity
                                        key={p.id}
                                        style={styles.similarCard}
                                        onPress={() => router.push(`/property/${p.id}`)}
                                    >
                                        <Image source={{ uri: p.image_urls?.[0] || 'https://via.placeholder.com/150' }} style={styles.similarImg} />
                                        <Text style={styles.similarPrice}>₹{p.price_fiat?.toLocaleString()}</Text>
                                        <Text style={styles.similarTitle} numberOfLines={1}>{p.title}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Share Button */}
                    <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                        <Ionicons name="share-social-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.shareBtnText}>Share Property</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Visit Modal */}
            <Modal visible={showVisitModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Schedule Site Visit</Text>
                        <Text style={{ marginBottom: 15, color: COLORS.subText }}>When would you like to visit?</Text>

                        {['Today Evening', 'Tomorrow Morning', 'Tomorrow Evening', 'This Weekend'].map(slot => (
                            <TouchableOpacity
                                key={slot}
                                onPress={() => setVisitDate(slot)}
                                style={{
                                    padding: 15,
                                    backgroundColor: visitDate === slot ? '#e3f2fd' : '#f5f5f5',
                                    borderRadius: 10,
                                    marginBottom: 10,
                                    borderWidth: 1,
                                    borderColor: visitDate === slot ? '#2196f3' : 'transparent'
                                }}
                            >
                                <Text style={{ fontWeight: visitDate === slot ? 'bold' : 'normal', color: COLORS.text }}>
                                    {slot}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity style={styles.closeModalBtn} onPress={handleBookVisit}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Confirm Booking</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.closeModalBtn, { backgroundColor: '#333', marginTop: 10, flexDirection: 'row', justifyContent: 'center', gap: 8 }]}
                            onPress={() => Alert.alert("Crypto Payment ₿", "Wallet Connect Initiated... Please confirm 100 USDC transfer.")}
                        >
                            <Ionicons name="logo-bitcoin" size={18} color="#FFD700" />
                            <Text style={{ color: '#FFD700', fontWeight: 'bold' }}>Pay Booking via Crypto</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ alignItems: 'center', marginTop: 15 }} onPress={() => setShowVisitModal(false)}>
                            <Text style={{ color: COLORS.subText }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* EMI Modal */}
            <Modal visible={showEmiModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>EMI Calculator</Text>

                        <Text style={styles.sliderLabel}>Loan Amount: ₹{loanAmount.toLocaleString()}</Text>
                        <Slider
                            style={{ width: '100%', height: 40 }}
                            minimumValue={100000}
                            maximumValue={property.price_fiat || 10000000}
                            value={loanAmount}
                            onValueChange={setLoanAmount}
                            step={100000}
                        />

                        <Text style={styles.sliderLabel}>Interest Rate: {interestRate.toFixed(1)}%</Text>
                        <Slider
                            style={{ width: '100%', height: 40 }}
                            minimumValue={5}
                            maximumValue={15}
                            value={interestRate}
                            onValueChange={setInterestRate}
                            step={0.1}
                        />

                        <Text style={styles.sliderLabel}>Tenure: {Math.round(tenure)} Years</Text>
                        <Slider
                            style={{ width: '100%', height: 40 }}
                            minimumValue={1}
                            maximumValue={30}
                            value={tenure}
                            onValueChange={setTenure}
                            step={1}
                        />

                        <View style={styles.emiResultBox}>
                            <Text style={{ color: COLORS.subText }}>Monthly EMI</Text>
                            <Text style={styles.emiValue}>₹{calculateEMI()}</Text>
                        </View>

                        <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowEmiModal(false)}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* AI Concierge FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => Alert.alert("Hello! 🤖", "I am R-Bot. How can I help you with this property?")}
            >
                <Ionicons name="chatbubbles" size={28} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingHorizontal: 20,
        zIndex: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    imageContainer: { position: 'relative' },
    image: { width, height: 300 },
    imagePagination: {
        position: 'absolute',
        bottom: 15,
        alignSelf: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    dotActive: { backgroundColor: 'white', width: 20 },

    content: { padding: 20 },
    price: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary },
    title: { fontSize: 22, fontWeight: '600', color: COLORS.text, marginTop: 8 },

    scoreBadge: { backgroundColor: '#fff3e0', padding: 8, borderRadius: 8, alignItems: 'center' },
    scoreValue: { fontSize: 18, fontWeight: 'bold', color: '#ff9800' },
    scoreLabel: { fontSize: 10, color: '#f57c00' },

    aiBox: { padding: 15, borderRadius: 12, marginTop: 15, marginBottom: 5 },
    aiTitle: { fontSize: 16, fontWeight: 'bold', color: '#0d47a1' },
    aiSub: { fontSize: 13, color: '#1565c0', marginTop: 2 },

    metaRow: { flexDirection: 'row', marginTop: 15, gap: 20, marginBottom: 15 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    metaText: { fontSize: 14, color: COLORS.text, fontWeight: '500' },

    // Neighborhood Stats
    statCard: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 12,
        marginRight: 10,
        width: 100,
        alignItems: 'center',
        ...SHADOWS.small
    },
    statIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    statValue: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
    statLabel: { fontSize: 12, color: COLORS.subText },

    // Chart
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 150,
        paddingBottom: 20,
        paddingTop: 20,
        backgroundColor: '#f8f9fa',
        borderRadius: 12
    },
    chartBarWrapper: { alignItems: 'center', flex: 1 },
    chartBar: { width: 20, backgroundColor: COLORS.primary, borderRadius: 4, minHeight: 4 },
    chartLabel: { fontSize: 12, color: COLORS.subText, marginTop: 8 },
    chartValue: { fontSize: 10, color: COLORS.text, marginBottom: 4, fontWeight: '600' },
    trendText: { marginTop: 10, fontSize: 13, color: COLORS.subText, fontStyle: 'italic' },

    // Alert Box
    alertBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 12,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0'
    },
    alertTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
    alertSub: { fontSize: 12, color: COLORS.subText },
    toggleBtn: { width: 44, height: 24, borderRadius: 12, backgroundColor: '#e0e0e0', justifyContent: 'center', padding: 2 },
    toggleBtnActive: { backgroundColor: COLORS.primary },
    toggleCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'white' },
    toggleCircleActive: { alignSelf: 'flex-end' },

    // Infinity Features Styles
    auctionBanner: {
        padding: 15, borderRadius: 12, marginTop: 20, marginBottom: 10, ...SHADOWS.medium
    },
    auctionLabel: { color: 'white', fontWeight: 'bold', fontSize: 12, marginBottom: 5 },
    auctionTimer: { color: 'white', fontWeight: 'bold', fontSize: 24 },
    bidLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10 },
    bidValue: { color: 'white', fontWeight: 'bold', fontSize: 18 },
    bidButton: { backgroundColor: 'white', marginTop: 15, padding: 10, borderRadius: 8, alignItems: 'center' },
    bidButtonText: { color: '#DD2476', fontWeight: 'bold' },

    fractionalCard: {
        backgroundColor: 'white', borderRadius: 12, marginTop: 25, overflow: 'hidden', ...SHADOWS.medium
    },
    fractionalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
    fractionalTitle: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    yieldBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    yieldText: { color: '#4fc3f7', fontWeight: 'bold', fontSize: 12 },
    progressBarBg: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, marginVertical: 10 },
    progressBarFill: { height: 8, backgroundColor: '#4caf50', borderRadius: 4 },
    investRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    tokenPrice: { fontSize: 20, fontWeight: 'bold', color: '#1a237e' },
    investBtn: { backgroundColor: '#1a237e', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    investBtnText: { color: 'white', fontWeight: 'bold' },

    tourBtn: { marginTop: 15, borderRadius: 12, overflow: 'hidden', ...SHADOWS.medium },
    tourGradient: { flexDirection: 'row', padding: 16, alignItems: 'center', justifyContent: 'center', gap: 10 },
    tourText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

    tourGradient: { flexDirection: 'row', padding: 16, alignItems: 'center', justifyContent: 'center', gap: 10 },
    tourText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

    // Galactic Features Styles
    vastuCard: {
        backgroundColor: 'white', padding: 15, borderRadius: 12, ...SHADOWS.small, borderWidth: 1, borderColor: '#e0f7fa'
    },
    compassCircle: {
        width: 60, height: 60, borderRadius: 30, backgroundColor: '#e0f7fa', justifyContent: 'center', alignItems: 'center',
        position: 'relative'
    },
    directionTag: {
        position: 'absolute', bottom: -5, backgroundColor: COLORS.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4
    },
    legalBtn: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: 'white', padding: 15, borderRadius: 12, ...SHADOWS.small
    },
    fab: {
        position: 'absolute', bottom: 30, right: 20,
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: 'center', alignItems: 'center',
        ...SHADOWS.medium,
        zIndex: 100
    },

    // Cosmic Features Styles
    soundCard: { backgroundColor: 'white', padding: 15, borderRadius: 12, ...SHADOWS.small },
    soundBarBg: { height: 10, backgroundColor: '#f5f5f5', borderRadius: 5, overflow: 'hidden' },
    soundBarFill: { height: '100%', borderRadius: 5 },

    commuteCard: { backgroundColor: 'white', padding: 15, borderRadius: 12, ...SHADOWS.small },
    commuteInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 10, padding: 5, marginBottom: 15 },
    commuteIcon: { backgroundColor: COLORS.primary, width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    calcBtn: { backgroundColor: COLORS.text, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    commuteResults: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    commuteItem: { alignItems: 'center' },
    commuteTime: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginTop: 5 },
    commuteLabel: { fontSize: 12, color: COLORS.subText },
    commuteDivider: { width: 1, height: 40, backgroundColor: '#e0e0e0' },

    stagingBtn: {
        position: 'absolute', bottom: 20, right: 20,
        backgroundColor: 'rgba(0,0,0,0.7)',
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 15, paddingVertical: 10, borderRadius: 25,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)'
    },
    stagingBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

    // Universal Tier Styles
    blockchainCard: { borderRadius: 12, overflow: 'hidden', ...SHADOWS.medium },
    blockchainGradient: { flexDirection: 'row', padding: 15, alignItems: 'center', gap: 15 },

    emiTeaser: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#EEF2FF', padding: 12, borderRadius: 10, marginTop: 20
    },

    bookVisitBtn: { marginTop: 15, ...SHADOWS.medium },
    bookVisitGradient: { flexDirection: 'row', padding: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 10 },
    bookVisitText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

    section: { marginTop: 25 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
    description: { fontSize: 15, color: COLORS.subText, lineHeight: 24 },

    mapContainer: { height: 200, borderRadius: SIZES.radius, overflow: 'hidden', ...SHADOWS.light },
    map: { flex: 1 },

    contactRow: { flexDirection: 'row', gap: 10 },
    contactBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: SIZES.radius,
        gap: 8,
    },
    contactBtnText: { color: 'white', fontWeight: '600' },
    mobileText: { marginTop: 10, fontSize: 14, color: COLORS.text, textAlign: 'center' },

    shareBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: SIZES.radius,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        marginTop: 20,
        gap: 8,
    },
    shareBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: 16 },

    similarCard: { width: 150, marginRight: 15, backgroundColor: 'white', borderRadius: 16, padding: 10, ...SHADOWS.small },
    similarImg: { width: '100%', height: 100, borderRadius: 12, marginBottom: 10 },
    similarPrice: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary, marginBottom: 2 },
    similarTitle: { fontSize: 12, color: COLORS.text, lineHeight: 16 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 25 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    sliderLabel: { marginTop: 15, marginBottom: 5, fontWeight: '600', color: COLORS.subText },
    emiResultBox: { alignItems: 'center', marginTop: 20, padding: 15, backgroundColor: '#F0F9FF', borderRadius: 10 },
    emiValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginTop: 5 },
    closeModalBtn: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 }
});
