import * as utils from '@strapi/utils';
import { Config } from '../../types';
import { Model } from '@strapi/utils/dist/types';

const { sanitize } = utils;
const { contentAPI } = sanitize;

const schema: Model = {
  kind: 'singleType',
  collectionName: 'google_maps_configs',
  info: {
    singularName: 'config',
    pluralName: 'configs',
    // @ts-ignore
    displayName: 'Google Maps Config',
  },
  options: {
    // @ts-ignore
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

export default schema;

export function sanitizeConfigInput(data: object, ctx: any): Promise<Config> {
  return contentAPI.input(data, schema, ctx.state.auth) as Promise<Config>;
}
