import type { Core } from '@strapi/strapi';

const accessActions = [
    {
        section: 'plugins',
        displayName: 'View / Edit Configuration',
        uid: 'config',
        pluginName: 'google-maps',
    },
];

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
    // bootstrap phase
    await strapi.admin.services.permission.actionProvider.registerMany(
        accessActions
    );
};

export default bootstrap;
