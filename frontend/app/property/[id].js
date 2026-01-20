import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Share, Dimensions, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import API from '../services/apiConfig';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import NativeMap, { NativeMarker } from '../components/NativeMap';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function PropertyDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [property, setProperty] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        fetchProperty();
        checkFavorite();
    }, [id]);

    const fetchProperty = async () => {
        try {
            const response = await API.get(`/properties/${id}`);
            setProperty(response.data);
        } catch (error) {
            console.error('Error fetching property:', error);
        }
    };

    const checkFavorite = async () => {
        try {
            const favorites = await AsyncStorage.getItem('@favorites');
            if (favorites) {
                const favList = JSON.parse(favorites);
                setIsFavorite(favList.includes(id));
            }
        } catch (e) {
            console.log('Error checking favorite:', e);
        }
    };

    const toggleFavorite = async () => {
        try {
            const favorites = await AsyncStorage.getItem('@favorites');
            let favList = favorites ? JSON.parse(favorites) : [];

            if (isFavorite) {
                favList = favList.filter(fid => fid !== id);
            } else {
                favList.push(id);
            }

            await AsyncStorage.setItem('@favorites', JSON.stringify(favList));
            setIsFavorite(!isFavorite);
        } catch (e) {
            console.log('Error toggling favorite:', e);
        }
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

    if (!property) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
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

            <ScrollView>
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
                    <Text style={styles.price}>₹{property.price_fiat?.toLocaleString()}</Text>
                    <Text style={styles.title}>{property.title}</Text>

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
                            <Text style={styles.sectionTitle}>Contact Seller</Text>
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

                    {/* Share Button */}
                    <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                        <Ionicons name="share-social-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.shareBtnText}>Share Property</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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

    metaRow: { flexDirection: 'row', marginTop: 15, gap: 20 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    metaText: { fontSize: 14, color: COLORS.text, fontWeight: '500' },

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
});
