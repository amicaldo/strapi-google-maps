import { Strapi } from '@strapi/strapi';
import { Config } from '../../types';

const uid = 'plugin::google-maps.config';
const fields = ['googleMapsKey'];

export default ({ strapi }: { strapi: Strapi }) => ({
  async retrieve(): Promise<Config> {
    let config: Config | null;

    /* Find existing config */
    config = (await strapi.entityService.findMany(uid as never, {
      fields,
    })) as unknown as Config;

    /* Create config if not found */
    if (!config) {
      config = (await strapi.entityService.create(uid as never, {
        fields,
        data: {},
      })) as Config;
    }

    return config;
  },

  async update(data: any): Promise<Config> {
    /* Retrieve config */
    let config: Config = await this.retrieve();

    /* Update config */
    config = await strapi.entityService.update(uid as never, config.id, {
      ...data,
      fields,
    });

    return config;
  },
});
