import React, { useEffect, useRef } from 'react';
import { useGoogleMap } from '@react-google-maps/api';
import { Coordinates } from '../../../../types';

interface AdvancedMarkerProps {
    position: Coordinates;
}

export default function AdvancedMarker({ position }: AdvancedMarkerProps) {
    const map = useGoogleMap();
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

    useEffect(() => {
        if (!map) return;

        // Create marker on first render
        if (!markerRef.current) {
            const createMarker = async () => {
                const { AdvancedMarkerElement } = await google.maps.importLibrary(
                    'marker'
                ) as google.maps.MarkerLibrary;

                markerRef.current = new AdvancedMarkerElement({
                    map,
                    position: {
                        lat: position.lat,
                        lng: position.lng,
                    },
                });
            };

            createMarker();
        }

        return () => {
            // Cleanup: remove marker when component unmounts
            if (markerRef.current) {
                markerRef.current.map = null;
            }
        };
    }, [map]);

    // Update marker position when position prop changes
    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.position = {
                lat: position.lat,
                lng: position.lng,
            };
        }
    }, [position]);

    return null;
}
