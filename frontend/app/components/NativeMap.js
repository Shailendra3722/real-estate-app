import React from 'react';
import { View, Text, Platform } from 'react-native';

let MapView, Marker, Callout;

if (Platform.OS !== 'web') {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    Callout = Maps.Callout;
}

export default function NativeMap({ children, ...props }) {
    if (Platform.OS === 'web') {
        return (
            <View style={{ flex: 1, backgroundColor: '#e2e2e2', justifyContent: 'center', alignItems: 'center' }}>
                <Text>Google Maps is not enabled for Web in this Demo.</Text>
                <Text>Please use iOS Platform or Android Emulator.</Text>
                <Text>Properties loaded: {props.children ? props.children.length : 0}</Text>
            </View>
        );
    }

    return <MapView {...props}>{children}</MapView>;
}

export const NativeMarker = (props) => {
    if (Platform.OS === 'web') return null;
    return <Marker {...props} />;
};

export const NativeCallout = (props) => {
    if (Platform.OS === 'web') return null;
    return <Callout {...props} />;
};
