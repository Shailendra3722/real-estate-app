const React = require('react');
const { View, Text } = require('react-native');

const ValidMap = (props) => {
    return React.createElement(View, { style: { flex: 1, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' } },
        React.createElement(Text, null, "Maps are not supported on Web in this demo."),
        props.children
    );
};

// Mock exports mimicking react-native-maps
module.exports = {
    __esModule: true,
    default: ValidMap,
    Marker: (props) => null,
    Callout: (props) => null,
    PROVIDER_GOOGLE: 'google',
    PROVIDER_DEFAULT: 'default'
};
