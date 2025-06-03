import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Config } from '../../../../types';

interface GoogleMapsContextType {
    isLoaded: boolean;
    loadError: boolean;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
    isLoaded: false,
    loadError: false,
});

export const useGoogleMaps = () => useContext(GoogleMapsContext);

// Global state to track script loading
let scriptState = {
    isLoaded: false,
    isLoading: false,
    loadError: false,
    apiKey: '',
    callbacks: new Set<() => void>(),
};

// Function to check if Google Maps is ready
const isGoogleMapsReady = (): boolean => {
    return !!(
        typeof window !== 'undefined' &&
        window.google &&
        window.google.maps &&
        window.google.maps.Map &&
        window.google.maps.places
    );
};

// Function to load Google Maps script manually
const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        // If already loaded, resolve immediately
        if (isGoogleMapsReady()) {
            resolve();
            return;
        }

        // If script exists but not ready, wait for it
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
            const checkReady = () => {
                if (isGoogleMapsReady()) {
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
            return;
        }

        // Create new script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            // Wait a bit for Google Maps to initialize
            const checkReady = () => {
                if (isGoogleMapsReady()) {
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        };

        script.onerror = () => {
            reject(new Error('Failed to load Google Maps script'));
        };

        document.head.appendChild(script);
    });
};

interface GoogleMapsProviderProps {
    children: ReactNode;
    config?: Config;
}

export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({ children, config }) => {
    const [isLoaded, setIsLoaded] = useState(scriptState.isLoaded);
    const [loadError, setLoadError] = useState(scriptState.loadError);

    useEffect(() => {
        if (!config?.googleMapsKey) return;

        // If already loaded with the same API key, set state immediately
        if (scriptState.isLoaded && scriptState.apiKey === config.googleMapsKey) {
            setIsLoaded(true);
            return;
        }

        // If already loading with the same API key, just wait
        if (scriptState.isLoading && scriptState.apiKey === config.googleMapsKey) {
            const callback = () => {
                setIsLoaded(scriptState.isLoaded);
                setLoadError(scriptState.loadError);
            };
            scriptState.callbacks.add(callback);
            return () => {
                scriptState.callbacks.delete(callback);
            };
        }

        // Start loading if not already loading
        if (!scriptState.isLoading && !scriptState.isLoaded) {
            scriptState.isLoading = true;
            scriptState.apiKey = config.googleMapsKey;

            loadGoogleMapsScript(config.googleMapsKey)
                .then(() => {
                    scriptState.isLoaded = true;
                    scriptState.isLoading = false;
                    setIsLoaded(true);
                    // Notify all other instances
                    scriptState.callbacks.forEach(callback => callback());
                })
                .catch((error) => {
                    console.error('Failed to load Google Maps:', error);
                    scriptState.loadError = true;
                    scriptState.isLoading = false;
                    setLoadError(true);
                    // Notify all other instances
                    scriptState.callbacks.forEach(callback => callback());
                });
        }
    }, [config?.googleMapsKey]);

    const value = {
        isLoaded: isLoaded && isGoogleMapsReady(),
        loadError,
    };

    return (
        <GoogleMapsContext.Provider value={value}>
            {children}
        </GoogleMapsContext.Provider>
    );
}; 