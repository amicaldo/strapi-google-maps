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

export interface Location {
    coordinates: Coordinates;
    geohash: string;
    address: string;
}

export interface SetPointAction {
    origin: string;
    value: Coordinates;
}