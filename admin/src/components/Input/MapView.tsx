import React, { useEffect, useState } from 'react';
import { Config, Coordinates, SetPointAction } from '../../../../types';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Loader } from '@strapi/design-system';
import { useGeolocated } from 'react-geolocated';
import Search from './Search';

const fallbackCenter: Coordinates = {
    lat: 51.51652494189269,
    lng: 7.45560626859687,
};

const libraries: ('places' | 'marker')[] = ['places', 'marker'];

export default function MapView({
    children,
    config,
    focusPoint,
    onCoordsChange,
    onAddressChange,
    onPlaceDetailsChange,
}: {
    children: React.ReactNode;
    config?: Config;
    focusPoint?: Coordinates;
    onCoordsChange: (action: SetPointAction) => void;
    onAddressChange: (address: string) => void;
    onPlaceDetailsChange?: (details: any) => void;
}) {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: config?.googleMapsKey || '',
        libraries,
        id: 'google-map-script',
    });

    const [center, setCenter] = useState<Coordinates>(fallbackCenter);

    const { coords: userCoords }: { coords?: GeolocationCoordinates } =
        useGeolocated({
            positionOptions: {
                enableHighAccuracy: false,
            },
        });

    useEffect(() => {
        if (focusPoint) {
            setCenter(focusPoint);
        } else if (userCoords) {
            setCenter({
                lat: userCoords.latitude,
                lng: userCoords.longitude,
            });
        } else {
            setCenter(fallbackCenter);
        }
    }, [focusPoint, userCoords]);

    const onPlaceSelected = (place: { address: string; coordinates: Coordinates }) => {
        onCoordsChange({ origin: 'placeSearch', value: place.coordinates });
        onAddressChange(place.address);
    };

    if (!config || !isLoaded) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Loader small />
            </div>
        );
    }

    return (
        <GoogleMap
            mapContainerStyle={{
                width: '100%',
                height: '400px',
            }}
            center={center}
            zoom={20}
            options={{
                mapId: 'DEMO_MAP_ID',
            }}
				onClick={({ latLng }) => {
					const coords = latLng?.toJSON() as Coordinates;
					onCoordsChange({ origin: 'map', value: coords });

					try {
						const geocoder = new google.maps.Geocoder();
						geocoder
							.geocode({ location: coords })
							.then(({ results }) => {
								const best = results && results.length > 0 ? results[0] : undefined;
								if (!best) return;

								const formatted = (best as any).formatted_address || '';
								onAddressChange(formatted);

								const ac = (best as any).address_components || [];
								const pick = (type: string) => ac.find((c: any) => Array.isArray(c.types) && c.types.includes(type));
								const components = {
									streetNumber: pick('street_number')?.long_name,
									route: pick('route')?.long_name,
									postalCode: pick('postal_code')?.long_name,
									city: pick('locality')?.long_name,
									state: pick('administrative_area_level_1')?.short_name,
									country: pick('country')?.long_name,
								};

								onPlaceDetailsChange?.({
									address: formatted,
									coordinates: coords,
									components,
									place: {
										id: (best as any).place_id,
										name: (best as any).name,
										types: (best as any).types,
									},
								});
							})
							.catch((error) => {
								console.error('[Google Maps] Error reverse geocoding:', error);
							});
					} catch (error) {
						console.error('[Google Maps] Geocoder init failed:', error);
					}
				}}
        >
            <Search
                userCoords={userCoords}
                onPlaceSelected={onPlaceSelected}
                onPlaceDetails={onPlaceDetailsChange}
            />

            {children}
        </GoogleMap>
    );
}