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
import { GoogleMapsProvider } from './GoogleMapsProvider';

interface InputProps {
  attribute: any;
  onChange: (event: any) => void;
  value: any;
  name: string;
  required?: boolean;
  label?: string;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
  intlLabel?: {
    id: string;
    defaultMessage: string;
  };
}

export default function Input({ 
  attribute, 
  onChange, 
  value, 
  name, 
  required, 
  label,
  intlLabel 
}: InputProps) {
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

    const newValue: string | null = isValidPoint(currentPoint)
      ? JSON.stringify({
          address: currentAddress,
          coordinates: currentPoint,
          geohash: Geohash.encode(currentPoint.lat, currentPoint.lng),
        })
      : null;

    if (newValue === (typeof value === 'string' ? value : JSON.stringify(value))) return;
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

  // Determine the label to display
  const displayLabel = label || 
    (intlLabel ? formatMessage(intlLabel) : formatMessage({
      id: 'input.label',
      defaultMessage: 'Location Picker'
    }));

  return (
    <>
      <Typography variant="pi" fontWeight="bold">
        {displayLabel}
      </Typography>

      {!config && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Loader small />
        </div>
      )}

      {!!config && (
        <GoogleMapsProvider config={config}>
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
        </GoogleMapsProvider>
      )}
    </>
  );
}
