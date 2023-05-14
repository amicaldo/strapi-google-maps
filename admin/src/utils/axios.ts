import axios from 'axios';
import pluginId from '../pluginId';
import { auth } from '@strapi/helper-plugin';

export default axios.create({
  baseURL: `http://localhost:1337/${pluginId}`,
  headers: {
    Authorization: `Bearer ${auth.getToken()}`,
    'Content-Type': 'application/json',
  },
});
