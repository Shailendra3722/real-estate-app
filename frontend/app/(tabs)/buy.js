import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import API from '../services/apiConfig';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { GlassCard } from '../components/ui/GlassCard';

export default function BuyScreen() {
    const router = useRouter();
    const [properties, setProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // grid or list
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

    const PropertyCard = ({ item }) => (
        <TouchableOpacity
            style={viewMode === 'grid' ? styles.gridCard : styles.listCard}
            onPress={() => router.push(`/property/${item.id}`)}
            activeOpacity={0.8}
        >
            <Image
                source={{ uri: item.image_urls?.[0] || 'https://via.placeholder.com/300x200' }}
                style={viewMode === 'grid' ? styles.gridImage : styles.listImage}
            />
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title || 'Property'}</Text>
                <Text style={styles.cardPrice}>₹{(item.price_fiat || 0).toLocaleString()}</Text>
                <View style={styles.cardMeta}>
                    <Ionicons name="location-outline" size={14} color={COLORS.subText} />
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
    );

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

                {/* View Toggle */}
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
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading properties...</Text>
                </View>
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
    header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: 'white' },
    headerSub: { color: 'rgba(255,255,255,0.9)', marginTop: 5 },

    searchSection: { flexDirection: 'row', padding: 15, gap: 10 },
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

    filterScroll: { paddingHorizontal: 15, marginBottom: 15 },
    filterChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
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
        margin: 5,
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        overflow: 'hidden',
        ...SHADOWS.light,
    },
    listCard: {
        flexDirection: 'row',
        marginBottom: 15,
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        overflow: 'hidden',
        ...SHADOWS.light,
    },
    gridImage: { width: '100%', height: 120 },
    listImage: { width: 120, height: 120 },
    cardContent: { padding: 12 },
    cardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
    cardPrice: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginTop: 5 },
    cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 5 },
    cardMetaText: { fontSize: 12, color: COLORS.subText },
    cardArea: { fontSize: 12, color: COLORS.subText, marginTop: 3 },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: COLORS.subText },

    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    emptyText: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: 15 },
    emptySubText: { fontSize: 14, color: COLORS.subText, marginTop: 5 },
});
