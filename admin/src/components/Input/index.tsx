import React, { useEffect, useReducer, useState, useRef } from 'react';
import { Box, Typography, Loader, Button } from '@strapi/design-system';
import { Coordinates, Location } from '../../../../types';
import { isSamePoint, isValidPoint, noPoint } from '../../utils/input';
import { useIntl } from 'react-intl';
import useConfig from '../../hooks/useConfig';
import { Marker } from '@react-google-maps/api';
import { ArrowClockwise } from '@strapi/icons';
import Geohash from 'latlon-geohash';
import MapView from './MapView';
import NumberFields from './CoordsInput';
import { useAuth } from '@strapi/strapi/admin';

// Helper function to compare Location objects by value
const isLocationEqual = (location1: Location | null, location2: Location | null): boolean => {
  if (location1 === location2) return true;
  if (!location1 || !location2) return false;
  
  return (
    location1.address === location2.address &&
    location1.geohash === location2.geohash &&
    isSamePoint(location1.coordinates, location2.coordinates)
  );
};

export default function Input({ attribute, onChange, value, name, required }: any) {
  const { formatMessage } = useIntl();

  const config = useConfig();
  const isInitialMount = useRef(true);

  const [focusPoint, setFocusPoint] = useState<Coordinates | undefined>();

  const [currentPoint, setCurrentPoint] = useReducer((state: Coordinates, action: any) => {
    const { origin, value } = action;

    if (
      (origin === 'coordsInput' || origin === 'placeSearch' || origin === 'fieldValue') &&
      isValidPoint(value) &&
      !isSamePoint(state, value)
    ) {
      setFocusPoint(value);
    }

    return value;
  }, noPoint);

  const [currentAddress, setCurrentAddress] = useState('');
  const [nothingSelectedWarning, setNothingSelectedWarning] = useState(false);

  useEffect(() => {
    if (required && !isValidPoint(currentPoint)) {
      setNothingSelectedWarning(true);
    } else if (nothingSelectedWarning) {
      setNothingSelectedWarning(false);
    }
  }, [currentPoint]);

  useEffect(() => {
    if (!value) return;

    let parsedValue: Location = value;

    if (typeof value === 'string') {
      parsedValue = JSON.parse(value);
    }

    if (!parsedValue) return;

    const { address, coordinates } = parsedValue;

    if (address === currentAddress && isSamePoint(currentPoint, coordinates)) return;

    setCurrentPoint({ origin: 'fieldValue', value: coordinates });
    setCurrentAddress(address);
  }, [value]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const newLocation: Location | null = isValidPoint(currentPoint)
      ? {
          address: currentAddress,
          coordinates: currentPoint,
          geohash: Geohash.encode(currentPoint.lat, currentPoint.lng),
        }
      : null;

    // Parse the existing value for comparison
    let existingLocation: Location | null = null;
    if (value) {
      if (typeof value === 'string') {
        try {
          existingLocation = JSON.parse(value);
        } catch (e) {
          // Invalid JSON, treat as null
        }
      } else {
        existingLocation = value;
      }
    }

    // Only trigger onChange if the values are actually different
    if (isLocationEqual(newLocation, existingLocation)) return;
    
    const newValue = newLocation ? JSON.stringify(newLocation) : null;
    onChange({
      target: {
        name,
        value: newValue,
        type: attribute.type,
      },
    });
  }, [currentPoint, currentAddress]);

  // If the config is set and the value is not set, set the focus point to the default latitude and longitude
  useEffect(() => {
    if (config?.defaultLatitude && config?.defaultLongitude && !value) {
      setFocusPoint({
        lat: parseFloat(config.defaultLatitude),
        lng: parseFloat(config.defaultLongitude),
      });
    }
  }, [config]);

  const onReset = () => {
    setCurrentPoint({ origin: 'reset', value: noPoint });

    setCurrentAddress('');
  };

  return (
    <>
      <Typography variant="pi" fontWeight="bold">
        {formatMessage({
          id: 'input.label',
        })}
      </Typography>

      {!config && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Loader small />
        </div>
      )}

      {!!config && (
        <>
          <Box marginTop={1} borderColor={nothingSelectedWarning ? 'danger600' : 'primary200'}>
            <MapView
              config={config}
              focusPoint={focusPoint}
              currentAddress={currentAddress}
              onCoordsChange={setCurrentPoint}
              onAddressChange={setCurrentAddress}
            >
              {isValidPoint(currentPoint) && <Marker position={currentPoint} />}
            </MapView>
          </Box>

          {nothingSelectedWarning && (
            <Box paddingTop={1}>
              <Typography variant="pi" textColor="danger600">
                {formatMessage({
                  id: 'input.error.required',
                })}
              </Typography>
            </Box>
          )}

          <Box paddingTop={2}>
            <NumberFields
              coords={currentPoint}
              onChange={(point) => setCurrentPoint({ origin: 'coordsInput', value: point })}
            />
          </Box>

          <Box paddingTop={2}>
            <Button startIcon={<ArrowClockwise />} onClick={onReset}>
              {formatMessage({
                id: 'input.button.reset',
              })}
            </Button>
          </Box>
        </>
      )}
    </>
  );
}
