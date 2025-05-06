import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { PLUGIN_ID } from '../pluginId';
import { Config } from '../../../server/src/interface';

// TODO: Replace with useFetchClient
const useAxios = (token: string): AxiosInstance => {
    const instance = axios.create({
        baseURL: `${process.env.STRAPI_ADMIN_BACKEND_URL}/api/${PLUGIN_ID}`,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Add a request interceptor to set the Authorization header dynamically
    instance.interceptors.request.use(
        async (config) => {
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    return instance;
};

export default useAxios;

export const getConfig = (token: string): Promise<AxiosResponse> => useAxios(token).get('/config');

export const updateConfig = (token: string, config: Config): Promise<AxiosResponse> =>
    useAxios(token).put('/config', {
        data: config,
    });
