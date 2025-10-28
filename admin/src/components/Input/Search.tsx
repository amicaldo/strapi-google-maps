import React, { useEffect, useRef } from 'react';
import { Coordinates } from '../../../../types';
import { useIntl } from 'react-intl';

// Helper function to find the input element inside PlaceAutocompleteElement
// The element uses Shadow DOM, so we need to access via shadowRoot
function findInputElement(element: any): HTMLInputElement | null {
    // Strategy 1: Access via shadowRoot (most reliable for web components)
    if (element.shadowRoot) {
        const input = element.shadowRoot.querySelector('input');
        if (input) {
            return input;
        }
    }

    // Strategy 2: Check for inputElement property (Google's API)
    if (element.inputElement instanceof HTMLInputElement) {
        return element.inputElement;
    }

    return null;
}

export default function Search({
    userCoords,
    onPlaceSelected,
    onPlaceDetails,
}: {
    userCoords?: GeolocationCoordinates;
    onPlaceSelected: (place: { address: string; coordinates: Coordinates }) => void;
    onPlaceDetails?: (details: {
        address: string;
        coordinates: Coordinates;
        components?: {
            streetNumber?: string;
            route?: string;
            postalCode?: string;
            city?: string;
            state?: string;
            country?: string;
        };
        place?: { id?: string; name?: string; types?: string[] };
    }) => void;
}) {
    const { formatMessage } = useIntl();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const initPlaceAutocomplete = async () => {
            try {
                // Explicitly import the places library to ensure PlaceAutocompleteElement is available
                await google.maps.importLibrary('places');
            } catch (error) {
                console.error('[Google Maps] Error importing places library:', error);
                return;
            }

            // Create the PlaceAutocompleteElement with options
            const options: google.maps.places.PlaceAutocompleteElementOptions = {};

            // Configure location bias if user coordinates are available
            if (userCoords) {
                options.locationBias = {
                    radius: 50000, // 50km radius for location biasing
                    center: {
                        lat: userCoords.latitude,
                        lng: userCoords.longitude,
                    },
                };
            }

            const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement(options);

            // Set placeholder text
            const input = findInputElement(placeAutocomplete);
            if (input) {
                input.placeholder = formatMessage({
                    id: 'google-maps.input.search.placeholder',
                    defaultMessage: 'Search for a place',
                });
            }

            // Handle place selection
            // Note: placePrediction is directly on the event object, not in event.detail
            // @ts-ignore - Google's custom event typing is not in @types/google.maps
            const handlePlaceSelect = async (event: Event) => {
                const placePrediction = (event as any).placePrediction;

                if (placePrediction) {
                    try {
                        const place = placePrediction.toPlace();

                        // Fetch the required fields
                        await place.fetchFields({
                            fields: [
                                'formattedAddress',
                                'location',
                                'addressComponents',
                                'displayName',
                                'id',
                                'types',
                            ],
                        });

                        if (place.formattedAddress && place.location) {
                            const coordinates = {
                                lat: place.location.lat(),
                                lng: place.location.lng(),
                            };

                            onPlaceSelected({
                                address: place.formattedAddress,
                                coordinates,
                            });

                            // Build extended details (address components, business meta)
                            const ac = (place as any).addressComponents || [];
                            const pick = (type: string) => ac.find((c: any) => Array.isArray(c.types) && c.types.includes(type));
                            const components = {
                                streetNumber: pick('street_number')?.longText || pick('street_number')?.long_name,
                                route: pick('route')?.shortText || pick('route')?.short_name,
                                postalCode: pick('postal_code')?.longText || pick('postal_code')?.long_name,
                                city: pick('locality')?.longText || pick('locality')?.long_name,
                                state: pick('administrative_area_level_1')?.shortText || pick('administrative_area_level_1')?.short_name,
                                country: pick('country')?.longText || pick('country')?.long_name,
                            };

                            onPlaceDetails?.({
                                address: place.formattedAddress,
                                coordinates,
                                components,
                                place: {
                                    id: (place as any).id,
                                    name: (place as any).displayName,
                                    types: (place as any).types,
                                },
                            });
                        }
                    } catch (error) {
                        console.error('[Google Maps] Error fetching place details:', error);
                    }
                }
            };

            // Add event listener
            placeAutocomplete.addEventListener('gmp-select', handlePlaceSelect);

            // Apply styling to match original design
            const style = document.createElement('style');
            style.textContent = `
                gmp-place-autocomplete {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    margin-top: 10px;
                    width: 300px;
                    --gmp-color-surface: white;
                    --gmp-color-on-surface: #202124;
                    --gmp-color-surface-variant: #f8f9fa;
                }

                gmp-place-autocomplete input {
                    box-sizing: border-box;
                    border: 1px solid transparent;
                    width: 100%;
                    height: 40px;
                    padding: 0 12px;
                    border-radius: 3px;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
                    font-size: 14px;
                    outline: none;
                    text-overflow: ellipsis;
                }
            `;
            document.head.appendChild(style);

            // Append to container
            if (containerRef.current) {
                containerRef.current.appendChild(placeAutocomplete);
            }

            // Cleanup function
            return () => {
                placeAutocomplete.removeEventListener('gmp-select', handlePlaceSelect);
                if (containerRef.current?.contains(placeAutocomplete)) {
                    containerRef.current.removeChild(placeAutocomplete);
                }
                if (document.head.contains(style)) {
                    document.head.removeChild(style);
                }
            };
        };

        // Call the async initialization function
        const cleanupPromise = initPlaceAutocomplete();

        // Return cleanup function that awaits the result
        return () => {
            cleanupPromise
                .then((cleanup) => {
                    if (cleanup) cleanup();
                })
                .catch((error) => {
                    console.error('[Google Maps] Error during cleanup:', error);
                });
        };
    }, [userCoords, formatMessage, onPlaceSelected]);

    return <div ref={containerRef} style={{ position: 'relative', width: '100%' }} />;
}
