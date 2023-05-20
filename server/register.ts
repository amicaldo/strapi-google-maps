import { Strapi } from '@strapi/strapi';

export default ({ strapi }: { strapi: Strapi }) => {
  // @ts-ignore Strapi typings are incomplete
  strapi.customFields.register({
    name: 'location-picker',
    plugin: 'google-maps',
    type: 'json',
  });
};
