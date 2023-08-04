import React, { useEffect } from 'react';
import { Grid, GridItem, NumberInput } from '@strapi/design-system';
import { Coordinates } from '../../../../types';

function generateId(len: number) {
  function dec2hex(dec: number) {
    return dec.toString(16).padStart(2, '0');
  }

  var arr = new Uint8Array((len || 40) / 2);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, dec2hex).join('');
}

export default function NumberFields({
  cords,
  setCords,
  setMapsCenter,
}: {
  cords: Coordinates | null;
  setCords: React.Dispatch<React.SetStateAction<Coordinates>>;
  setMapsCenter: React.Dispatch<React.SetStateAction<Coordinates>>;
}) {
  const windowInputValueDescriptor = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  );
  if (!windowInputValueDescriptor) return null;

  const latInputId = generateId(10);
  const lngInputId = generateId(10);

  const { lat, lng } = cords || { lat: NaN, lng: NaN };

  useEffect(() => {
    const latInput = document.getElementById(latInputId) as HTMLInputElement;
    const lngInput = document.getElementById(lngInputId) as HTMLInputElement;

    const setInputValueNatively = (input: HTMLInputElement, value: number) =>
      windowInputValueDescriptor.set!.call(input, isNaN(value) ? null : value);

    setInputValueNatively(latInput, lat);
    setInputValueNatively(lngInput, lng);

    /* This will trigger a new render for the component */
    const changeEvent = new Event('change', { bubbles: true });
    latInput.dispatchEvent(changeEvent);
    lngInput.dispatchEvent(changeEvent);
  }, [lat, lng]);

  const handleInputValueChange = (newCords: Coordinates) => {
    setCords(newCords);

    if (
      isNaN(newCords.lat) ||
      isNaN(newCords.lng) ||
      (newCords.lat === lat && newCords.lng === lng)
    )
      return;

    setMapsCenter(newCords);
  };

  return (
    <Grid gap={3}>
      <GridItem col={6}>
        <NumberInput
          id={latInputId}
          placeholder='Latitude'
          aria-label='Latitude'
          hint='Latitude'
          name='latitude'
          onValueChange={(value: number) =>
            handleInputValueChange({ lat: value, lng })
          }
          size='S'
          value={lat}
        />
      </GridItem>

      <GridItem col={6}>
        <NumberInput
          id={lngInputId}
          placeholder='Longtitude'
          aria-label='Longtitude'
          hint='Longtitude'
          name='longtitude'
          onValueChange={(value: number) =>
            handleInputValueChange({ lat, lng: value })
          }
          size='S'
          value={lng}
        />
      </GridItem>
    </Grid>

    // 51.51714674884289
    // 7.454554814209886
  );
}
