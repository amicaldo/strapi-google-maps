import React, { useEffect, useState } from 'react';
import { Config, Coordinates, Place, SetPointAction } from '../../../../types';
import { GoogleMap } from '@react-google-maps/api';
import { Loader } from '@strapi/design-system';
import { useGeolocated } from 'react-geolocated';
import Search from './Search';
import { useGoogleMaps } from './GoogleMapsProvider';

const fallbackCenter: Coordinates = {
    lat: 51.51652494189269,
    lng: 7.45560626859687,
};

export default function MapView({
    children,
    config,
    focusPoint,
    currentAddress,
    onCoordsChange,
    onAddressChange,
}: {
    children: React.ReactNode;
    config?: Config;
    focusPoint?: Coordinates;
    currentAddress: string;
    onCoordsChange: (action: SetPointAction) => void;
    onAddressChange: (address: string) => void;
}) {
    const { isLoaded, loadError } = useGoogleMaps();
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

    if (loadError) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <p>Failed to load Google Maps. Please check your API key.</p>
            </div>
        );
    }

    return (
        <>
            {isLoaded ? (
                <GoogleMap
                    mapContainerStyle={{
                        width: '100%',
                        height: '400px',
                    }}
                    center={center}
                    zoom={20}
                    onClick={({ latLng }) =>
                        onCoordsChange({
                            origin: 'map',
                            value: latLng?.toJSON() as Coordinates,
                        })
                    }
                >
                    <Search
                        userCoords={userCoords}
                        currentAddress={currentAddress}
                        onPlaceSelected={onPlaceSelected}
                        onAddressEdited={onAddressChange}
                    />

                    {children}
                </GoogleMap>
            ) : (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Loader small />
                </div>
            )}
        </>
    );
}