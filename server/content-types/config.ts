import utils from '@strapi/utils';
import { Config } from '../../custom';

const { sanitize } = utils;
const { contentAPI } = sanitize;

export default {
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
  },
};

export function sanitizeConfigInput(data: object, ctx: any): Promise<Config> {
  return contentAPI.input(data, this, ctx.state.auth);
}
