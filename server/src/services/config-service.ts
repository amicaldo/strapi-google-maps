import { Core } from '@strapi/strapi';
import { Config } from 'src/interface';

const uid = 'plugin::google-maps.config';
const fields = ['googleMapsKey', 'mapId', 'defaultLatitude', 'defaultLongitude'];

export default ({ strapi }: { strapi: Core.Strapi }) => ({
    async retrieve(): Promise<Config> {
        let config: Config | null;

        /* Find existing config */
        // @ts-ignore
        config = await strapi.entityService.findMany(uid, {
            fields,
        });

        /* Create config if not found */
        if (!config) {
            config = (await strapi.db.query(uid).create({
                data: {},
                select: fields,
            })) as Config;
        }

        return config;
    },

    async update({ data }): Promise<Config> {
        /* Retrieve config */
        let config: Config = await this.retrieve();

        /* Update config */
        config = (await strapi.db.query(uid).update({
            where: {
                id: config.id,
            },
            data: data,
            select: fields,
        })) as Config;

        return config;
    },
});
