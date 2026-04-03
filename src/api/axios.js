// Libraries
import axios from 'axios';
// Utilities
import { serverUrl as baseURL } from '../utils';

// Public
export const axiosPublic = axios.create({ baseURL });
// Private
export const axiosPrivate = axios.create({ baseURL, withCredentials: true });
