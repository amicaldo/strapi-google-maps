/**
 * The plugin's configuration content-type.
 */
export interface Config {
    id: number;
    googleMapsKey: string;
    mapId?: string;
    defaultLatitude: string;
    defaultLongitude: string;
}

export interface UpdateConfig extends Omit<Config, 'id'> { }

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface Place {
    address: string;
    coordinates: Coordinates;
}

export interface AddressComponents {
    streetNumber?: string;
    route?: string;
    postalCode?: string;
    city?: string;
    state?: string;
    country?: string;
}

export interface PlaceMeta {
    id?: string;
    name?: string;
    types?: string[];
}

export interface Location {
    coordinates: Coordinates;
    geohash: string;
    address: string;
    components?: AddressComponents;
    place?: PlaceMeta;
}

export interface SetPointAction {
    origin: string;
    value: Coordinates;
}