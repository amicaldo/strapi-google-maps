import { Strapi } from '@strapi/strapi';

const accessActions = [
  {
    section: 'plugins',
    displayName: 'View / Edit Configuration',
    uid: 'config',
    pluginName: 'google-maps',
  },
];

export default async ({ strapi }: { strapi: Strapi }) => {
  // @ts-ignore
  await strapi.admin.services.permission.actionProvider.registerMany(
    accessActions
  );
};
