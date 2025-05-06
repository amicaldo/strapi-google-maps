import { Config } from 'src/interface';

const schema = {
    kind: 'singleType',
    collectionName: 'google_maps_configs',
    info: {
        singularName: 'config',
        pluralName: 'configs',
        displayName: 'Google Maps Config',
    },
    options: {
        draftAndPublish: false,
    },
    pluginOptions: {
        'content-manager': {
            visible: false,
        },
        'content-type-builder': {
            visible: false,
        },
    },
    attributes: {
        googleMapsKey: {
            type: 'string',
            default: '',
            required: true,
            configurable: false,
        },
        defaultLatitude: {
            type: 'string',
            default: '',
            required: true,
            configurable: false,
        },
        defaultLongitude: {
            type: 'string',
            default: '',
            required: true,
            configurable: false,
        },
    },
};

export default schema;

export function sanitizeConfigInput(data: object, ctx: any): Promise<Config> {
    // @ts-ignore
    return strapi.contentAPI.sanitize.input(data, schema, { auth: ctx.state.auth });
}
