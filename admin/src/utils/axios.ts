import axios, { AxiosInstance, AxiosResponse } from 'axios';
import pluginId from '../pluginId';
import { auth } from '@strapi/helper-plugin';
import { Config } from '../../../types';

const instance: AxiosInstance = axios.create({
  baseURL: `${process.env.STRAPI_ADMIN_BACKEND_URL}/${pluginId}`,
  headers: {
    Authorization: `Bearer ${auth.getToken()}`,
    'Content-Type': 'application/json',
  },
});

export default instance;

export const getConfig = (): Promise<AxiosResponse> => instance.get('/config');

export const updateConfig = (config: Config): Promise<AxiosResponse> =>
  instance.put('/config', {
    data: config,
  });
