import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/PluginIcon';

export default {
    register(app: any) {
        app.createSettingSection(
            {
                id: PLUGIN_ID,
                intlLabel: {
                    id: 'settings.section-label',
                    defaultMessage: 'Google Maps',
                },
            }, // Section to create
            [
                // links
                {
                    intlLabel: {
                        id: 'settings.link-label',
                        defaultMessage: 'Configuration',
                    },
                    id: PLUGIN_ID,
                    to: `/settings/${PLUGIN_ID}`,
                    Component: () => import('./pages/Settings'),
                    permissions: [
                        { action: `plugin::${PLUGIN_ID}.config`, subject: null },
                    ],
                },
            ]
        );

        app.customFields.register({
            name: 'location-picker',
            pluginId: PLUGIN_ID,
            type: 'json',
            intlLabel: {
                id: 'input.label',
                defaultMessage: 'Location Picker',
            },
            intlDescription: {
                id: 'input.description',
                defaultMessage: 'Pick your location',
            },
            icon: PluginIcon,
            components: {
                Input: () => import('./components/Input'),
            },
            options: {
                advanced: [
                    {
                        name: 'optionsDefaultLat',
                        type: 'string',
                        intlLabel: {
                            id: 'attribute.item.default-lat',
                            defaultMessage: 'Default latitude',
                        },
                    },
                    {
                        name: 'optionsDefaultLng',
                        type: 'string',
                        intlLabel: {
                            id: 'attribute.item.default-lng',
                            defaultMessage: 'Default longitude',
                        },
                    },
                    {
                        sectionTitle: {
                            id: 'global.settings',
                            defaultMessage: 'Settings',
                        },
                        items: [
                            {
                                name: 'required',
                                type: 'checkbox',
                                intlLabel: {
                                    id: 'form.attribute.item.required-field',
                                    defaultMessage: 'Required field',
                                },
                                description: {
                                    id: 'form.attribute.item.required-field.description',
                                    defaultMessage:
                                        "You won't be able to create an entry if this field is empty",
                                },
                            },
                        ],
                    },
                ],
            },
        });

        app.registerPlugin({
            id: PLUGIN_ID,
            initializer: Initializer,
            isReady: false,
            name: PLUGIN_ID,
        });
    },

    async registerTrads({ locales }: { locales: string[] }) {
        return Promise.all(
            locales.map(async (locale) => {
                try {
                    const { default: data } = await import(`./translations/${locale}.json`);

                    return { data, locale };
                } catch {
                    return { data: {}, locale };
                }
            })
        );
    },
};
