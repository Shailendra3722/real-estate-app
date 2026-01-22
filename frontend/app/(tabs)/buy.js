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
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: 'white' },
    headerSub: { color: 'rgba(255,255,255,0.9)', marginTop: 5 },

    searchSection: { flexDirection: 'row', padding: 15, gap: 10, alignItems: 'center' },
    toggleContainer: { flexDirection: 'row', paddingHorizontal: 15, paddingBottom: 10, justifyContent: 'flex-end' },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        paddingHorizontal: 15,
        gap: 10,
        ...SHADOWS.small,
    },
    searchInput: { flex: 1, height: 48, fontSize: 16, color: COLORS.text },
    viewToggle: {
        width: 48,
        height: 48,
        borderRadius: SIZES.radius,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    sortBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        paddingHorizontal: 12,
        height: 40,
        borderRadius: 20,
        ...SHADOWS.small,
    },
    sortText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.primary,
    },

    filterScroll: { paddingHorizontal: 15, marginBottom: 10 },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 10,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    filterText: { color: COLORS.text, fontWeight: '600' },
    filterTextActive: { color: 'white' },

    listContent: { padding: 15 },
    gridCard: {
        flex: 1,
        margin: 8,
        backgroundColor: COLORS.surface,
        borderRadius: 20, // Increased from 16
        overflow: 'hidden',
        ...SHADOWS.small, // Reduced from light to small
    },
    listCard: {
        flexDirection: 'row',
        marginBottom: 15,
        backgroundColor: COLORS.surface,
        borderRadius: 20, // Increased from 16
        overflow: 'hidden',
        ...SHADOWS.small, // Reduced from light to small
    },
    gridImage: { width: '100%', height: 140 }, // Increased from 120
    listImage: { width: 130, height: 130 }, // Increased from 120

    // Image overlay for better badge visibility
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: 'rgba(0,0,0,0.15)',
    },

    // Favorite Icon
    favoriteIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },

    cardContent: { padding: 14 }, // Increased from 12
    cardTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, lineHeight: 20 },
    cardPrice: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginTop: 6 },
    cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 5 },
    cardMetaText: { fontSize: 11, color: COLORS.subText, flex: 1 },
    cardArea: { fontSize: 11, color: COLORS.subText, marginTop: 4, fontWeight: '500' },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: COLORS.subText },

    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    emptyText: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: 15 },
    emptySubText: { fontSize: 14, color: COLORS.subText, marginTop: 5 },

    verifiedBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#00897b',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        zIndex: 10
    },
    verifiedText: { color: 'white', fontSize: 10, fontWeight: 'bold', marginLeft: 3 },
});
