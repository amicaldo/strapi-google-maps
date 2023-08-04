import React, { useState, useEffect } from 'react';
import { Box, Typography, Loader, Button } from '@strapi/design-system';
import { Refresh } from '@strapi/icons';
import Geohash from 'latlon-geohash';
import { useIntl } from 'react-intl';
import {
  GoogleMap,
  Marker,
  LoadScript,
  StandaloneSearchBox,
} from '@react-google-maps/api';
import { Config, Coordinates, Location } from '../../../../types';
import { getConfig } from '../../utils/axios';
import { getDefaultCordsFromAttribute } from '../../utils/input';
import { useGeolocated } from 'react-geolocated';
import NumberFields from './NumberFields';

const invalidCords = (cords: Coordinates) =>
  isNaN(cords.lat) || isNaN(cords.lng);

const noCords = {
  lat: NaN,
  lng: NaN,
};

const mapsLibraries: 'places'[] = ['places']; // allow the use of places api for searchbox

const fallbackCenter: Coordinates = {
  lat: 51.51652494189269,
  lng: 7.45560626859687,
};

const Input = ({
  attribute,
  intlLabel,
  onChange,
  value,
  name,
  required,
}: any) => {
  const overwriteFieldValue = (value: Location | null) => {
    onChange({
      target: {
        name,
        value: value ? JSON.stringify(value) : null,
        type: attribute.type, // json
      },
    });
  };

  const { formatMessage } = useIntl();

  const { coords: userCords }: { coords: GeolocationCoordinates | undefined } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: false,
      },
    }); // Get user's current coordinates

  const defaultCords: Coordinates | null =
    getDefaultCordsFromAttribute(attribute); // Get default coordinates from attribute

  /* State initialization */
  const [configIsLoaded, setConfigIsLoaded] = useState(false); // Indicates whether plugin config has been fetched
  const [mapsIsLoaded, setMapsIsLoaded] = useState(false); // Indicates wether google maps has been loaded

  const [requirementNotMet, setRequirementNotMet] = useState(false); // Indicates whether the requirement is met

  const [config, setConfig] = useState<Config>({
    id: 0,
    googleMapsKey: '',
  }); // Plugin config

  const [cords, setCords] = useState<Coordinates>(noCords); // Current coordinates

  const [mapsCenter, setMapsCenter] = useState<Coordinates>(
    fallbackCenter // Current map's center coordinates
  );

  const [address, setAddress] = useState<string>(''); // Searchbox input value

  const [searchBox, setSearchBox] =
    useState<google.maps.places.SearchBox | null>(null); // Searchbox ref

  /* Reset function */
  const resetComponent = (persistValue = true) => {
    /* Field's value */
    if (!persistValue) overwriteFieldValue(null); // Overwrite field's value to null, if field's value is not being persisted

    /* Current coordinates */
    const parsedValue: Location | null = persistValue
      ? JSON.parse(value || null)
      : null; // Parse saved location, if field's value is being persisted

    setCords(parsedValue?.coordinates || noCords); // Set cords to saved coordinates, if they exist

    /* Current map's center coordinates */
    setMapsCenter(
      parsedValue?.coordinates ??
        (userCords
          ? { lat: userCords.latitude, lng: userCords.longitude }
          : fallbackCenter) // Set map's center to saved coordinates, default coordinates, user coordinates or default coordinates
    );

    /* Searchbox input value */
    setAddress(parsedValue?.address || '');
  };

  /* Center the map at userCords, in the right situation */
  useEffect(() => {
    if (invalidCords(cords) && userCords)
      // If no coordinates have been picked, use user's current coordinates instead of fallback for map's center
      setMapsCenter({ lat: userCords.latitude, lng: userCords.longitude });
  }, [userCords, cords]);

  /* On mount, reset this field and fetch the plugin's config */
  useEffect(() => {
    resetComponent();

    /* Fetch plugin config using axios instance */
    getConfig()
      .then((response) => {
        const { data }: { data: Config } = response.data;
        setConfig(data);

        setConfigIsLoaded(true);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  /* When google maps is loaded, set the default coordinates if they exist */
  useEffect(() => {
    if (mapsIsLoaded && !value && defaultCords) {
      setCords(defaultCords);
      setMapsCenter(defaultCords);
    }
  }, [mapsIsLoaded]);

  /* Handle coordinates change */
  useEffect(() => {
    setRequirementNotMet(required && invalidCords(cords)); // Mark the requirement as not met if field's value is null but it's required

    if (invalidCords(cords) || !mapsIsLoaded) return;

    /* Generate geohash from coordinates */
    const geohash = Geohash.encode(cords?.lat, cords?.lng);

    /* Update field's json value */
    const location: Location = {
      coordinates: cords,
      geohash,
      address,
    };

    overwriteFieldValue(location);
  }, [cords]);

  /* Handle a place being selected using searchbox */
  const handlePlaceChanged = () => {
    const results: google.maps.places.PlaceResult[] | undefined =
      searchBox?.getPlaces();

    if (results && results.length) {
      const place = results[0];

      if (place.formatted_address) setAddress(place.formatted_address);

      const coordinates = place.geometry?.location?.toJSON() as Coordinates;
      setCords(coordinates);
      setMapsCenter(coordinates);
    }
  };

  return (
    <>
      <Typography variant='pi' fontWeight='bold'>
        {formatMessage(intlLabel)}
      </Typography>

      <Box
        marginTop={1}
        borderColor={requirementNotMet ? 'danger600' : 'primary200'}
      >
        {configIsLoaded && (
          <LoadScript
            googleMapsApiKey={config.googleMapsKey}
            libraries={mapsLibraries}
            onLoad={() => setMapsIsLoaded(true)}
          />
        )}

        {!configIsLoaded || !mapsIsLoaded ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Loader small>Loading content...</Loader>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={{
              width: '100%',
              height: '400px',
            }}
            center={mapsCenter}
            zoom={20}
            onClick={({ latLng }) => setCords(latLng?.toJSON() as Coordinates)}
          >
            <StandaloneSearchBox
              bounds={
                userCords
                  ? new google.maps.LatLngBounds({
                      lat: userCords.latitude,
                      lng: userCords.longitude,
                    })
                  : undefined
              }
              onLoad={(ref) => setSearchBox(ref)}
              onPlacesChanged={handlePlaceChanged}
            >
              <input
                type='text'
                placeholder={formatMessage({
                  id: 'google-maps.input.search.placeholder',
                  defaultMessage: 'Search for a place',
                })}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
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

            {!invalidCords(cords) && <Marker position={cords} />}
          </GoogleMap>
        )}
      </Box>

      {requirementNotMet && (
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
          cords={cords}
          setCords={setCords}
          setMapsCenter={setMapsCenter}
        />
      </Box>

      <Box paddingTop={2}>
        <Button startIcon={<Refresh />} onClick={() => resetComponent(false)}>
          {formatMessage({
            id: 'google-maps.input.button.reset',
            defaultMessage: 'Reset',
          })}
        </Button>
      </Box>
    </>
  );
};

export default Input;
