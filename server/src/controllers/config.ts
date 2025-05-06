import { Core } from '@strapi/strapi';
import { sanitizeConfigInput } from '../content-types/config';
import { Config } from 'src/interface';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
    async index(ctx: any) {
        let config: Config = await strapi
            .plugin('google-maps')
            .service('config')
            .retrieve();

        if (config.googleMapsKey == '' && process.env.GOOGLE_MAPS_API_KEY) {
            config.googleMapsKey = process.env.GOOGLE_MAPS_API_KEY;
        }

        ctx.body = config;
    },

    async update(ctx: any) {
        const data: Config = await sanitizeConfigInput(ctx.request.body, ctx);

        const config: Config = await strapi
            .plugin('google-maps')
            .service('config')
            .update(data);

        ctx.body = config;

    },
});
