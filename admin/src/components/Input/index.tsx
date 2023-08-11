import React, { useEffect, useReducer, useState } from 'react';
import { Box, Typography, Loader, Button } from '@strapi/design-system';
import { Coordinates, Location } from '../../../../types';
import NumberFields from './CoordsInput';
import { isSamePoint, isValidPoint, noPoint } from '../../utils/input';
import { useIntl } from 'react-intl';
import MapView from './MapView';
import useConfig from '../../hooks/useConfig';
import { Marker } from '@react-google-maps/api';
import { Refresh } from '@strapi/icons';
import Geohash from 'latlon-geohash';

export default function Input({
  attribute,
  intlLabel,
  onChange,
  value,
  name,
  required,
}: any) {
  const { formatMessage } = useIntl();

  const config = useConfig();

  const [focusPoint, setFocusPoint] = useState<Coordinates | undefined>();

  const [currentPoint, setCurrentPoint] = useReducer((_: any, action: any) => {
    const { origin, value } = action;

    if (
      (origin === 'coordsInput' ||
        origin === 'placeSearch' ||
        origin === 'fieldValue') &&
      isValidPoint(value)
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
    const newValue: string | null = isValidPoint(currentPoint)
      ? JSON.stringify({
          address: currentAddress,
          coordinates: currentPoint,
          geohash: Geohash.encode(currentPoint.lat, currentPoint.lng),
        })
      : null;

    onChange({
      target: {
        name,
        value: newValue,
        type: attribute.type, // json
      },
    });
  }, [currentPoint, currentAddress]);

  useEffect(() => {
    const parsedValue: Location | null = !!value ? JSON.parse(value) : null;

    if (!parsedValue) return;

    const { address, coordinates } = parsedValue;

    if (address === currentAddress && isSamePoint(currentPoint, coordinates))
      return;

    setCurrentPoint({ origin: 'fieldValue', value: coordinates });
    setCurrentAddress(address);
  }, [value]);

  const onReset = () => {
    setCurrentPoint({ origin: 'reset', value: noPoint });

    setCurrentAddress('');
  };

  return (
    <>
      <Typography variant='pi' fontWeight='bold'>
        {formatMessage(intlLabel)}
      </Typography>

      {!config && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Loader small />
        </div>
      )}

      {!!config && (
        <>
          <Box
            marginTop={1}
            borderColor={nothingSelectedWarning ? 'danger600' : 'primary200'}
          >
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
              <Typography variant='pi' textColor='danger600'>
                {formatMessage({
                  id: 'google-maps.input.error.required',
                  defaultMessage: 'You must pick a location',
                })}
              </Typography>
            </Box>
          )}

          <Box paddingTop={2}>
            <NumberFields
              coords={currentPoint}
              onChange={(point) =>
                setCurrentPoint({ origin: 'coordsInput', value: point })
              }
            />
          </Box>

          <Box paddingTop={2}>
            <Button startIcon={<Refresh />} onClick={onReset}>
              {formatMessage({
                id: 'google-maps.input.button.reset',
                defaultMessage: 'Reset',
              })}
            </Button>
          </Box>
        </>
      )}
    </>
  );
}
