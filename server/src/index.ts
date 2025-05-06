/**
 * Application methods
 */
import bootstrap from './bootstrap';
import register from './register';

/**
 * Plugin server methods
 */
import contentTypes from './content-types';
import controllers from './controllers';
import routes from './routes';
import services from './services';

export default {
    register,
    bootstrap,
    controllers,
    routes,
    services,
    contentTypes,
};
