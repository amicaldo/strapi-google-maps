import { StandaloneSearchBox } from '@react-google-maps/api';
import React, { useState } from 'react';
import { Coordinates, Place } from '../../../../types';
import { useIntl } from 'react-intl';

export default function Search({
    userCoords,
    currentAddress,
    onPlaceSelected,
    onAddressEdited,
}: {
    userCoords?: GeolocationCoordinates;
    currentAddress: string;
    onPlaceSelected: (place: Place) => void;
    onAddressEdited: (address: string) => void;
}) {
    const { formatMessage } = useIntl();

    const bounds = !!userCoords
        ? new google.maps.LatLngBounds({
            lat: userCoords.latitude,
            lng: userCoords.longitude,
        })
        : undefined;

    const [searchBox, setSearchBox] = useState<
        google.maps.places.SearchBox | undefined
    >();

    const onPlacesChanged = () => {
        const results: google.maps.places.PlaceResult[] | undefined =
            searchBox?.getPlaces();

        if (results && results.length) {
            const place = results[0];

            onPlaceSelected({
                address: place.formatted_address || '',
                coordinates: place.geometry?.location?.toJSON() as Coordinates,
            });
        }
    };

    return (
        <StandaloneSearchBox
            bounds={bounds}
            onLoad={(ref) => setSearchBox(ref)}
            onPlacesChanged={onPlacesChanged}
        >
            <input
                type='text'
                placeholder={formatMessage({
                    id: 'google-maps.input.search.placeholder',
                    defaultMessage: 'Search for a place',
                })}
                value={currentAddress}
                onChange={(e) => onAddressEdited(e.target.value)}
                style={{
                    boxSizing: `border-box`,
                    border: `1px solid transparent`,
                    width: `300px`,
                    height: `40px`,
                    padding: `0 12px`,
                    borderRadius: `3px`,
                    boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                    fontSize: `14px`,
                    outline: `none`,
                    textOverflow: `ellipses`,
                    position: 'absolute',
                    left: '50%',
                    marginLeft: '-140px',
                    marginTop: '10px',
                }}
            />
        </StandaloneSearchBox>
    );
}