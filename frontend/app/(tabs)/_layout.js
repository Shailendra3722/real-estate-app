import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useLanguage } from '../components/LanguageContext';

export default function TabLayout() {
    const { t } = useLanguage();

    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: COLORS.secondary,
            tabBarInactiveTintColor: COLORS.subText,
            tabBarStyle: {
                backgroundColor: COLORS.card,
                borderTopWidth: 0,
                elevation: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                height: 60,
                paddingBottom: 10,
                paddingTop: 10
            },
            headerShown: false,
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600'
            }
        }}>
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    title: 'Buy',
                    tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="sell"
                options={{
                    title: 'Sell',
                    tabBarIcon: ({ color }) => <Ionicons name="add-circle" size={40} color={COLORS.secondary} style={{ marginTop: -10 }} />,
                    tabBarLabelStyle: { display: 'none' } // Highlight icon only? Or keep label. Let's keep label for clarity but style it.
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
