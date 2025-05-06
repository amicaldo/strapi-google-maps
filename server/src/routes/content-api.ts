export default [
    {
        method: 'GET',
        path: '/config',
        // name of the controller file & the method.
        handler: 'config.index',
        config: {
            // TODO - Fix this
            // policies: ['admin::isAuthenticatedAdmin'],
            policies: [],
            auth: false,
        },
    },
    {
        method: 'PUT',
        path: '/config',
        handler: 'config.update',
        config: {
            // TODO - Fix this
            // policies: [
            //     'admin::isAuthenticatedAdmin',
            //     {
            //         name: 'admin::hasPermissions',
            //         config: {
            //             actions: ['plugin::google-maps.config'],
            //         },
            //     },
            // ],
            policies: [],
            auth: false,
        },
    },
];
