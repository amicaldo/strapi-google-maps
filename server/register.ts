import { Strapi } from '@strapi/strapi';

export default ({ strapi }: { strapi: Strapi }) => {
  strapi.customFields.register({
    name: 'Google-Maps',
    plugin: 'google-maps',
    type: 'json',
  });
};
