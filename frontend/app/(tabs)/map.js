import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Alert, Platform, TouchableOpacity, Modal, FlatList } from 'react-native';
import * as Location from 'expo-location';
import { useLanguage } from '../components/LanguageContext';
import PropertyDetailsSheet from '../components/PropertyDetailsSheet';
import NativeMap, { NativeMarker } from '../components/NativeMap';
import { Picker } from '@react-native-picker/picker'; // Ensure this is installed
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';

import API from '../services/apiConfig';

export default function MapScreen() {
    const { t } = useLanguage();

    // 1. ROBUST INITIAL STATE (Uttar Pradesh Default)
    // We initialize EVERYTHING to avoid "null" crashes on first render
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [region, setRegion] = useState({
        latitude: 28.4595,
        longitude: 77.0266,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const [arMode, setArMode] = useState(false);
    const [selectedProp, setSelectedProp] = useState(null);
    const [searchVisible, setSearchVisible] = useState(false);
    const [mapType, setMapType] = useState('standard');
    const [listExpanded, setListExpanded] = useState(false); // For Up/Down Toggle

    // Search Filters
    const [filters, setFilters] = useState({ state: 'Uttar Pradesh', district: '', tehsil: '', village: '' });

    // 2. DATASETS (Granular Data as requested)
    const states = ["Uttar Pradesh", "Maharashtra", "Delhi", "Bihar", "Rajasthan"];
    const districts = {
        "Uttar Pradesh": ["Azamgarh", "Lucknow", "Varanasi", "Prayagraj", "Mau", "Gorakhpur", "Jaunpur"],
        "Maharashtra": ["Mumbai", "Pune", "Nagpur"]
    };
    const tehsils = {
        "Azamgarh": ["Mehnagar", "Sadar", "Sagri", "Lalganj", "Phulpur"],
        "Lucknow": ["Lucknow Sadar", "Malihabad"]
    };
    const villages = {
        "Mehnagar": ["Karauti", "Khajuri", "Singhpur", "Raipur", "Bhatouli", "Chak"],
        "Sadar": ["Village A", "Village B"]
    };

    // 3. LOAD PROPERTIES (Real Data)
    useEffect(() => {
        fetchProperties();

        // Attempt to get real location in background, but don't block
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    let loc = await Location.getCurrentPositionAsync({});
                    setLocation(loc);
                    // Note: We don't auto-move region to avoid hijacking user exploration
                }
            } catch (e) {
                console.log("Location access failed silently:", e);
            }
        })();
    }, []);

    const fetchProperties = async () => {
        try {
            const response = await API.get('/properties/all');
            setProperties(response.data || []);
        } catch (error) {
            console.error('Error fetching properties for map:', error);
        }
    };

    const handleSearchSubmit = () => {
        setSearchVisible(false);
        const searchSummary = `${filters.village ? filters.village + ', ' : ''}${filters.tehsil ? filters.tehsil + ', ' : ''}${filters.district}`;
        Alert.alert("🔎 Search Active", `Showing properties in:\n${searchSummary}`);

        // Logic to move map based on selection
        if (filters.district === 'Azamgarh') {
            setRegion({ latitude: 26.0680, longitude: 83.1840, latitudeDelta: 0.2, longitudeDelta: 0.2 });
        } else if (filters.state === 'Uttar Pradesh') {
            setRegion({ latitude: 26.8467, longitude: 80.9461, latitudeDelta: 4, longitudeDelta: 4 });
        }
    };

    const handleRecenter = () => {
        if (!location) {
            Alert.alert("Location Unknown", "We couldn't find your GPS location.");
            return;
        }
        setRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05
        });
    };

    return (
        <View style={styles.container}>
            {/* --- MAP LAYER --- */}
            <View style={styles.mapContainer}>
                <NativeMap
                    region={region}
                    mapType={mapType}
                    userLocation={location.coords}
                    style={{ flex: 1 }}
                >
                    {properties.map(p => (
                        <NativeMarker
                            key={p.id}
                            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
                            title={p.title}
                            description={p.description}
                            onPress={() => setSelectedProp(p)}
                        />
                    ))}
                </NativeMap>
            </View>

            {/* --- FLOATING UI LAYER (Z-Index > 1) --- */}

            {/* 1. Search Bar */}
            <TouchableOpacity style={styles.searchBar} onPress={() => setSearchVisible(true)}>
                <Ionicons name="search" size={20} color={COLORS.primary} />
                <Text style={styles.searchText}>
                    {filters.district ? `${filters.district}, ${filters.state}` : "Search (UP, Azamgarh...)"}
                </Text>
                <Ionicons name="options-outline" size={20} color={COLORS.subText} />
            </TouchableOpacity>

            {/* 2. Map Controls (Satellite, Recenter) */}
            <View style={styles.controlsContainer}>
                <TouchableOpacity style={styles.roundBtn} onPress={() => setMapType(m => m === 'standard' ? 'satellite' : 'standard')}>
                    <Ionicons name={mapType === 'standard' ? 'globe-outline' : 'map-outline'} size={24} color={COLORS.text} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.roundBtn, { marginTop: 10 }]} onPress={handleRecenter}>
                    <Ionicons name="locate" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* 3. Property List (Collapsible / Bottom Sheet Style) */}
            {/* Added "Expanded" State logic to simulate Drag up/down */}
            <View style={[styles.listContainer, { height: listExpanded ? 500 : 180 }]}>
                <TouchableOpacity
                    style={styles.listDragger}
                    onPress={() => setListExpanded(!listExpanded)}
                >
                    <View style={styles.dragHandle} />
                    <Text style={styles.listHeader}>
                        {listExpanded ? "↓ Show Map" : `↑ ${properties.length} Properties Nearby`}
                    </Text>
                </TouchableOpacity>

                <FlatList
                    data={properties}
                    // If expanded, vertical list. If collapsed, horizontal list.
                    horizontal={!listExpanded}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={true}
                    keyExtractor={i => i.id.toString()}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.propCard,
                                listExpanded ? { width: '100%', marginBottom: 15, marginRight: 0 } : { width: 220, marginRight: 15 }
                            ]}
                            onPress={() => setSelectedProp(item)}
                        >
                            <View style={[styles.propIcon, listExpanded && { width: 60, height: 60 }]}>
                                <Ionicons name="home" size={listExpanded ? 30 : 20} color="white" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.propPrice, listExpanded && { fontSize: 18 }]}>{item.price_fiat}</Text>
                                <Text style={styles.propTitle} numberOfLines={2}>{item.title}</Text>
                                {listExpanded && <Text style={{ fontSize: 12, color: '#666' }}>{item.description}</Text>}
                            </View>
                            {listExpanded && <Ionicons name="chevron-forward" size={24} color="#ccc" />}
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* --- MODALS --- */}

            {/* Search Filter Modal */}
            <Modal visible={searchVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Find Property</Text>

                        {/* Cascading Picker */}
                        <Text style={styles.pickerLabel}>State</Text>
                        <View style={styles.pickerWrap}>
                            <Picker selectedValue={filters.state} onValueChange={v => setFilters({ ...filters, state: v, district: '' })}>
                                {states.map(s => <Picker.Item key={s} label={s} value={s} />)}
                            </Picker>
                        </View>

                        {filters.state && districts[filters.state] && (
                            <>
                                <Text style={styles.pickerLabel}>District</Text>
                                <View style={styles.pickerWrap}>
                                    <Picker selectedValue={filters.district} onValueChange={v => setFilters({ ...filters, district: v, tehsil: '' })}>
                                        <Picker.Item label="Select District" value="" />
                                        {districts[filters.state].map(d => <Picker.Item key={d} label={d} value={d} />)}
                                    </Picker>
                                </View>
                            </>
                        )}

                        {filters.district && tehsils[filters.district] && (
                            <>
                                <Text style={styles.pickerLabel}>Tehsil</Text>
                                <View style={styles.pickerWrap}>
                                    <Picker selectedValue={filters.tehsil} onValueChange={v => setFilters({ ...filters, tehsil: v, village: '' })}>
                                        <Picker.Item label="Select Tehsil" value="" />
                                        {tehsils[filters.district].map(t => <Picker.Item key={t} label={t} value={t} />)}
                                    </Picker>
                                </View>
                            </>
                        )}

                        {filters.tehsil && villages[filters.tehsil] && (
                            <>
                                <Text style={styles.pickerLabel}>Village</Text>
                                <View style={styles.pickerWrap}>
                                    <Picker selectedValue={filters.village} onValueChange={v => setFilters({ ...filters, village: v })}>
                                        <Picker.Item label="Select Village" value="" />
                                        {villages[filters.tehsil].map(v => <Picker.Item key={v} label={v} value={v} />)}
                                    </Picker>
                                </View>
                            </>
                        )}

                        <TouchableOpacity style={styles.searchSubmitBtn} onPress={handleSearchSubmit}>
                            <Text style={styles.searchSubmitText}>SEARCH</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setSearchVisible(false)}>
                            <Text style={{ color: 'gray' }}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Property Details Sheet */}
            <PropertyDetailsSheet
                property={selectedProp}
                visible={!!selectedProp}
                onClose={() => setSelectedProp(null)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    mapContainer: { flex: 1 },

    // Search Bar
    searchBar: {
        position: 'absolute', top: 50, left: 20, right: 20,
        backgroundColor: 'white', flexDirection: 'row', alignItems: 'center',
        padding: 15, borderRadius: 12, ...SHADOWS.medium,
        zIndex: 10
    },
    searchText: { flex: 1, marginLeft: 10, fontSize: 16, fontWeight: '600', color: COLORS.text },

    // Controls
    controlsContainer: { position: 'absolute', right: 20, top: 130, zIndex: 10 },
    roundBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: 'white',
        justifyContent: 'center', alignItems: 'center', ...SHADOWS.small
    },

    // List
    listContainer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        ...SHADOWS.medium, elevation: 20, zIndex: 20,
        // height is dynamic now
        paddingHorizontal: 20, paddingTop: 10
    },
    listDragger: { alignItems: 'center', paddingBottom: 10 },
    dragHandle: { width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2, marginBottom: 8 },
    listHeader: { fontSize: 14, fontWeight: '700', color: COLORS.subText, marginBottom: 5 },
    propCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
        padding: 10, borderRadius: 12, marginRight: 15, width: 220, borderWidth: 1, borderColor: '#eee'
    },
    propIcon: {
        width: 40, height: 40, borderRadius: 8, backgroundColor: '#94A3B8',
        justifyContent: 'center', alignItems: 'center', marginRight: 10
    },
    propPrice: { fontWeight: 'bold', color: COLORS.primary, fontSize: 16 },
    propTitle: { fontSize: 12, color: COLORS.text },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', padding: 25, borderRadius: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    pickerLabel: { marginTop: 10, color: COLORS.subText, fontSize: 12, fontWeight: '600' },
    pickerWrap: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginTop: 5, backgroundColor: '#F9FAFB' },
    markerArrow: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderTopColor: COLORS.primary,
        borderWidth: 6,
        alignSelf: 'center',
        marginTop: -0.5,
    },
    markerContainer: {
        alignItems: 'center',
    },

    // AR Styles
    arContainer: { flex: 1, backgroundColor: 'black' },
    cameraView: { flex: 1, backgroundColor: '#222' }, // Simulation
    arCard: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.9)', padding: 10, borderRadius: 8, width: 120 },
    arPrice: { fontWeight: 'bold', color: COLORS.primary },
    arTitle: { fontSize: 10, color: 'black' },
    arLine: { height: 50, width: 1, backgroundColor: 'white', position: 'absolute', bottom: -50, left: 60 },
    arDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'white', position: 'absolute', bottom: -60, left: 55 },

    arToggleBtn: {
        position: 'absolute', bottom: 100, alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)', flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30,
        borderWidth: 1, borderColor: 'white'
    },
    arBtnText: { color: 'white', fontWeight: 'bold' },
    searchSubmitBtn: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 25 },
    searchSubmitText: { color: 'white', fontWeight: 'bold' },
    closeBtn: { alignSelf: 'center', marginTop: 15, padding: 10 }
});
