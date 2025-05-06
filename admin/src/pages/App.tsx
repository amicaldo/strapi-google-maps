import { Page } from '@strapi/strapi/admin';
import { Routes, Route } from 'react-router-dom';
import SettingsPage from './Settings';


const App = () => {
    return (
        <Routes>
            <Route index element={<SettingsPage />} />
            <Route path="*" element={<Page.Error />} />
        </Routes>
    );
};

export { App };
