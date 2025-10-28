import React, { useEffect, useState } from 'react';
import { Config, Coordinates, Place, SetPointAction } from '../../../../types';
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
}: {
    children: React.ReactNode;
    config?: Config;
    focusPoint?: Coordinates;
    onCoordsChange: (action: SetPointAction) => void;
    onAddressChange: (address: string) => void;
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

    const onPlaceSelected = (place: Place) => {
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
            onClick={({ latLng }) =>
                onCoordsChange({
                    origin: 'map',
                    value: latLng?.toJSON() as Coordinates,
                })
            }
        >
            <Search
                userCoords={userCoords}
                onPlaceSelected={onPlaceSelected}
            />

            {children}
        </GoogleMap>
    );
}