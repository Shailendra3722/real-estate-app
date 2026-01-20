import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
// Only import these on web to avoid native crashes (though file is .web.js)
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons in Webpack/Expo
const iconRetinaUrl = require('leaflet/dist/images/marker-icon-2x.png');
const iconUrl = require('leaflet/dist/images/marker-icon.png');
const shadowUrl = require('leaflet/dist/images/marker-shadow.png');

// Only apply fix on client side
if (Platform.OS === 'web') {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: iconRetinaUrl,
        iconUrl: iconUrl,
        shadowUrl: shadowUrl,
    });
}

const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    map.setView(center, zoom);
    return null;
};

const LocateControl = () => {
    const map = useMap();

    const handleLocate = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                map.flyTo([latitude, longitude], 14);
            },
            (error) => {
                console.error(error);
                alert("Unable to retrieve your location");
            }
        );
    };

    return (
        <div className="leaflet-bottom leaflet-right" style={{ marginBottom: 80, marginRight: 10, pointerEvents: 'auto' }}>
            <div className="leaflet-control leaflet-bar">
                <a href="#" role="button" title="My Location" onClick={(e) => { e.preventDefault(); handleLocate(); }}
                    style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderRadius: 4, cursor: 'pointer' }}>
                    <span style={{ fontSize: 20 }}>📍</span>
                </a>
            </div>
        </div>
    );
};

export default function NativeMap({ children, region, style, mapType = 'standard', userLocation, ...props }) {
    // Default Delhi/India center if no region
    const center = region ? [region.latitude, region.longitude] : [20.5937, 78.9629];
    const zoom = region ? 12 : 5;

    // Tile Layer URLs
    const standardUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const satelliteUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    const attribution = mapType === 'satellite'
        ? 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

    return (
        <View style={{ flex: 1, backgroundColor: '#ddd', overflow: 'hidden' }}>
            {/* Force Leaflet CSS injection if import fails or as backup */}
            <style type="text/css">
                {`
                   .leaflet-container {
                        width: 100%;
                        height: 100%;
                        z-index: 1;
                    }
                `}
            </style>

            <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ width: '100%', height: '100%' }}>
                <ChangeView center={center} zoom={zoom} />
                <TileLayer
                    attribution={attribution}
                    url={mapType === 'satellite' ? satelliteUrl : standardUrl}
                />

                {/* Range Circle around User Location */}
                {userLocation && (
                    <Circle
                        center={[userLocation.latitude, userLocation.longitude]}
                        pathOptions={{ fillColor: '#3b82f6', color: '#2563eb', weight: 1, fillOpacity: 0.2 }}
                        radius={500} // 500 meters accuracy radius visualization
                    />
                )}

                <LocateControl />
                {children}
            </MapContainer>
        </View>
    );
}

export const NativeMarker = ({ coordinate, title, description, onPress, onDragEnd, draggable, pinColor, ...props }) => {
    if (!coordinate) return null;

    // Custom Icon logic could go here based on pinColor
    // For now use default

    const eventHandlers = React.useMemo(
        () => ({
            click: (e) => {
                if (onPress) onPress(e);
            },
            dragend(e) {
                const marker = e.target;
                if (marker && onDragEnd) {
                    const position = marker.getLatLng();
                    // console.log("Dragged to:", position);
                    onDragEnd({ nativeEvent: { coordinate: { latitude: position.lat, longitude: position.lng } } });
                }
            },
        }),
        [onPress, onDragEnd],
    );

    return (
        <Marker
            draggable={draggable}
            position={[coordinate.latitude, coordinate.longitude]}
            eventHandlers={eventHandlers}
        >
            {(title || description) && (
                <Popup>
                    <strong>{title}</strong><br />
                    {description}
                </Popup>
            )}
        </Marker>
    );
};

// Callout is handled by Popup in Leaflet, so basic pass-through or no-op
export const NativeCallout = (props) => null;
