// Admin-only routes, served at /google-maps/config and authenticated via the admin JWT.
export default [
    {
        method: 'GET',
        path: '/config',
        handler: 'config.index',
        config: {
            // Any admin needs the key to render the location picker field.
            policies: ['admin::isAuthenticatedAdmin'],
        },
    },
    {
        method: 'PUT',
        path: '/config',
        handler: 'config.update',
        config: {
            policies: [
                'admin::isAuthenticatedAdmin',
                {
                    name: 'admin::hasPermissions',
                    config: {
                        actions: ['plugin::google-maps.config'],
                    },
                },
            ],
        },
    },
];
