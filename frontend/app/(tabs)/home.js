import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Dimensions, ScrollView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { useLanguage } from '../components/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const router = useRouter();
    const { t } = useLanguage();
    const [userImage, setUserImage] = React.useState(null);

    React.useEffect(() => {
        // Try to load user image from storage
        const loadUser = async () => {
            try {
                const profile = await AsyncStorage.getItem('user_profile');
                if (profile) {
                    const p = JSON.parse(profile);
                    if (p.picture) setUserImage(p.picture);
                }
            } catch (e) { console.log(e); }
        };
        loadUser();
    }, []);

    const navigateTo = (route) => {
        router.push(route);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Header Section */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome Back</Text>
                    <Text style={styles.username}>Real Estate Pro</Text>
                </View>
                <TouchableOpacity style={styles.profileBtn} onPress={() => navigateTo('/(tabs)/profile')}>
                    {userImage ? (
                        <Image source={{ uri: userImage }} style={{ width: 45, height: 45, borderRadius: 25 }} />
                    ) : (
                        <Ionicons name="person-circle-outline" size={40} color={COLORS.primary} />
                    )}
                </TouchableOpacity>
            </View>

            {/* Hero Section - The "Super Cards" */}
            <View style={styles.actionContainer}>
                {/* BUY CARD */}
                <TouchableOpacity
                    style={[styles.card, SHADOWS.medium]}
                    activeOpacity={0.9}
                    onPress={() => navigateTo('/(tabs)/map')} // Keeping 'map' route for now, UI says Buy
                >
                    <LinearGradient
                        colors={['#0F172A', '#1E293B']}
                        style={styles.cardGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="search" size={32} color="#FBBF24" />
                            </View>
                            <View>
                                <Text style={styles.cardTitle}>Find Property</Text>
                                <Text style={styles.cardSub}>Browse 10,000+ Listings</Text>
                            </View>
                        </View>
                        <View style={styles.cardArrow}>
                            <Ionicons name="arrow-forward" size={24} color="white" />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* SELL CARD */}
                <TouchableOpacity
                    style={[styles.card, SHADOWS.medium]}
                    activeOpacity={0.9}
                    onPress={() => navigateTo('/(tabs)/sell')}
                >
                    <LinearGradient
                        colors={['#D97706', '#B45309']}
                        style={styles.cardGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.cardContent}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <Ionicons name="add-circle" size={32} color="white" />
                            </View>
                            <View>
                                <Text style={styles.cardTitle}>List Property</Text>
                                <Text style={styles.cardSub}>Verified Sellers Only</Text>
                            </View>
                        </View>
                        <View style={styles.cardArrow}>
                            <Ionicons name="arrow-forward" size={24} color="white" />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Quick Stats / Highlights */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>12k+</Text>
                    <Text style={styles.statLabel}>Active Users</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>8.5k</Text>
                    <Text style={styles.statLabel}>Properties</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>4.9</Text>
                    <Text style={styles.statLabel}>Trust Score</Text>
                </View>
            </View>

            {/* Recent Activity / Featured (Placeholder for Pro Look) */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Featured Collections</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.collectionsScroll}>
                {['Luxury Villas', 'Budget Flats', 'Farm Lands'].map((item, idx) => (
                    <TouchableOpacity key={idx} style={styles.collectionCard}>
                        {/* Placeholder gradient as image */}
                        <LinearGradient colors={['#eee', '#ddd']} style={styles.collectionImg}>
                            <Ionicons name="image-outline" size={30} color="#999" />
                        </LinearGradient>
                        <Text style={styles.collectionTitle}>{item}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60, // Safe area
        paddingBottom: 20,
    },
    greeting: {
        fontSize: 16,
        color: COLORS.subText,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    profileBtn: {
        padding: 5,
    },
    actionContainer: {
        padding: 20,
        gap: 20,
    },
    card: {
        height: 140,
        borderRadius: 20,
        overflow: 'hidden', // Highlight of the card
    },
    cardGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 25,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    cardSub: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },
    cardArrow: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 8,
        borderRadius: 50,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'white',
        marginHorizontal: 20,
        borderRadius: 15,
        padding: 20,
        ...SHADOWS.small,
        marginBottom: 30,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.subText,
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: '100%',
        backgroundColor: '#eee',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    seeAll: {
        color: COLORS.secondary,
        fontWeight: '600',
    },
    collectionsScroll: {
        paddingLeft: 20,
    },
    collectionCard: {
        marginRight: 15,
        width: 140,
    },
    collectionImg: {
        width: 140,
        height: 100,
        borderRadius: 12,
        marginBottom: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    collectionTitle: {
        fontWeight: '600',
        color: COLORS.text,
        marginLeft: 2
    }
});
