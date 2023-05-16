import { Coordinates } from '../../../types';

/**
 * Get the default coordinates from the field's attributes
 * @param attributes The fields's attributes object containing the advanced setting values
 * @returns Default coordinates if they are valid, otherwise null
 */
export const getDefaultCordsFromAttribute = ({
  optionsDefaultLat,
  optionsDefaultLng,
}: {
  optionsDefaultLat: string;
  optionsDefaultLng: string;
}): Coordinates | null => {
  const defaultLat = Number(optionsDefaultLat);
  const defaultLng = Number(optionsDefaultLng);

  if (defaultLat && defaultLng && !isNaN(defaultLat) && !isNaN(defaultLng)) {
    return { lat: defaultLat, lng: defaultLng };
  }

  return null;
};
