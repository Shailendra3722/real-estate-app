import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import API from '../services/apiConfig';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { GlassCard } from '../components/ui/GlassCard';
import { FavoriteService } from '../services/favoriteService';
import RealEstateLoader from '../components/ui/RealEstateLoader';

export default function BuyScreen() {
    const router = useRouter();
    const [properties, setProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // grid, list, or map
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('All');

    useEffect(() => {
        fetchProperties();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchQuery, selectedType, properties]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const response = await API.get('/properties/all');
            setProperties(response.data || []);
        } catch (error) {
            console.error('Error fetching properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchProperties();
        setRefreshing(false);
    };

    const applyFilters = () => {
        let filtered = properties;

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Type filter
        if (selectedType !== 'All') {
            filtered = filtered.filter(p => p.property_type === selectedType);
        }

        setFilteredProperties(filtered);
    };

    const PropertyCard = ({ item }) => {
        const [isFavorite, setIsFavorite] = useState(false);
        const [isLoading, setIsLoading] = useState(false);

        // Check favorite status on mount
        useEffect(() => {
            checkFavoriteStatus();
        }, [item.id]);

        const checkFavoriteStatus = async () => {
            try {
                const favStatus = await FavoriteService.isFavorite(item.id);
                setIsFavorite(favStatus);
            } catch (e) {
                console.log('Error checking favorite:', e);
            }
        };

        const toggleFavorite = async (e) => {
            e.stopPropagation(); // Prevent navigation when tapping heart

            if (isLoading) return;

            setIsLoading(true);
            const newStatus = !isFavorite;
            setIsFavorite(newStatus); // Optimistic update

            try {
                if (newStatus) {
                    await FavoriteService.addFavorite(item.id);
                } else {
                    await FavoriteService.removeFavorite(item.id);
                }
            } catch (e) {
                console.log('Error toggling favorite:', e);
                setIsFavorite(!newStatus); // Revert on error
            } finally {
                setIsLoading(false);
            }
        };

        return (
            <Animated.View
                entering={FadeInDown.delay(100).duration(600).springify()}
            >
                <TouchableOpacity
                    style={viewMode === 'grid' ? styles.gridCard : styles.listCard}
                    onPress={() => router.push(`/property/${item.id}`)}
                    activeOpacity={0.7}
                >
                    <View style={{ position: 'relative' }}>
                        <Image
                            source={{ uri: item.image_urls?.[0] || 'https://via.placeholder.com/300x200' }}
                            style={viewMode === 'grid' ? styles.gridImage : styles.listImage}
                        />
                        {/* Gradient overlay for better badge visibility */}
                        <View style={styles.imageOverlay} />

                        {/* Verified Badge */}
                        {item.owner_is_verified && (
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={12} color="white" />
                                <Text style={styles.verifiedText}>Verified</Text>
                            </View>
                        )}

                        {/* Favorite Icon - Top Right */}
                        <TouchableOpacity
                            style={styles.favoriteIcon}
                            onPress={toggleFavorite}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name={isFavorite ? "heart" : "heart-outline"}
                                size={22}
                                color={isFavorite ? "#EF4444" : "white"}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.title || 'Property'}</Text>
                        <Text style={styles.cardPrice}>₹{(item.price_fiat || 0).toLocaleString()}</Text>
                        <View style={styles.cardMeta}>
                            <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.secondary} />
                            <Text style={styles.cardMetaText}>
                                {item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)}
                            </Text>
                        </View>
                        {item.area && (
                            <Text style={styles.cardArea}>
                                {item.area} {item.area_unit === 'sqft' ? 'sq.ft' : item.area_unit}
                            </Text>
                        )}
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Text style={styles.headerTitle}>Find Your Property</Text>
                <Text style={styles.headerSub}>{filteredProperties.length} Properties Available</Text>
            </LinearGradient>

            {/* Search Bar */}
            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={COLORS.subText} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by location, title..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={COLORS.subText}
                    />
                    {searchQuery !== '' && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={COLORS.subText} />
                        </TouchableOpacity>
                    )}
                </View>

            </View>

            {/* View Toggle & Sort */}
            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    onPress={() => {
                        const sorted = [...filteredProperties].sort((a, b) => (a.price_fiat || 0) - (b.price_fiat || 0));
                        setFilteredProperties(sorted);
                    }}
                    style={styles.sortBtn}
                >
                    <Ionicons name="arrow-up" size={16} color={COLORS.primary} />
                    <Text style={styles.sortText}>Price</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        const sorted = [...filteredProperties].sort((a, b) => (b.price_fiat || 0) - (a.price_fiat || 0));
                        setFilteredProperties(sorted);
                    }}
                    style={[styles.sortBtn, { marginRight: 'auto', marginLeft: 10 }]}
                >
                    <Ionicons name="arrow-down" size={16} color={COLORS.primary} />
                    <Text style={styles.sortText}>Price</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    style={styles.viewToggle}
                >
                    <Ionicons
                        name={viewMode === 'grid' ? 'list' : 'grid'}
                        size={24}
                        color={COLORS.primary}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => router.push('/(tabs)/map')}
                    style={[styles.viewToggle, { marginLeft: 10 }]}
                >
                    <Ionicons name="map-outline" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>


            {/* Type Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {['All', 'Flat', 'House', 'Plot', 'Farm', 'Commercial'].map(type => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.filterChip, selectedType === type && styles.filterChipActive]}
                        onPress={() => setSelectedType(type)}
                    >
                        <Text style={[styles.filterText, selectedType === type && styles.filterTextActive]}>
                            {type}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Properties List */}
            {loading ? (
                <RealEstateLoader />
            ) : filteredProperties.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="home-outline" size={64} color={COLORS.subText} />
                    <Text style={styles.emptyText}>No properties found</Text>
                    <Text style={styles.emptySubText}>Try adjusting your filters</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredProperties}
                    renderItem={({ item }) => <PropertyCard item={item} />}
                    keyExtractor={item => item.id}
                    numColumns={viewMode === 'grid' ? 2 : 1}
                    key={viewMode}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: 'white' },
    headerSub: { color: 'rgba(255,255,255,0.9)', marginTop: 5 },

    searchSection: {
        paddingHorizontal: 20,
        marginTop: -25, // Overlapping header effect
        marginBottom: 15,
        zIndex: 10
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radiusLarge,
        paddingHorizontal: 20,
        height: 56,
        ...SHADOWS.medium, // Floating effect
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchInput: { flex: 1, height: '100%', fontSize: 16, color: COLORS.text, marginLeft: 10 },

    toggleContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15, justifyContent: 'flex-end', alignItems: 'center' },
    sortBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        paddingHorizontal: 16,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    sortText: {
        marginLeft: 6,
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.primary,
    },
    viewToggle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    filterScroll: { paddingHorizontal: 20, marginBottom: 20 },
    filterChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginRight: 10,
        borderRadius: 25,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    filterChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        ...SHADOWS.glow // Glowing effect for active
    },
    filterText: { color: COLORS.subText, fontWeight: '600', fontSize: 14 },
    filterTextActive: { color: 'white' },

    listContent: { paddingHorizontal: 20, paddingBottom: 100 },

    gridCard: {
        flex: 1,
        margin: 8,
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        overflow: 'hidden',
        ...SHADOWS.medium,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    listCard: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        overflow: 'hidden',
        ...SHADOWS.medium,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    gridImage: { width: '100%', height: 160 },
    listImage: { width: 140, height: 140 },

    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: 'rgba(0,0,0,0.2)', // Darker top for icon contrast
    },

    favoriteIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.9)', // White bg like Airbnb
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
        ...SHADOWS.small
    },

    cardContent: { padding: 16 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
    cardPrice: { fontSize: 18, fontWeight: '800', color: COLORS.primary, marginBottom: 6 },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
    cardMetaText: { fontSize: 12, color: COLORS.subText, flex: 1 },
    cardArea: { fontSize: 12, color: COLORS.subText, fontWeight: '500', backgroundColor: COLORS.background, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },

    verifiedBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.success,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        zIndex: 10
    },
    verifiedText: { color: 'white', fontSize: 10, fontWeight: 'bold', marginLeft: 4, letterSpacing: 0.5 },

    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    emptyText: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginTop: 20 },
    emptySubText: { fontSize: 15, color: COLORS.subText, marginTop: 8 },
});
