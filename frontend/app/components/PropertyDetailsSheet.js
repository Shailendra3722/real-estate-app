import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, Dimensions } from 'react-native';
import { useLanguage } from './LanguageContext';

const { width } = Dimensions.get('window');

export default function PropertyDetailsSheet({ property, visible, onClose, onBuy }) {
    const { t } = useLanguage();

    if (!property) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Text style={styles.closeText}>×</Text>
                    </TouchableOpacity>

                    {/* Header Image Placeholder */}
                    <View style={styles.imagePlaceholder}>
                        <Text style={{ color: '#bdc3c7' }}>Property Image</Text>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.headerRow}>
                            <Text style={styles.title}>{property.title}</Text>
                            {property.status === 'VERIFIED' && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>✓ {t('VERIFIED')}</Text>
                                </View>
                            )}
                        </View>

                        <Text style={styles.price}>₹{property.price_fiat.toLocaleString('en-IN')}</Text>

                        <Text style={styles.sectionHeader}>Details</Text>
                        <Text style={styles.desc}>{property.description}</Text>

                        <View style={styles.ownerRow}>
                            <View style={styles.avatar} />
                            <View>
                                <Text style={styles.ownerLabel}>{t('OWNER')}</Text>
                                <Text style={styles.ownerName}>Verified Seller</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.buyBtn} onPress={() => onBuy(property)}>
                            <Text style={styles.buyText}>{t('BUY_REQ')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '75%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10
    },
    closeBtn: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        elevation: 2
    },
    closeText: { fontSize: 24, fontWeight: '600', color: '#333', marginTop: -2 },
    imagePlaceholder: {
        width: '100%',
        height: 250,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24
    },
    content: { flex: 1, padding: 24 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    title: { fontSize: 24, fontWeight: '800', color: '#111827', flex: 1, marginRight: 10, lineHeight: 30 },
    badge: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#86EFAC',
        alignSelf: 'flex-start'
    },
    badgeText: { color: '#166534', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
    price: { fontSize: 32, fontWeight: '900', color: '#4776E6', marginBottom: 20, letterSpacing: -0.5 },
    sectionHeader: { fontSize: 18, fontWeight: '700', marginBottom: 10, color: '#374151', marginTop: 10 },
    desc: { fontSize: 16, color: '#4B5563', marginBottom: 30, lineHeight: 24 },
    ownerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },
    avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#D1D5DB', marginRight: 16 },
    ownerLabel: { fontSize: 12, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600' },
    ownerName: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
    buyBtn: {
        backgroundColor: '#4776E6',
        paddingVertical: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: "#4776E6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        elevation: 8,
        marginBottom: 20
    },
    buyText: { color: 'white', fontSize: 18, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' }
});
