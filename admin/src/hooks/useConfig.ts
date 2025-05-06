import { useEffect, useState } from 'react';
import { Config, UpdateConfig } from '../../../types';
import { useFetchClient } from '@strapi/strapi/admin';
import { PLUGIN_ID } from '../pluginId';

const endpoint = `/api/${PLUGIN_ID}/config`;

export default function useConfig(token = '', newConfig?: UpdateConfig) {
    const [config, setConfig] = useState<Config | undefined | null>();
    const { get, put } = useFetchClient();

    const onResponse = ({ data }: { data: Config }) => setConfig(data);

    const onError = (error: Error) => {
        console.error(error);
        setConfig(null);
    };

    useEffect(() => {
        get(endpoint).then(onResponse).catch(onError);
    }, []);

    useEffect(() => {
        if (newConfig) {
            setConfig(undefined);

            put(endpoint, { data: newConfig }).then(onResponse).catch(onError);
        }
    }, [newConfig]);

    return config;
}