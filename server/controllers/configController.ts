import { Strapi } from '@strapi/strapi';
import { sanitizeConfigInput } from '../content-types/config';
import { Config } from '../../types';

export default ({ strapi }: { strapi: Strapi }) => ({
  async index(ctx: any) {
    ctx.body = await strapi.plugin('google-maps').service('config').retrieve();
  },

  async update(ctx: any) {
    const data: Config = await sanitizeConfigInput(ctx.request.body, ctx);

    ctx.body = await strapi
      .plugin('google-maps')
      .service('config')
      .update(data);
  },
});
