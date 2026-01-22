import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text style={styles.title}>Something went wrong.</Text>
                    <Text style={styles.error}>{this.state.error.toString()}</Text>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#ffebeb',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#d32f2f',
        marginBottom: 10,
    },
    error: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'monospace',
        textAlign: 'center',
    },
});

export default ErrorBoundary;
